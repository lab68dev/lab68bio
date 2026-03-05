#!/usr/bin/env node
/**
 * LemonSqueezy Setup Helper
 * 
 * After creating products in the LS dashboard, run this script to:
 * 1. List all products & variants
 * 2. Auto-detect Pro & Team variant IDs
 * 3. Update .env.local
 * 4. Create the webhook
 * 
 * Usage: node scripts/setup-lemonsqueezy.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { request } from "https";

const envPath = ".env.local";
const envContent = readFileSync(envPath, "utf8");
const apiKey = envContent.match(/LEMONSQUEEZY_API_KEY=(.*)/)?.[1];
const storeId = envContent.match(/LEMONSQUEEZY_STORE_ID=(.*)/)?.[1];
const webhookSecret = envContent.match(/LEMONSQUEEZY_WEBHOOK_SECRET=(.*)/)?.[1];
const appUrl = envContent.match(/NEXT_PUBLIC_APP_URL=(.*)/)?.[1];

if (!apiKey || !storeId) {
  console.error("❌ Missing LEMONSQUEEZY_API_KEY or LEMONSQUEEZY_STORE_ID in .env.local");
  process.exit(1);
}

function lsApi(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: "api.lemonsqueezy.com",
      path: `/v1${path}`,
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
    };
    const req = request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log("\n🍋 LemonSqueezy Setup Helper\n");
  console.log("━".repeat(50));

  // Step 1: List products
  console.log("\n📦 Fetching products...");
  const products = await lsApi("GET", `/products?filter[store_id]=${storeId}`);

  if (!products.data.data?.length) {
    console.log("\n⚠️  No products found in store " + storeId);
    console.log("\nPlease create 2 products in the LemonSqueezy dashboard first:");
    console.log("  👉 https://app.lemonsqueezy.com/products\n");
    console.log("Product 1: lab68 Pro");
    console.log("  • Name: lab68 Pro");
    console.log('  • Pricing: Subscription — $8.00/month');
    console.log("  • Description: Unlimited published pages, custom domains, priority support\n");
    console.log("Product 2: lab68 Team");
    console.log("  • Name: lab68 Team");
    console.log('  • Pricing: Subscription — $24.00/month');
    console.log("  • Description: Everything in Pro + team collaboration, 5 members, analytics\n");
    console.log("After creating both products, run this script again.\n");
    process.exit(0);
  }

  console.log(`  Found ${products.data.data.length} product(s):\n`);
  for (const p of products.data.data) {
    console.log(`  • [${p.id}] ${p.attributes.name} — ${p.attributes.status}`);
  }

  // Step 2: List variants
  console.log("\n🏷️  Fetching variants...");
  const variants = await lsApi("GET", `/variants?filter[store_id]=${storeId}`);

  let proVariantId = null;
  let teamVariantId = null;

  if (variants.data.data?.length) {
    console.log(`  Found ${variants.data.data.length} variant(s):\n`);
    for (const v of variants.data.data) {
      const name = v.attributes.name?.toLowerCase() || "";
      const price = v.attributes.price;
      const interval = v.attributes.interval;
      console.log(
        `  • [${v.id}] ${v.attributes.name} — $${(price / 100).toFixed(2)}/${interval || "one-time"} (product ${v.relationships?.product?.data?.id})`
      );

      // Auto-detect by price: $8/mo = Pro, $24/mo = Team
      if (price === 800 && interval === "month") proVariantId = v.id;
      else if (price === 2400 && interval === "month") teamVariantId = v.id;
      // Also try name matching as fallback
      else if (!proVariantId && name.includes("pro")) proVariantId = v.id;
      else if (!teamVariantId && (name.includes("team") || name.includes("business")))
        teamVariantId = v.id;
    }
  }

  // Step 3: Update .env.local
  if (proVariantId || teamVariantId) {
    console.log("\n✏️  Updating .env.local...");
    let updated = envContent;
    if (proVariantId) {
      updated = updated.replace(/LEMONSQUEEZY_PRO_VARIANT_ID=.*/, `LEMONSQUEEZY_PRO_VARIANT_ID=${proVariantId}`);
      console.log(`  ✅ PRO_VARIANT_ID = ${proVariantId}`);
    } else {
      console.log("  ⚠️  Could not auto-detect Pro variant (expected $8/month)");
    }
    if (teamVariantId) {
      updated = updated.replace(/LEMONSQUEEZY_TEAM_VARIANT_ID=.*/, `LEMONSQUEEZY_TEAM_VARIANT_ID=${teamVariantId}`);
      console.log(`  ✅ TEAM_VARIANT_ID = ${teamVariantId}`);
    } else {
      console.log("  ⚠️  Could not auto-detect Team variant (expected $24/month)");
    }
    writeFileSync(envPath, updated);
    console.log("  📁 .env.local updated!");
  }

  // Step 4: Create webhook
  console.log("\n🔗 Setting up webhook...");
  if (!webhookSecret) {
    console.log("  ⚠️  LEMONSQUEEZY_WEBHOOK_SECRET is empty in .env.local — skipping webhook creation");
  } else {
    // Check existing webhooks
    const webhooks = await lsApi("GET", `/webhooks?filter[store_id]=${storeId}`);
    const existing = webhooks.data.data?.find(
      (w) => w.attributes.url?.includes("/api/payments/webhook")
    );

    if (existing) {
      console.log(`  ℹ️  Webhook already exists: ${existing.attributes.url}`);
    } else {
      const webhookUrl = `${appUrl}/api/payments/webhook`;
      console.log(`  Creating webhook → ${webhookUrl}`);
      const result = await lsApi("POST", "/webhooks", {
        data: {
          type: "webhooks",
          attributes: {
            url: webhookUrl,
            secret: webhookSecret,
            events: [
              "subscription_created",
              "subscription_updated",
              "subscription_cancelled",
              "subscription_expired",
              "subscription_payment_success",
              "subscription_payment_failed",
            ],
          },
          relationships: {
            store: { data: { type: "stores", id: String(storeId) } },
          },
        },
      });

      if (result.status === 201) {
        console.log(`  ✅ Webhook created! ID: ${result.data.data?.id}`);
      } else {
        console.log(`  ⚠️  Webhook creation returned ${result.status}:`);
        console.log(`  ${JSON.stringify(result.data.errors || result.data, null, 2)}`);
        console.log("\n  Note: For local dev, the webhook URL must be publicly accessible.");
        console.log("  Use a tunnel like ngrok: ngrok http 3000");
      }
    }
  }

  // Summary
  console.log("\n" + "━".repeat(50));
  console.log("📋 Summary:\n");
  console.log(`  Store ID:       ${storeId}`);
  console.log(`  Products:       ${products.data.data.length}`);
  console.log(`  Pro Variant:    ${proVariantId || "❌ Not found"}`);
  console.log(`  Team Variant:   ${teamVariantId || "❌ Not found"}`);
  console.log(`  Webhook Secret: ${webhookSecret ? "✅ Set" : "❌ Missing"}`);
  console.log(`  App URL:        ${appUrl}`);
  console.log("\n🚀 After setup, restart your dev server: npm run dev\n");
}

main().catch(console.error);
