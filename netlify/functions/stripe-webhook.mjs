// Netlify Function: stripe-webhook
// Handles 3 Stripe webhook events:
//   1. checkout.session.completed → welcome + access email
//   2. invoice.paid → renewal receipt email
//   3. customer.subscription.deleted → cancellation notice email

import Stripe from "stripe";

const SITE_URL = process.env.URL || "https://kb.snsaladdin.com";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const ACCESS_CODE = "aiknowledge2026";

const MONTHLY_FEATURES_CN = [
  "全文章无限阅读（中日双语）",
  "45+ 精选提示词无限使用（每周更新）",
  "每月 10〜15 篇更新 最新Ai技能文章",
  "每月2次3小时直播学习会",
];
const MONTHLY_FEATURES_JP = [
  "全記事読み放題（中日バイリンガル）",
  "45+ 厳選プロンプト見放題（毎週更新）",
  "毎月 10〜15 本更新 最新AIスキル記事",
  "毎月2回 3時間Live勉強会",
];
const YEARLY_EXTRA_CN = [
  "1对1 商业计划审查",
  "21天账号涨粉计划提案",
  "专属社群参与",
];
const YEARLY_EXTRA_JP = [
  "1対1 ビジネスプラン精査",
  "21日間アカウント成長計画提案",
  "専用コミュニティ参加",
];

function getPlanFromAmount(amount) {
  return amount <= 5000 ? { name: "monthly", period: "30天", periodJp: "30日", addDays: 30 } : { name: "yearly", period: "365天", periodJp: "365日", addDays: 365 };
}

function featuresHtml(isMonthly, isJp) {
  const base = isJp ? MONTHLY_FEATURES_JP : MONTHLY_FEATURES_CN;
  const extra = isJp ? YEARLY_EXTRA_JP : YEARLY_EXTRA_CN;
  let h = base.map((f) => `<li style="font-size:13px;color:#5a5650;line-height:1.8;margin:4px 0;">— ${f}</li>`).join("");
  if (isMonthly) {
    h += extra.map((f) =>
      `<li style="font-size:12px;color:#9a9490;line-height:1.8;margin:4px 0;"><s>— ${f}</s> <span style="font-size:10px;background:#f2ede5;color:#b8925a;padding:1px 8px;border-radius:10px;">${isJp ? "年額限定" : "年额限定"}</span></li>`
    ).join("");
  } else {
    h += extra.map((f) => `<li style="font-size:13px;color:#5a5650;line-height:1.8;margin:4px 0;">— ${f}</li>`).join("");
  }
  return h;
}

// ──────────────────────────────────────
//  1. Welcome email (checkout.session.completed)
// ──────────────────────────────────────
function buildWelcomeEmail(email, isMonthly, isJp) {
  const t = (cn, jp) => (isJp ? jp : cn);
  const planName = isMonthly ? t("月度方案 ¥2,980/月", "月額プラン ¥2,980/月") : t("年度方案 ¥30,000/年", "年額プラン ¥30,000/年");

  return baseEmailLayout({
    isJp,
    headerTitle: t("🎉 订阅完成！欢迎加入 AI知識庫", "🎉 購読完了！AI知識庫へようこそ"),
    headerSub: t("感谢您的订阅。以下是您的权益和访问方法。", "ご購読ありがとうございます。以下があなたの特典とアクセス方法です。"),
    planName,
    features: featuresHtml(isMonthly, isJp),
    showAccessCode: true,
    showCta: true,
  });
}

