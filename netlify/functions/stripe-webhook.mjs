// Netlify Function: stripe-webhook
// Receives Stripe webhook events, verifies signature, sends welcome email on checkout.session.completed

import Stripe from "stripe";

const SITE_URL = process.env.URL || "https://kb.snsaladdin.com";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const ACCESS_CODE = "aiknowledge2026";

// Plan features by price amount
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

function buildWelcomeEmail(email, isMonthly, isJp) {
  const t = (cn, jp) => (isJp ? jp : cn);
  const planName = isMonthly
    ? t("月度方案 ¥2,980/月", "月額プラン ¥2,980/月")
    : t("年度方案 ¥30,000/年", "年額プラン ¥30,000/年");

  const baseFeatures = isJp ? MONTHLY_FEATURES_JP : MONTHLY_FEATURES_CN;
  const extraFeatures = isJp ? YEARLY_EXTRA_JP : YEARLY_EXTRA_CN;

  const featuresHtml = baseFeatures
    .map((f) => `<li style="font-size:13px;color:#5a5650;line-height:1.8;margin:4px 0;">— ${f}</li>`)
    .join("");

  const extraHtml = isMonthly
    ? extraFeatures
        .map(
          (f) =>
            `<li style="font-size:12px;color:#9a9490;line-height:1.8;margin:4px 0;"><s>— ${f}</s> <span style="font-size:10px;background:#f2ede5;color:#b8925a;padding:1px 8px;border-radius:10px;">${
              isJp ? "年額限定" : "年额限定"
            }</span></li>`
        )
        .join("")
    : extraFeatures
        .map((f) => `<li style="font-size:13px;color:#5a5650;line-height:1.8;margin:4px 0;">— ${f}</li>`)
        .join("");

  const headerTitle = t("🎉 订阅完成！欢迎加入 AI知識庫", "🎉 購読完了！AI知識庫へようこそ");
  const headerSub = t(
    "感谢您的订阅。以下是您的权益和访问方法。",
    "ご購読ありがとうございます。以下があなたの特典とアクセス方法です。"
  );

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
                  <ul style="list-style:none;padding:0;margin:0;">${featuresHtml}${extraHtml}</ul>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Access Code -->
        <tr>
          <td style="padding:0 0 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f0;border:1px dashed #d4af7a;border-radius:2px;">
              <tr>
                <td style="padding:24px 32px;text-align:center;">
                  <p style="font-size:10px;letter-spacing:.12em;color:#b8925a;margin:0 0 8px;text-transform:uppercase;">${t("访问代码", "アクセスコード")}</p>
                  <p style="font-family:'Noto Serif JP',Georgia,serif;font-size:28px;font-weight:400;letter-spacing:.08em;color:#1a1814;margin:0 0 8px;user-select:all;">${ACCESS_CODE}</p>
                  <p style="font-size:11px;color:#9a9490;line-height:1.7;margin:0;">${t("在文章或提示词页面输入此代码即可解锁全部内容。", "記事やプロンプトページでこのコードを入力すると、全コンテンツのロックが解除されます。")}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="text-align:center;padding:0 0 36px;">
            <a href="${SITE_URL}/index.html#articles" style="display:inline-block;background:#1a1814;color:#faf9f6;font-family:'Noto Sans JP','Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:500;letter-spacing:.08em;text-decoration:none;padding:15px 40px;border-radius:2px;">${t("开始阅读 →", "記事を読む →")}</a>
          </td>
        </tr>

        <!-- CTA 2: Prompts -->
        <tr>
          <td style="text-align:center;padding:0 0 36px;">
            <a href="${SITE_URL}/prompts/" style="display:inline-block;background:transparent;color:#b8925a;border:1px solid #b8925a;font-family:'Noto Sans JP','Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:500;letter-spacing:.08em;text-decoration:none;padding:14px 38px;border-radius:2px;">${t("浏览提示词库 →", "プロンプトライブラリを見る →")}</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid rgba(26,24,20,.1);padding-top:24px;text-align:center;">
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

export default async function handler(event) {
  // Only accept POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Verify Stripe webhook signature
  const sig = event.headers["stripe-signature"];
  if (!sig) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing stripe-signature header" }) };
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return { statusCode: 500, body: JSON.stringify({ error: "Webhook secret not configured" }) };
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return { statusCode: 400, body: JSON.stringify({ error: `Signature verification failed: ${err.message}` }) };
  }

  // Only handle checkout.session.completed
  if (stripeEvent.type !== "checkout.session.completed") {
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, type: stripeEvent.type, action: "ignored" }),
    };
  }

  const session = stripeEvent.data.object;
  const email = session.customer_details?.email || session.customer_email;
  if (!email) {
    console.error("No email in session:", session.id);
    return { statusCode: 200, body: JSON.stringify({ error: "No email in session", session_id: session.id }) };
  }

  const amount = session.amount_total || 0;
  const isMonthly = amount <= 3000; // ¥2,980 → monthly, ¥30,000 → yearly

  // Determine language: default to Japanese unless checkout was from Chinese browser
  const clientRef = session.client_reference_id || "";
  const isJp = !clientRef.includes("lang=cn");

  console.log(`Processing checkout.session.completed: email=${email}, amount=${amount}, plan=${isMonthly ? "monthly" : "yearly"}`);

  // Send welcome email via Resend
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
        subject: isJp
          ? `【AI知識庫】ご購読ありがとうございます — ${isMonthly ? "月額プラン" : "年額プラン"}`
          : `【AI知识库】订阅确认 — ${isMonthly ? "月度方案" : "年度方案"}`,
        html: buildWelcomeEmail(email, isMonthly, isJp),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", JSON.stringify(data));
      return { statusCode: 502, body: JSON.stringify({ error: "Resend API error", detail: data }) };
    }

    console.log(`Welcome email sent to ${email}: ${data.id}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, email_id: data.id, plan: isMonthly ? "monthly" : "yearly" }),
    };
  } catch (err) {
    console.error("Email send error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Email send failed" }) };
  }
}
