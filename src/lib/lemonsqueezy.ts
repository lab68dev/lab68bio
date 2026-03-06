import {
    lemonSqueezySetup,
    createCheckout,
    getSubscription,
    cancelSubscription,
    createWebhook,
    listWebhooks,
} from "@lemonsqueezy/lemonsqueezy.js";

/* ------------------------------------------------------------------ */
/*  INIT                                                               */
/* ------------------------------------------------------------------ */

let initialized = false;

function ensureInit() {
    if (initialized) return;
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) throw new Error("LEMONSQUEEZY_API_KEY is not set");
    lemonSqueezySetup({ apiKey });
    initialized = true;
}

/* ------------------------------------------------------------------ */
/*  PLAN → VARIANT MAPPING                                            */
/* ------------------------------------------------------------------ */

export function getVariantId(plan: "pro" | "team"): string {
    const map: Record<string, string | undefined> = {
        pro: process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
        team: process.env.LEMONSQUEEZY_TEAM_VARIANT_ID,
    };
    const id = map[plan];
    if (!id) throw new Error(`No variant ID configured for plan: ${plan}`);
    return id;
}

/* ------------------------------------------------------------------ */
/*  CREATE CHECKOUT                                                   */
/* ------------------------------------------------------------------ */

export async function createLSCheckout(opts: {
    variantId: string;
    userId: string;
    userEmail: string;
    userName: string;
}) {
    ensureInit();

    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    if (!storeId) throw new Error("LEMONSQUEEZY_STORE_ID is not set");

    const checkout = await createCheckout(storeId, opts.variantId, {
        checkoutData: {
            email: opts.userEmail,
            name: opts.userName,
            custom: {
                user_id: opts.userId,
            },
        },
        productOptions: {
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
        },
    });

    return checkout.data?.data.attributes.url;
}

/* ------------------------------------------------------------------ */
/*  GET SUBSCRIPTION                                                  */
/* ------------------------------------------------------------------ */

export async function getLSSubscription(subscriptionId: string) {
    ensureInit();
    const sub = await getSubscription(subscriptionId);
    return sub.data?.data;
}

/* ------------------------------------------------------------------ */
/*  CANCEL SUBSCRIPTION                                               */
/* ------------------------------------------------------------------ */

export async function cancelLSSubscription(subscriptionId: string) {
    ensureInit();
    const sub = await cancelSubscription(subscriptionId);
    return sub.data?.data;
}

/* ------------------------------------------------------------------ */
/*  SETUP WEBHOOK (idempotent – skips if already registered)          */
/* ------------------------------------------------------------------ */

export async function setupLSWebhook() {
    ensureInit();

    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!storeId) throw new Error("LEMONSQUEEZY_STORE_ID is not set");
    if (!webhookSecret) throw new Error("LEMONSQUEEZY_WEBHOOK_SECRET is not set");
    if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not set");

    const webhookUrl = `${appUrl}/api/payments/webhook`;

    const events: Parameters<typeof createWebhook>[1]["events"] = [
        "subscription_created",
        "subscription_updated",
        "subscription_cancelled",
        "subscription_expired",
        "subscription_payment_success",
        "subscription_payment_failed",
    ];

    // Check if webhook already exists for this URL
    const existing = await listWebhooks({ filter: { storeId } });
    const found = existing.data?.data.find(
        (wh) => wh.attributes.url === webhookUrl,
    );

    if (found) {
        return { status: "exists", id: found.id, url: webhookUrl };
    }

    // Signing secret must be 6-40 chars per LS docs
    const secret = webhookSecret.slice(0, 40);

    const wh = await createWebhook(storeId, {
        url: webhookUrl,
        events,
        secret,
    });

    return { status: "created", id: wh.data?.data.id, url: webhookUrl };
}
