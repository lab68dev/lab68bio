import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createLSCheckout, getVariantId } from "@/lib/lemonsqueezy";

/* ------------------------------------------------------------------ */
/*  GET – health-check to verify env vars are set                     */
/* ------------------------------------------------------------------ */

export function GET() {
    const envStatus = {
        LEMONSQUEEZY_API_KEY: !!process.env.LEMONSQUEEZY_API_KEY,
        LEMONSQUEEZY_STORE_ID: !!process.env.LEMONSQUEEZY_STORE_ID,
        LEMONSQUEEZY_PRO_VARIANT_ID: !!process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
        LEMONSQUEEZY_TEAM_VARIANT_ID: !!process.env.LEMONSQUEEZY_TEAM_VARIANT_ID,
        NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
        AUTH_SECRET: !!process.env.AUTH_SECRET,
    };
    const allSet = Object.values(envStatus).every(Boolean);
    return NextResponse.json({
        status: allSet ? "ok" : "missing_env_vars",
        env: envStatus,
    });
}

/* ------------------------------------------------------------------ */
/*  POST – create LemonSqueezy checkout                               */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
    const user = await getSession();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const plan = body.plan as "pro" | "team";

    if (!["pro", "team"].includes(plan)) {
        return NextResponse.json(
            { error: "Invalid plan. Must be 'pro' or 'team'." },
            { status: 400 }
        );
    }

    try {
        const variantId = getVariantId(plan);
        const checkoutUrl = await createLSCheckout({
            variantId,
            userId: user.id,
            userEmail: user.email,
            userName: user.displayName || user.username,
        });

        if (!checkoutUrl) {
            return NextResponse.json(
                { error: "Failed to create checkout session" },
                { status: 500 }
            );
        }

        return NextResponse.json({ url: checkoutUrl });
    } catch (error) {
        console.error("[CHECKOUT_ERROR]", error);
        const message = error instanceof Error ? error.message : "Failed to create checkout";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
