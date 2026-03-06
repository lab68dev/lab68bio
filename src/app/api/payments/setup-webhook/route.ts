import { NextResponse } from "next/server";
import { setupLSWebhook } from "@/lib/lemonsqueezy";

/* ------------------------------------------------------------------ */
/*  POST – Register the webhook with LemonSqueezy (idempotent)        */
/*  Call once after deployment or whenever the URL changes.            */
/* ------------------------------------------------------------------ */

export async function POST() {
    try {
        const result = await setupLSWebhook();
        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[SETUP-WEBHOOK]", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/* ------------------------------------------------------------------ */
/*  GET – Show current config for debugging                           */
/* ------------------------------------------------------------------ */

export function GET() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    return NextResponse.json({
        webhookUrl: appUrl ? `${appUrl}/api/payments/webhook` : "NEXT_PUBLIC_APP_URL not set",
        envVars: {
            LEMONSQUEEZY_API_KEY: !!process.env.LEMONSQUEEZY_API_KEY,
            LEMONSQUEEZY_STORE_ID: !!process.env.LEMONSQUEEZY_STORE_ID,
            LEMONSQUEEZY_WEBHOOK_SECRET: !!process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
            NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
        },
    });
}