// ──────────────────────────────────────
//  2. Renewal email (invoice.paid)
// ──────────────────────────────────────
function buildRenewalEmail(email, isMonthly, isJp, nextPeriodEnd) {
  const t = (cn, jp) => (isJp ? jp : cn);
  const planName = isMonthly ? t("月度方案 ¥2,980/月", "月額プラン ¥2,980/月") : t("年度方案 ¥30,000/年", "年額プラン ¥30,000/年");
  const expiryDate = nextPeriodEnd
    ? new Date(nextPeriodEnd * 1000).toLocaleDateString(isJp ? "ja-JP" : "zh-CN", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return baseEmailLayout({
    isJp,
    headerTitle: t("✅ 续费成功", "✅ 継続課金が完了しました"),
    headerSub: isJp
      ? `ご継続ありがとうございます。次回更新日は ${expiryDate} です。`
      : `续费成功，感谢您的持续支持。下次更新日期：${expiryDate}`,
    planName,
    features: featuresHtml(isMonthly, isJp),
    showAccessCode: false,
    showCta: true,
    footerExtra: isJp
      ? `<p style="font-size:11px;color:#9a9490;line-height:1.8;margin:0 0 4px;">次回更新日: ${expiryDate}</p>`
      : `<p style="font-size:11px;color:#9a9490;line-height:1.8;margin:0 0 4px;">下次更新日期: ${expiryDate}</p>`,
  });
}

// ──────────────────────────────────────
//  3. Cancellation email (customer.subscription.deleted)
// ──────────────────────────────────────
function buildCancellationEmail(email, isMonthly, isJp, endedAt) {
  const t = (cn, jp) => (isJp ? jp : cn);
  const planName = isMonthly ? t("月度方案 ¥2,980/月", "月額プラン ¥2,980/月") : t("年度方案 ¥30,000/年", "年額プラン ¥30,000/年");
  const endDate = endedAt
    ? new Date(endedAt * 1000).toLocaleDateString(isJp ? "ja-JP" : "zh-CN", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return baseEmailLayout({
    isJp,
    headerTitle: t("您的订阅已到期", "ご購読が終了しました"),
    headerSub: isJp
      ? `${planName} のご利用期間が ${endDate} をもって終了しました。引き続きご利用いただけると嬉しいです。`
      : `${planName} 的使用期已于 ${endDate} 结束。欢迎随时重新订阅。`,
    planName,
    features: featuresHtml(isMonthly, isJp),
    showAccessCode: false,
    showCancellationCta: true,
    footerExtra: isJp
      ? `<p style="font-size:11px;color:#9a9490;line-height:1.8;margin:0 0 4px;">終了日: ${endDate}</p>`
      : `<p style="font-size:11px;color:#9a9490;line-height:1.8;margin:0 0 4px;">到期日: ${endDate}</p>`,
  });
}

// ──────────────────────────────────────
//  Shared email layout
// ──────────────────────────────────────
function baseEmailLayout({ isJp, headerTitle, headerSub, planName, features, showAccessCode, showCta, showCancellationCta, footerExtra }) {
  const t = (cn, jp) => (isJp ? jp : cn);

  let accessCodeBlock = "";
  if (showAccessCode) {
    accessCodeBlock = `
        <!-- Access Code -->
        <tr>
          <td style="padding:0 0 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f0;border:1px dashed #d4af7a;border-radius:2px;">
              <tr>
                <td style="padding:24px 32px;text-align:center;">
                  <p style="font-size:10px;letter-spacing:.12em;color:#b8925a;margin:0 0 8px;text-transform:uppercase;">${t("访问代码", "アクセスコード")}</p>
                  <p style="font-family:'Noto Serif JP',Georgia,serif;font-size:28px;font-weight:400;letter-spacing:.08em;color:#1a1814;margin:0 0 8px;user-select:all;">${ACCESS_CODE}</p>
                  <p style="font-size:11px;color:#9a9490;line-height:1.7;margin:0;">${t("在文章或提示词页面输入此代码即可解锁全部内容。", "記事やプロンプトページでこのコードを入力すると、全コンテンツが閲覧可能になります。")}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
  }

  let ctaBlock = "";
  if (showCta) {
    ctaBlock = `
        <tr>
          <td style="text-align:center;padding:0 0 28px;">
            <a href="${SITE_URL}/index.html#articles" style="display:inline-block;background:#1a1814;color:#faf9f6;font-family:'Noto Sans JP','Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:500;letter-spacing:.08em;text-decoration:none;padding:15px 40px;border-radius:2px;">${t("开始阅读 →", "記事を読む →")}</a>
          </td>
        </tr>`;
  }

  let cancellationCtaBlock = "";
  if (showCancellationCta) {
    cancellationCtaBlock = `
        <tr>
          <td style="text-align:center;padding:0 0 28px;">
            <a href="${SITE_URL}/checkout.html" style="display:inline-block;background:#b8925a;color:#fff;font-family:'Noto Sans JP','Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:500;letter-spacing:.08em;text-decoration:none;padding:15px 40px;border-radius:2px;">${t("重新订阅 →", "再購読する →")}</a>
          </td>
        </tr>`;
  }

  return `<!DOCTYPE html>
<html lang="${isJp ? "ja" : "zh-CN"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600&family=Noto+Sans+JP:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#faf9f6;font-family:'Noto Sans JP','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f6;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr>
          <td style="text-align:center;padding:0 0 36px;">
            <p style="font-family:'Noto Serif JP',Georgia,serif;font-size:13px;letter-spacing:.12em;color:#b8925a;margin:0 0 20px;">AI 知識庫</p>
            <h1 style="font-family:'Noto Serif JP',Georgia,serif;font-size:26px;font-weight:400;color:#1a1814;margin:0 0 12px;line-height:1.4;">${headerTitle}</h1>
            <p style="font-size:14px;color:#5a5650;line-height:1.8;margin:0;">${headerSub}</p>
          </td>
        </tr>

        <!-- Plan Summary -->
        <tr>
          <td style="padding:0 0 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e8e5df;border-radius:2px;">
              <tr>
                <td style="padding:28px 32px;">
                  <p style="font-family:'Noto Serif JP',Georgia,serif;font-size:16px;color:#1a1814;margin:0 0 18px;">${planName}</p>
                  <p style="font-size:11px;font-weight:500;letter-spacing:.1em;color:#b8925a;margin:0 0 12px;text-transform:uppercase;">${t("权益一览", "特典一覧")}</p>
                  <ul style="list-style:none;padding:0;margin:0;">${features}</ul>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${accessCodeBlock}
        ${ctaBlock}
        ${cancellationCtaBlock}

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid rgba(26,24,20,.1);padding-top:24px;text-align:center;">
            ${footerExtra || ""}
            <p style="font-size:11px;color:#b0aba5;line-height:1.8;margin:0 0 4px;">${t("如有疑问，请回复此邮件或访问", "ご不明な点がございましたら、このメールに返信いただくか、")}<br><a href="https://www.snsaladdin.com/" style="color:#b8925a;">SNS Aladdin</a> ${t("联系客服。", "までお問い合わせください。")}</p>
            <p style="font-size:10px;color:#c0bbb5;line-height:1.8;margin:0;">© 2026 AI知識庫 · ${t("此邮件由系统自动发送", "このメールはシステムより自動送信されています")}</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ──────────────────────────────────────
//  Helpers: get customer email from different event types
// ──────────────────────────────────────
async function getEmailFromSession(session) {
  return session.customer_details?.email || session.customer_email || null;
}

async function getEmailFromInvoice(stripe, invoice) {
  if (invoice.customer_email) return invoice.customer_email;
  if (invoice.customer) {
    try {
      const cus = await stripe.customers.retrieve(typeof invoice.customer === "string" ? invoice.customer : invoice.customer.id);
      return cus.email || null;
    } catch { return null; }
  }
  return null;
}

async function getEmailFromSubscription(stripe, subscription) {
  if (subscription.customer) {
    try {
      const cus = await stripe.customers.retrieve(typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id);
      return cus.email || null;
    } catch { return null; }
  }
  return null;
}

// ──────────────────────────────────────
//  Handler
// ──────────────────────────────────────
export default async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const sig = event.headers["stripe-signature"];
  if (!sig) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing stripe-signature header" }) };
  }

  if (!STRIPE_WEBHOOK_SECRET || !STRIPE_SECRET_KEY) {
    console.error("STRIPE keys not configured");
    return { statusCode: 500, body: JSON.stringify({ error: "Stripe keys not configured" }) };
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Signature verification failed:", err.message);
    return { statusCode: 400, body: JSON.stringify({ error: `Signature verification failed: ${err.message}` }) };
  }

  const type = stripeEvent.type;
  const data = stripeEvent.data.object;
  let email = null;
  let isMonthly = true;
  let subject = "";
  let html = "";
  let isJp = true;

  // ── Handle each event type ──
  if (type === "checkout.session.completed") {
    email = await getEmailFromSession(data);
    if (!email) {
      console.error("No email in session:", data.id);
      return { statusCode: 200, body: JSON.stringify({ error: "No email", type }) };
    }
    const amount = data.amount_total || 0;
    isMonthly = amount <= 5000;
    isJp = !(data.client_reference_id || "").includes("lang=cn");
    console.log(`[checkout.session.completed] email=${email} plan=${isMonthly ? "monthly" : "yearly"}`);
    subject = isJp
      ? `【AI知識庫】ご購読ありがとうございます — ${isMonthly ? "月額プラン" : "年額プラン"}`
      : `【AI知识库】订阅确认 — ${isMonthly ? "月度方案" : "年度方案"}`;
    html = buildWelcomeEmail(email, isMonthly, isJp);
  } else if (type === "invoice.paid") {
    email = await getEmailFromInvoice(stripe, data);
    if (!email) {
      console.error("No email in invoice:", data.id);
      return { statusCode: 200, body: JSON.stringify({ error: "No email", type }) };
    }
    const amount = data.amount_paid || data.total || 0;
    isMonthly = amount <= 5000;
    const nextPeriodEnd = data.lines?.data?.[0]?.period?.end || data.period_end;
    isJp = !(data.customer_address?.country === "CN");
    console.log(`[invoice.paid] email=${email} plan=${isMonthly ? "monthly" : "yearly"}`);

    // Skip the first invoice (handled by checkout.session.completed)
    if (data.billing_reason === "subscription_create") {
      console.log(`[invoice.paid] Skipping first invoice for ${email} (handled by checkout.session.completed)`);
      return { statusCode: 200, body: JSON.stringify({ ok: true, type, action: "skipped_first_invoice" }) };
    }

    subject = isJp
      ? `【AI知識庫】継続課金のお知らせ — ${isMonthly ? "月額プラン" : "年額プラン"}`
      : `【AI知识库】续费通知 — ${isMonthly ? "月度方案" : "年度方案"}`;
    html = buildRenewalEmail(email, isMonthly, isJp, nextPeriodEnd);
  } else if (type === "customer.subscription.deleted") {
    email = await getEmailFromSubscription(stripe, data);
    if (!email) {
      console.error("No email in subscription:", data.id);
      return { statusCode: 200, body: JSON.stringify({ error: "No email", type }) };
    }
    // Determine plan from subscription items
    const items = data.items?.data || [];
    const subAmount = items.reduce((sum, item) => sum + ((item.price?.unit_amount || 0) * (item.quantity || 1)), 0);
    isMonthly = subAmount <= 5000;
    const endedAt = data.ended_at || data.canceled_at;
    isJp = true; // default JP for cancellation
    console.log(`[customer.subscription.deleted] email=${email} plan=${isMonthly ? "monthly" : "yearly"}`);
    subject = isJp
      ? `【AI知識庫】ご購読終了のお知らせ`
      : `【AI知识库】订阅到期通知`;
    html = buildCancellationEmail(email, isMonthly, isJp, endedAt);
  } else {
    return { statusCode: 200, body: JSON.stringify({ received: true, type, action: "ignored" }) };
  }

  // ── Send email ──
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return { statusCode: 500, body: JSON.stringify({ error: "RESEND_API_KEY not configured" }) };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AI知識庫 <info@snsaladdin.com>",
        to: [email],
        subject,
        html,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("Resend error:", JSON.stringify(result));
      return { statusCode: 502, body: JSON.stringify({ error: "Resend API error", detail: result }) };
    }

    console.log(`[${type}] Email sent to ${email}: ${result.id}`);
    return { statusCode: 200, body: JSON.stringify({ ok: true, type, email_id: result.id }) };
  } catch (err) {
    console.error("Email send error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Email send failed" }) };
  }
}
