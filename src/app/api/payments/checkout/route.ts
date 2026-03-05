import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createLSCheckout, getVariantId } from "@/lib/lemonsqueezy";

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
        return NextResponse.json(
            { error: "Failed to create checkout" },
            { status: 500 }
        );
    }
}
