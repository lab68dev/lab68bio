import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/schema";
import { eq } from "drizzle-orm";

/* ------------------------------------------------------------------ */
/*  VERIFY WEBHOOK SIGNATURE (matches official LS Node.js example)    */
/* ------------------------------------------------------------------ */

function verifySignature(rawBody: string, signature: string): boolean {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret || !signature) return false;

    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const sigBuf = Buffer.from(signature, "utf8");

    if (digest.length !== sigBuf.length) return false;
    return crypto.timingSafeEqual(digest, sigBuf);
}

/* ------------------------------------------------------------------ */
/*  GET – health-check so you can verify the endpoint is live         */
/* ------------------------------------------------------------------ */

export function GET() {
    return NextResponse.json({
        status: "ok",
        message: "Webhook endpoint is live. LemonSqueezy sends POST requests here.",
    });
}

/* ------------------------------------------------------------------ */
/*  WEBHOOK HANDLER                                                   */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
    /* ---- 1. Read raw body ---- */
    let rawBody: string;
    try {
        rawBody = await req.text();
    } catch {
        return NextResponse.json({ error: "Could not read body" }, { status: 400 });
    }

    /* ---- 2. Verify signature ---- */
    const signature = req.headers.get("x-signature") || "";
    if (!verifySignature(rawBody, signature)) {
        console.error("[WEBHOOK] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    /* ---- 3. Parse payload ---- */
    let payload: Record<string, unknown>;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        console.error("[WEBHOOK] Invalid JSON body");
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    /* ---- 4. Validate structure ---- */
    const meta = payload.meta as Record<string, unknown> | undefined;
    const data = payload.data as Record<string, unknown> | undefined;

    if (!meta || !data) {
        console.error("[WEBHOOK] Missing meta or data in payload", { keys: Object.keys(payload) });
        return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
    }

    const eventName = meta.event_name as string;
    const attributes = data.attributes as Record<string, unknown> | undefined;

    if (!attributes) {
        console.error("[WEBHOOK] Missing data.attributes", { eventName, dataKeys: Object.keys(data) });
        return NextResponse.json({ error: "Missing data.attributes" }, { status: 400 });
    }

    const lsSubscriptionId = String(data.id);
    const customData = meta.custom_data as Record<string, unknown> | undefined;
    const userId = customData?.user_id as string | undefined;

    console.log(`[WEBHOOK] Event: ${eventName}, subscriptionId: ${lsSubscriptionId}, userId: ${userId ?? "N/A"}`);

    /* ---- 5. Handle events ---- */
    try {
        switch (eventName) {
            /* ---- NEW SUBSCRIPTION ---- */
            case "subscription_created": {
                if (!userId) {
                    console.error("[WEBHOOK] subscription_created missing user_id");
                    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
                }

                const plan =
                    Number(attributes.variant_id) === Number(process.env.LEMONSQUEEZY_TEAM_VARIANT_ID)
                        ? "team"
                        : "pro";

                await db.insert(subscriptions).values({
                    userId,
                    lemonSqueezyId: lsSubscriptionId,
                    lemonSqueezyCustomerId: String(attributes.customer_id),
                    plan,
                    status: attributes.status as string,
                    currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at as string) : null,
                    cancelAtPeriodEnd: false,
                });
                break;
            }

            /* ---- SUBSCRIPTION UPDATED (renewal, plan change, etc.) ---- */
            case "subscription_updated": {
                const plan =
                    Number(attributes.variant_id) === Number(process.env.LEMONSQUEEZY_TEAM_VARIANT_ID)
                        ? "team"
                        : "pro";

                await db
                    .update(subscriptions)
                    .set({
                        plan,
                        status: attributes.status as string,
                        currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at as string) : null,
                        cancelAtPeriodEnd: attributes.cancelled === true,
                        updatedAt: new Date(),
                    })
                    .where(eq(subscriptions.lemonSqueezyId, lsSubscriptionId));
                break;
            }

            /* ---- SUBSCRIPTION CANCELLED / EXPIRED ---- */
            case "subscription_cancelled":
            case "subscription_expired": {
                await db
                    .update(subscriptions)
                    .set({
                        status: attributes.status as string,
                        cancelAtPeriodEnd: true,
                        updatedAt: new Date(),
                    })
                    .where(eq(subscriptions.lemonSqueezyId, lsSubscriptionId));
                break;
            }

            /* ---- PAYMENT SUCCESS (one-time or recurring) ---- */
            case "subscription_payment_success": {
                await db
                    .update(subscriptions)
                    .set({
                        status: "active",
                        currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at as string) : null,
                        updatedAt: new Date(),
                    })
                    .where(eq(subscriptions.lemonSqueezyId, lsSubscriptionId));
                break;
            }

            /* ---- PAYMENT FAILED ---- */
            case "subscription_payment_failed": {
                await db
                    .update(subscriptions)
                    .set({
                        status: "past_due",
                        updatedAt: new Date(),
                    })
                    .where(eq(subscriptions.lemonSqueezyId, lsSubscriptionId));
                break;
            }

            default:
                console.log(`[WEBHOOK] Unhandled event: ${eventName}`);
        }
    } catch (err) {
        console.error("[WEBHOOK] DB error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    /* Always return 200 so LemonSqueezy doesn't retry */
    return NextResponse.json({ received: true });
}
