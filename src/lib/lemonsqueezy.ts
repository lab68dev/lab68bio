import {
    lemonSqueezySetup,
    createCheckout,
    getSubscription,
    cancelSubscription,
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
