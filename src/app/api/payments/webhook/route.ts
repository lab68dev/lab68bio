import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/schema";
import { eq } from "drizzle-orm";

/* ------------------------------------------------------------------ */
/*  VERIFY WEBHOOK SIGNATURE                                          */
/* ------------------------------------------------------------------ */

function verifySignature(rawBody: string, signature: string): boolean {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret || !signature) return false;

    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(rawBody).digest("hex");

    const sigBuf = Buffer.from(signature);
    const digestBuf = Buffer.from(digest);
    if (sigBuf.length !== digestBuf.length) return false;

    return crypto.timingSafeEqual(sigBuf, digestBuf);
}

/* ------------------------------------------------------------------ */
/*  GET – health-check so you can verify the endpoint is live         */
/* ------------------------------------------------------------------ */

export function GET() {
    return NextResponse.json({ status: "ok", message: "Webhook endpoint is live. LemonSqueezy sends POST requests here." });
}

/* ------------------------------------------------------------------ */
/*  WEBHOOK HANDLER                                                   */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";

    if (!verifySignature(rawBody, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name as string;
    const lsSubscriptionId = String(payload.data.id);
    const attributes = payload.data.attributes;
    const userId = payload.meta.custom_data?.user_id as string | undefined;

    switch (eventName) {
        /* ---- NEW SUBSCRIPTION ---- */
        case "subscription_created": {
            if (!userId) {
                console.error("[WEBHOOK] subscription_created missing user_id");
                return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
            }

            const plan = attributes.variant_id === Number(process.env.LEMONSQUEEZY_TEAM_VARIANT_ID)
                ? "team"
                : "pro";

            await db.insert(subscriptions).values({
                userId,
                lemonSqueezyId: lsSubscriptionId,
                lemonSqueezyCustomerId: String(attributes.customer_id),
                plan,
                status: attributes.status,
                currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at) : null,
                cancelAtPeriodEnd: false,
            });
            break;
        }

        /* ---- SUBSCRIPTION UPDATED (renewal, plan change, etc.) ---- */
        case "subscription_updated": {
            const plan = attributes.variant_id === Number(process.env.LEMONSQUEEZY_TEAM_VARIANT_ID)
                ? "team"
                : "pro";

            await db
                .update(subscriptions)
                .set({
                    plan,
                    status: attributes.status,
                    currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at) : null,
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
                    status: attributes.status,
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
                    currentPeriodEnd: attributes.renews_at ? new Date(attributes.renews_at) : null,
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

    return NextResponse.json({ received: true });
}
