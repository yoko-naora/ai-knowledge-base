// send-weekly-update.mjs
// 周一上午手动运行：自动提取 Stripe 付费用户 → 扫描本周新文章+提示词 → 生成 HTML 邮件 → 发送
//
// 用法:
//   npm run send-weekly -- --preview    预览邮件（不发）
//   npm run send-weekly                 发送给所有付费用户
//   npm run send-weekly -- --dry-run    显示订阅者但不发送
//
// 稳定后设置自动: crontab / GitHub Actions schedule

import Stripe from "stripe";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SITE_URL = "https://kb.snsaladdin.com";
const STATE_FILE = resolve(ROOT, "scripts", ".sent-state.json");
const PROMPTS_FILE = resolve(ROOT, "prompts", "data.json");
const ARTICLES_DIR = resolve(ROOT, "articles");

const RESEND_KEY = process.env.RESEND_API_KEY;
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

// ── CLI ──────────────────────────────────────────────
const args = process.argv.slice(2);
const PREVIEW = args.includes("--preview");
const DRY_RUN = args.includes("--dry-run");
const INIT = args.includes("--init");
const SEND = !PREVIEW && !DRY_RUN && !INIT;

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
AI知識庫 · 週次更新メール送信ツール
─────────────────────────────────────
使い方:
  npm run send-weekly -- --preview    今週の更新内容をプレビュー（メール送信なし）
  npm run send-weekly -- --dry-run    購読者一覧を確認のみ
  npm run send-weekly                 すべての有料購読者にメール送信
  npm run send-weekly -- --init       現在の全コンテンツを「送信済み」にマーク（初回のみ）

初回セットアップ:
  1. .env ファイルに STRIPE_SECRET_KEY を設定
  2. npm run send-weekly -- --preview  で内容を確認
  3. npm run send-weekly -- --init     でベースラインを設定
  4. 次回以降、npm run send-weekly -- --preview → npm run send-weekly で送信
