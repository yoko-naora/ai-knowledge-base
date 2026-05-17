// send-weekly-update.mjs
// Manual script: sends update email to all active Stripe subscribers via Resend
// Usage: npm run send-weekly -- scripts/weekly-update.json

import Stripe from "stripe";
import { readFileSync, existsSync } from "fs";

const RESEND_KEY = process.env.RESEND_API_KEY;
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

if (!RESEND_KEY || RESEND_KEY === "re_xxxxxxxxxxxx") {
  console.error("❌ RESEND_API_KEY not set. Add it to .env file.");
  process.exit(1);
}
if (!STRIPE_KEY || STRIPE_KEY === "sk_live_xxxxxxxxxxxx") {
  console.error("❌ STRIPE_SECRET_KEY not set. Add it to .env file.");
  process.exit(1);
}

// Read update content from JSON file (first CLI arg or default)
const configPath = process.argv[2] || "scripts/weekly-update.json";
if (!existsSync(configPath)) {
  console.error(`❌ Config file not found: ${configPath}`);
  console.error("Create a weekly-update.json with: subject_cn, subject_jp, body_cn, body_jp");
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, "utf8"));
const { subject_cn, subject_jp, body_cn, body_jp, test_mode } = config;

if (!subject_cn || !body_cn) {
  console.error("❌ Config must include: subject_cn, body_cn, subject_jp, body_jp");
  process.exit(1);
}

function buildUpdateEmail(isJp) {
  const t = (cn, jp) => (isJp ? jp : cn);
  return `<!DOCTYPE html>
<html lang="${isJp ? "ja" : "zh-CN"}">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#faf9f6;font-family:'Noto Sans JP','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f6;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr>
          <td style="padding:0 0 36px 0;text-align:center;">
            <p style="font-family:'Noto Serif JP',Georgia,serif;font-size:13px;letter-spacing:.12em;color:#b8925a;margin:0 0 20px;">AI 知識庫</p>
            <h1 style="font-family:'Noto Serif JP',Georgia,serif;font-size:22px;font-weight:400;color:#1a1814;margin:0 0 8px;line-height:1.4;">${t(subject_cn, subject_jp)}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 32px 0;background:#fff;border:1px solid #e8e5df;border-radius:2px;">
            <div style="padding:32px 28px;font-size:14px;color:#3a3530;line-height:2.0;">
              ${t(body_cn, body_jp).replace(/\n/g, "<br>")}
            </div>
          </td>
        </tr>
        <tr>
          <td style="text-align:center;padding:8px 0 20px;">
            <a href="https://kb.snsaladdin.com" style="display:inline-block;background:#1a1814;color:#faf9f6;font-family:'Noto Sans JP','Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:500;letter-spacing:.08em;text-decoration:none;padding:15px 40px;border-radius:2px;">${t("查看最新内容 →", "最新コンテンツを見る →")}</a>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid rgba(26,24,20,.1);padding-top:24px;">
            <p style="font-size:11px;color:#b0aba5;line-height:1.8;margin:0;">${t("※ 此邮件由 AI知識庫 (kb.snsaladdin.com) 发送给付费订阅者。如需退订，请回复此邮件。", "※ このメールはAI知識庫 (kb.snsaladdin.com) より有料購読者向けに送信されています。配信停止はこのメールに返信してください。")}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

const stripe = new Stripe(STRIPE_KEY);

async function main() {
  console.log("🔍 Fetching active Stripe subscriptions...");

  const customers = new Map();

  // Fetch all active subscriptions with customer data
  for await (const sub of stripe.subscriptions.list({ status: "active", limit: 100 })) {
    const custId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
    if (!custId || customers.has(custId)) continue;

    try {
      const cust = await stripe.customers.retrieve(custId);
      if (cust.email) {
        customers.set(custId, { email: cust.email, name: cust.name });
      }
    } catch (e) {
      console.warn(`  ⚠️  Could not retrieve customer ${custId}`);
    }
  }

  if (customers.size === 0) {
    console.log("⚠️  No active subscribers found.");
    return;
  }

  const emails = [...customers.values()];
  console.log(`📧 Found ${emails.length} active subscribers:`);
  emails.forEach((c) => console.log(`   - ${c.email}${c.name ? ` (${c.name})` : ""}`));

  if (test_mode) {
    console.log("\n🧪 TEST MODE — no emails sent. Set test_mode to false in config to send.");
    console.log("   Preview subject:", subject_cn);
    console.log("   Preview body:", body_cn.substring(0, 100) + "...");
    return;
  }

  console.log("\n📨 Sending update emails...");
  let sent = 0;
  let failed = 0;

  for (const cust of emails) {
    // Detect language preference from email domain (.jp = Japanese)
    const isJp = cust.email.endsWith(".jp");

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "AI知識庫 <info@snsaladdin.com>",
          to: [cust.email],
          subject: isJp ? subject_jp : subject_cn,
          html: buildUpdateEmail(isJp),
        }),
      });

      if (res.ok) {
        sent++;
        console.log(`   ✅ ${cust.email}`);
      } else {
        failed++;
        const err = await res.json();
        console.warn(`   ❌ ${cust.email}:`, err.message || "Unknown error");
      }
    } catch (e) {
      failed++;
      console.warn(`   ❌ ${cust.email}:`, e.message);
    }

    // Rate limit: 10 emails/second (Resend free tier)
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\n✨ Done! Sent: ${sent}, Failed: ${failed}`);
}

main().catch((e) => {
  console.error("Fatal error:", e.message);
  process.exit(1);
});
