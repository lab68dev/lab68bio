const http = require("http");
const BASE = "http://localhost:3000";
let authCookie = "";
const results = [];

function req(method, path, body, useCookie) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: "localhost",
      port: 3000,
      path,
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (useCookie && authCookie) opts.headers.Cookie = authCookie;
    const r = http.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        const cookies = res.headers["set-cookie"];
        if (cookies) {
          for (const c of cookies) {
            if (c.startsWith("session=")) authCookie = c.split(";")[0];
          }
        }
        try {
          resolve({ status: res.statusCode, data: JSON.parse(d) });
        } catch {
          resolve({ status: res.statusCode, data: d });
        }
      });
    });
    r.on("error", reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

function log(name, pass, detail) {
  const icon = pass ? "PASS" : "FAIL";
  console.log(`${icon} ${name} — ${detail}`);
  results.push({ name, pass });
}

async function main() {
  console.log("\nPayment Flow Tests");
  console.log("=".repeat(60));

  // 1. Checkout without auth
  const t1 = await req("POST", "/api/payments/checkout", { plan: "pro" });
  log("Checkout without auth → 401", t1.status === 401, `status=${t1.status}`);

  // 2. Subscription without auth
  const t2 = await req("GET", "/api/payments/subscription");
  log("Sub without auth → 401", t2.status === 401, `status=${t2.status}`);

  // 3. Login
  const t3 = await req("POST", "/api/auth/login", {
    email: "testuser@lab68.dev",
    password: "TestPass123!",
  });
  log("Login", t3.status === 200 && !!authCookie, `status=${t3.status}`);

  // 4. Free plan check
  const t4 = await req("GET", "/api/payments/subscription", null, true);
  log("Free user plan", t4.status === 200 && t4.data.plan === "free", `plan=${t4.data?.plan}`);

  // 5. Invalid plan
  const t5 = await req("POST", "/api/payments/checkout", { plan: "invalid" }, true);
  log("Invalid plan → 400", t5.status === 400, `status=${t5.status}`);

  // 6. Pro checkout URL
  const t6 = await req("POST", "/api/payments/checkout", { plan: "pro" }, true);
  const proUrl = t6.data?.url;
  log(
    "Pro checkout URL",
    t6.status === 200 && proUrl?.includes("lemonsqueezy"),
    proUrl ? proUrl.substring(0, 65) + "..." : JSON.stringify(t6.data)
  );

  // 7. Team checkout URL
  const t7 = await req("POST", "/api/payments/checkout", { plan: "team" }, true);
  const teamUrl = t7.data?.url;
  log(
    "Team checkout URL",
    t7.status === 200 && teamUrl?.includes("lemonsqueezy"),
    teamUrl ? teamUrl.substring(0, 65) + "..." : JSON.stringify(t7.data)
  );

  // 8. Webhook signature validation
  const t8 = await req("POST", "/api/payments/webhook", {
    meta: { event_name: "test" },
  });
  log("Webhook bad sig → 401", t8.status === 401, `status=${t8.status}`);

  // Summary
  const passed = results.filter((r) => r.pass).length;
  console.log("=".repeat(60));
  console.log(`Results: ${passed}/${results.length} passed\n`);
}

main().catch(console.error);