`);
  process.exit(0);
}

// ── Helpers ──────────────────────────────────────────
function t(cn, jp, isJp) {
  return isJp ? jp : cn;
}

function extractArticleMeta(filePath) {
  const html = readFileSync(filePath, "utf8");
  const num = filePath.match(/(\d+)\.html$/)?.[1] || "";

  // h1 — extract from <h1> tag, then find CN/JP inside
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  let titleCN = "";
  let titleJP = "";
  if (h1Match) {
    const cnM = h1Match[1].match(/lang-content cn[^>]*>([^<]+)</);
    const jpM = h1Match[1].match(/lang-content jp[^>]*>([^<]+)</);
    titleCN = cnM ? cnM[1] : "";
    titleJP = jpM ? jpM[1] : titleCN;
  }

  // Date — from .meta div. Supports both "2026-05-06" and "Wed May 06" formats
  const metaMatch = html.match(/class="meta"[^>]*>([\s\S]*?)<\/div>/);
  let date = "";
  if (metaMatch) {
    // Try ISO format first
    const iso = metaMatch[1].match(/(\d{4}-\d{2}-\d{2})/);
    if (iso) {
      date = iso[1];
    } else {
      // Try "Wed May 06" / "Mon Apr 28" format — assume current year (2026)
      const eng = metaMatch[1].match(/(\w{3})\s+(\w{3})\s+(\d{2})/);
      if (eng) {
        const months = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
        const mm = months[eng[2]] || "01";
        date = `2026-${mm}-${eng[3]}`;
      }
    }
  }

  // Author — from .meta div
  let author = "";
  if (metaMatch) {
    const a = metaMatch[1].match(/@([a-zA-Z0-9_]+)/);
    author = a ? "@" + a[1] : "";
  }

  // Excerpt — first meaningful paragraph after the hero section (after </nav> or <section class="article-hero">)
  let excerptCN = "";
  let excerptJP = "";
  const bodyStart = html.indexOf('<section class="article-hero">');
  if (bodyStart > 0) {
    const afterHero = html.substring(bodyStart);
    // Find first <p> after hero that has CJK content
    const pMatch = afterHero.match(/<p[^>]*>([\s\S]*?)<\/p>/g);
    if (pMatch) {
      for (const p of pMatch) {
        const text = p.replace(/<[^>]+>/g, "").trim();
        if (text.length > 30) {
          excerptCN = text.substring(0, 120);
          break;
        }
      }
    }
  }
  // JP excerpt — try to find in article body
  const jpBodyMatch = html.match(/lang-content jp[^>]*>([぀-ゟ゠-ヿｦ-ﾟ][^<]{30,120})<\/span>/);
  excerptJP = jpBodyMatch ? jpBodyMatch[1].trim() : excerptCN;

  return { num, titleCN, titleJP, date, author, excerptCN, excerptJP };
}

function extractPromptMeta(p) {
  return {
    id: p.id,
    titleCN: (p.text || "").replace(/\n/g, " ").substring(0, 60),
    titleJP: (p.text_ja || p.text || "").replace(/\n/g, " ").substring(0, 60),
    catCN: p.cat || "",
    catJP: catMapJP[p.cat] || p.cat || "",
    date: p.date || "",
    img: (p.images && p.images[0]) ? p.images[0] : "",
  };
}

const catMapJP = {
  "电商/商业海报": "EC/商業ポスター",
  "穿搭/形象/造型": "着こなし/イメージ/スタイリング",
  "教育/科普/图解": "教育/科学/図解",
  "视频制作/Seedance": "動画制作/Seedance",
  "品牌/VI/包装": "ブランド/VI/パッケージ",
  "游戏/娱乐/影视": "ゲーム/エンタメ/映像",
  "全景/3D/空间": "パノラマ/3D/空間",
  "健康/生活/实用工具": "健康/生活/実用ツール",
  "其他/教育": "その他/教育",
  "其他/闲聊": "その他/雑談",
};

// ── State ────────────────────────────────────────────
function loadState() {
  if (!existsSync(STATE_FILE)) {
    return { lastSendDate: null, sentArticles: [], sentPrompts: [] };
  }
  return JSON.parse(readFileSync(STATE_FILE, "utf8"));
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

// ── Content Discovery ────────────────────────────────
function scanArticles() {
  const files = readdirSync(ARTICLES_DIR)
    .filter((f) => /^\d+\.html$/.test(f))
    .sort();
  return files.map((f) => extractArticleMeta(resolve(ARTICLES_DIR, f)));
}

function scanPrompts() {
  if (!existsSync(PROMPTS_FILE)) return [];
  const data = JSON.parse(readFileSync(PROMPTS_FILE, "utf8"));
  return data.filter((p) => p.date).map(extractPromptMeta);
}

function findNewContent() {
  const state = loadState();
  const allArticles = scanArticles();
  const allPrompts = scanPrompts();

  // New articles: those not in sentArticles
  const newArticles = allArticles.filter((a) => !state.sentArticles.includes(a.num) && a.date);

  // New prompts: those with date after last send (or not in sentPrompts)
  const newPrompts = allPrompts.filter((p) => {
    if (state.sentPrompts.includes(p.id)) return false;
    if (state.lastSendDate && p.date < state.lastSendDate) return false;
    return true;
  });

  return { state, newArticles, newPrompts, allArticles, allPrompts };
}

// ── Email Builder ────────────────────────────────────
function buildEmail(newArticles, newPrompts, isJp) {
  const weekLabel = t("本周更新", "今週の更新", isJp);
  const date = new Date().toISOString().slice(0, 10);
  const subject = t(
    `【AI知识库】本周更新 · ${date}${newArticles.length ? ` — ${newArticles.length}篇新文章` : ""}`,
    `【AI知識庫】今週の更新 · ${date}${newArticles.length ? ` — ${newArticles.length}本の新着記事` : ""}`,
    isJp
  );

  let articlesHTML = "";
  if (newArticles.length > 0) {
    const articlesTitle = t("📖 新着記事", "📖 新着記事", isJp);
    const cards = newArticles
      .map(
        (a) => `
      <tr>
        <td style="padding:0 0 20px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e5df;border-radius:2px;background:#fff;">
            <tr>
              <td style="padding:20px 24px;">
                <span style="display:inline-block;background:#f2ede5;color:#b8925a;font-size:9px;letter-spacing:.16em;padding:2px 8px;border-radius:2px;margin-bottom:8px;">No.${a.num}</span>
                <h3 style="font-family:'Noto Serif JP',Georgia,serif;font-size:16px;font-weight:400;color:#1a1814;margin:0 0 6px;line-height:1.5;">${t(a.titleCN, a.titleJP, isJp)}</h3>
                <p style="font-size:12px;color:#5a5650;line-height:1.7;margin:0 0 10px;">${t(a.excerptCN, a.excerptJP, isJp)}</p>
                <a href="${SITE_URL}/articles/${a.num}.html" style="font-size:11px;color:#b8925a;text-decoration:none;font-weight:500;">${t("阅读全文 →", "全文を読む →", isJp)}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
      )
      .join("");

    articlesHTML = `
      <tr>
        <td style="padding:0 0 8px 0;">
          <h2 style="font-family:'Noto Serif JP',Georgia,serif;font-size:18px;font-weight:400;color:#1a1814;margin:0 0 20px;padding-bottom:10px;border-bottom:2px solid #b8925a;">${articlesTitle}</h2>
        </td>
      </tr>
      ${cards}`;
  }

  let promptsHTML = "";
  if (newPrompts.length > 0) {
    const promptsTitle = t("🎨 新着プロンプト", "🎨 新着プロンプト", isJp);
    const cards = newPrompts
      .slice(0, 6)
      .map(
        (p) => `
      <tr>
        <td style="padding:0 0 20px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e5df;border-radius:2px;background:#fff;">
            <tr>
              <td style="padding:0;text-align:center;">
                ${p.img ? `<img src="${SITE_URL}/prompts/${p.img}" alt="" style="width:100%;max-width:500px;height:auto;display:block;">` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;">
                <span style="display:inline-block;background:#f2ede5;color:#9a9490;font-size:9px;letter-spacing:.08em;padding:2px 8px;border-radius:2px;margin-bottom:6px;">${t(p.catCN, p.catJP, isJp)}</span>
                <p style="font-size:13px;color:#1a1814;line-height:1.6;margin:0;">${t(p.titleCN, p.titleJP, isJp)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
      )
      .join("");

    promptsHTML = `
      <tr>
        <td style="padding:20px 0 8px 0;">
          <h2 style="font-family:'Noto Serif JP',Georgia,serif;font-size:18px;font-weight:400;color:#1a1814;margin:0 0 20px;padding-bottom:10px;border-bottom:2px solid #b8925a;">${promptsTitle}</h2>
        </td>
      </tr>
      ${cards}`;
  }

  const headerDesc = t(
    `AI知識庫 今週の更新をお届けします。${newArticles.length ? `新着記事 ${newArticles.length} 本` : ""}${newPrompts.length ? `、新着プロンプト ${newPrompts.length} 件` : ""}。`,
    `AI知識庫 今週の更新をお届けします。${newArticles.length ? `新着記事 ${newArticles.length} 本` : ""}${newPrompts.length ? `、新着プロンプト ${newPrompts.length} 件` : ""}。`
  );

  const html = `<!DOCTYPE html>
<html lang="${isJp ? "ja" : "zh-CN"}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#faf9f6;font-family:'Noto Sans JP','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f6;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="padding:0 0 32px 0;text-align:center;">
            <p style="font-family:'Noto Serif JP',Georgia,serif;font-size:14px;letter-spacing:.12em;color:#b8925a;margin:0 0 16px;">AI 知識庫</p>
            <h1 style="font-family:'Noto Serif JP',Georgia,serif;font-size:24px;font-weight:400;color:#1a1814;margin:0 0 10px;line-height:1.4;">${weekLabel}</h1>
            <p style="font-size:13px;color:#5a5650;line-height:1.8;margin:0;">${date} — ${headerDesc}</p>
          </td>
        </tr>

        ${articlesHTML}
        ${promptsHTML}

        ${!newArticles.length && !newPrompts.length ? `
        <tr>
          <td style="padding:20px 0;text-align:center;">
            <p style="font-size:14px;color:#5a5650;">${t("本周暂无新内容。随时访问网站查看最新更新。", "今週の新着コンテンツはありません。最新情報はウェブサイトでご確認ください。", isJp)}</p>
          </td>
        </tr>` : ""}

        <!-- CTA -->
        <tr>
          <td style="text-align:center;padding:12px 0 40px;">
            <a href="${SITE_URL}" style="display:inline-block;background:#1a1814;color:#faf9f6;font-size:13px;font-weight:500;letter-spacing:.08em;text-decoration:none;padding:15px 40px;border-radius:2px;">${t("访问 AI知識庫 →", "AI知識庫を見る →", isJp)}</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid rgba(26,24,20,.1);padding-top:24px;">
            <p style="font-size:10px;color:#b0aba5;line-height:1.8;margin:0;">${t("此邮件发送给 AI知識庫 付费订阅者。如需退订，请回复此邮件。", "このメールはAI知識庫の有料購読者向けに送信されています。配信停止はこのメールに返信してください。", isJp)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, html };
}

// ── Stripe ───────────────────────────────────────────
async function getSubscribers() {
  console.log("🔍 Stripe から有料購読者を取得中...\n");
  const stripe = new Stripe(STRIPE_KEY);
  const customers = new Map();

  for await (const sub of stripe.subscriptions.list({ status: "active", limit: 100 })) {
    const custId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
    if (!custId || customers.has(custId)) continue;
    try {
      const cust = await stripe.customers.retrieve(custId);
      if (!cust.deleted && cust.email) {
        customers.set(custId, { email: cust.email, name: cust.name || "" });
      }
    } catch {
      // skip
    }
  }
  return [...customers.values()];
}

// ── Main ─────────────────────────────────────────────
async function main() {
  // ── INIT mode: mark everything as sent ──
  if (INIT) {
    const allArticles = scanArticles();
    const allPrompts = scanPrompts();
    const state = {
      lastSendDate: new Date().toISOString(),
      sentArticles: allArticles.map((a) => a.num),
      sentPrompts: allPrompts.map((p) => p.id),
    };
    saveState(state);
    console.log("✅ ベースラインを設定しました！");
    console.log(`   ${state.sentArticles.length} 記事を「送信済み」にマーク`);
    console.log(`   ${state.sentPrompts.length} プロンプトを「送信済み」にマーク`);
    console.log(`   次回からは新しいコンテンツのみが検出されます。`);
    process.exit(0);
  }

  // 1. Find new content
  console.log("📂 更新コンテンツをスキャン中...\n");
  const { state, newArticles, newPrompts } = findNewContent();

  console.log(`   新着記事:   ${newArticles.length} 本`);
  newArticles.forEach((a) => console.log(`     #${a.num}  ${a.titleCN}  (${a.date})`));

  console.log(`   新着プロンプト: ${newPrompts.length} 件`);
  newPrompts.slice(0, 6).forEach((p) => console.log(`     #${p.id}  ${p.titleCN.substring(0, 50)}`));

  // 2. Check key availability
  const keyErrors = [];
  if (!RESEND_KEY || RESEND_KEY === "re_xxxxxxxxxxxx") keyErrors.push("RESEND_API_KEY");
  if (!SEND && !DRY_RUN) {
    // Preview mode: show email content without checking keys or Stripe
    const emailCN = buildEmail(newArticles, newPrompts, false);
    const emailJP = buildEmail(newArticles, newPrompts, true);

    console.log("\n📧 プレビュー（中国語版）:");
    console.log(`   Subject: ${emailCN.subject}`);
    console.log(`   HTML: ${emailCN.html.length} chars`);

    console.log("\n📧 プレビュー（日本語版）:");
    console.log(`   Subject: ${emailJP.subject}`);
    console.log(`   HTML: ${emailJP.html.length} chars`);

    // Save preview to file
    const previewFile = resolve(ROOT, "scripts", ".email-preview.html");
    writeFileSync(previewFile, emailCN.html, "utf8");
    console.log(`\n   HTMLプレビューを保存: scripts/.email-preview.html`);
    console.log("\n🧪 プレビューモード — メールは送信されていません。");
    console.log(`   有料購読者数確認には --dry-run を使用してください。`);
    console.log(`   Stripeキー設定後、 npm run send-weekly で送信できます。`);
    process.exit(0);
  }

  if (!STRIPE_KEY || STRIPE_KEY === "sk_live_xxxxxxxxxxxx") keyErrors.push("STRIPE_SECRET_KEY");
  if (keyErrors.length) {
    console.error(`\n❌ 環境変数未設定: ${keyErrors.join(", ")}`);
    process.exit(1);
  }

  // 3. Get subscribers
  let subscribers;
  try {
    subscribers = await getSubscribers();
  } catch (e) {
    console.error(`\n❌ Stripe API エラー: ${e.message}`);
    process.exit(1);
  }

  if (subscribers.length === 0) {
    console.log("\n⚠️  有料購読者が見つかりませんでした。");
    process.exit(0);
  }

  console.log(`\n📧 有料購読者 ${subscribers.length} 名:`);
  subscribers.forEach((c) => console.log(`   - ${c.email}${c.name ? ` (${c.name})` : ""}`));

  // 4. Dry run
  if (DRY_RUN) {
    console.log("\n🧪 DRY RUN — メール送信なし。購読者確認のみ。");
    process.exit(0);
  }

  // Build both language versions
  const emailCN = buildEmail(newArticles, newPrompts, false);
  const emailJP = buildEmail(newArticles, newPrompts, true);

  // 5. SEND
  if (SEND) {
    if (newArticles.length === 0 && newPrompts.length === 0) {
      console.log("\n⚠️  新着コンテンツがありません。送信をスキップします。");
      console.log("   どうしても送信したい場合は --force を追加してください。");
      process.exit(0);
    }

    console.log(`\n📨 ${subscribers.length} 名にメール送信中...\n`);
    let sent = 0;
    let failed = 0;

    for (const cust of subscribers) {
      const isJp = cust.email.endsWith(".jp");
      const email = isJp ? emailJP : emailCN;

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
            subject: email.subject,
            html: email.html,
          }),
        });

        if (res.ok) {
          sent++;
          console.log(`   ✅ ${cust.email}`);
        } else {
          failed++;
          const err = await res.json();
          console.warn(`   ❌ ${cust.email}: ${err.message || "Unknown"}`);
        }
      } catch (e) {
        failed++;
        console.warn(`   ❌ ${cust.email}: ${e.message}`);
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`\n✨ 送信完了！ 成功: ${sent}, 失敗: ${failed}`);

    // Update state
    state.lastSendDate = new Date().toISOString();
    state.sentArticles = [...new Set([...state.sentArticles, ...newArticles.map((a) => a.num)])];
    state.sentPrompts = [...new Set([...state.sentPrompts, ...newPrompts.map((p) => p.id)])];
    saveState(state);
    console.log("📝 送信状態を保存しました (scripts/.sent-state.json)");
  }
}

// ── Run ──────────────────────────────────────────────
console.log("═══════════════════════════════════════");
console.log("  AI知識庫 · 週次更新メール");
console.log(`  ${PREVIEW ? "📧 プレビューモード" : DRY_RUN ? "🧪 ドライラン" : "📨 送信モード"}`);
console.log("═══════════════════════════════════════\n");

main().catch((e) => {
  console.error("\n💥 エラー:", e.message);
  process.exit(1);
});
