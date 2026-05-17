// Netlify Function: send-lead-email
// Triggered when free user submits email in lead magnet form
// Sends 5 curated prompts via Resend, then client redirects to free-prompts.html

const SITE_URL = process.env.URL || "https://kb.snsaladdin.com";

// 5 curated prompts matching free-prompts.html
const PROMPTS = [
  {
    num: 1,
    title_cn: "几何饮品主图海报",
    title_jp: "幾何学ドリンクメイン画像ポスター",
    cat_cn: "电商/商业海报",
    cat_jp: "EC/商業ポスター",
    desc_cn: "ChatGPT-Image2 一键生成品牌级饮品海报。真实产品摄影感 + 平面几何设计 + 超现实风味可视化，还能自动生成符合品牌调性的模特形象。4套不同品牌实例可直接复用。",
    desc_jp: "ChatGPT-Image2でブランド級ドリンクポスターを一键生成。リアルな製品写真感+平面幾何学デザイン+超現実的フレーバー視覚化。ブランドイメージに合ったモデルも自動生成。4ブランド实例をそのまま流用可能。",
    img: "prompts/images/MrLarus_2050573342860616117_1.jpg",
  },
  {
    num: 2,
    title_cn: "AI衣品升级改造报告",
    title_jp: "AI衣品アップグレードレポート",
    cat_cn: "穿搭/形象/造型",
    cat_jp: "着こなし/イメージ/スタイリング",
    desc_cn: "上传一张照片，生成横向4:3高完成度「Before & After」穿搭升级报告。保留本人脸部辨识度的前提下，韩系轻潮、Clean Fit、City Boy路线，含9大专业模块。",
    desc_jp: "写真を1枚アップロードするだけで、横4:3の高完成度「Before & After」スタイルアップグレードレポートを生成。本人の顔立ちを保ったまま、韓国系クリーンフィット・City Boy路線へ。全9モジュール付き。",
    img: "prompts/images/MrLarus_2048617054803046701_1.jpg",
  },
  {
    num: 3,
    title_cn: "剖面科普图解绘本",
    title_jp: "断面科普図解絵本",
    cat_cn: "教育/科普/图解",
    cat_jp: "教育/科学/図解",
    desc_cn: "根据任意主题自动生成「剖面展示+内部结构+功能分区」的儿童科普绘本风格插画。支持动物/植物/机械/建筑/人体等，竖版3:4，自动判断最适表达方式。",
    desc_jp: "任意のテーマから「断面展示+内部構造+機能区分」の児童科普絵本風イラストを自動生成。動物/植物/機械/建築/人体等に対応。縦型3:4、最適な表現方法を自動判断。",
    img: "prompts/images/MrLarus_2049120511335014693_1.jpg",
  },
  {
    num: 4,
    title_cn: "毛绒微缩世界海报",
    title_jp: "ぬいぐるみミニチュアワールドポスター",
    cat_cn: "电商/商业海报",
    cat_jp: "EC/商業ポスター",
    desc_cn: "品牌×毛绒质感×微缩世界的治愈系商业海报。Nike/IKEA/山姆/Dior 4套实例，同一提示词即可生成不同品牌调性的毛绒微缩场景，极其治愈。",
    desc_jp: "ブランド×ぬいぐるみ質感×ミニチュア世界の癒し系商業ポスター。Nike/IKEA/コストコ/Dior 4实例。同じプロンプトで異なるブランド調性のぬいぐるみミニチュアシーンを生成、非常に癒されます。",
    img: "prompts/images/MrLarus_2049163386001277341_1.jpg",
  },
  {
    num: 5,
    title_cn: "世界杯看台抓拍视频",
    title_jp: "W杯スタンドキャプチャー動画",
    cat_cn: "视频制作/Seedance",
    cat_jp: "動画制作/Seedance",
    desc_cn: "完整3步工作流：GPT-Image2生成6宫格分镜故事板 → Seedance生成视频 → 后期调色。从体育场全景→看台特写→大屏时刻→女主反应→全场欢呼，直播感拉满。",
    desc_jp: "完全3ステップ：GPT-Image2で6コマ絵コンテ→Seedanceで動画生成→後処理調整。スタジアム全景→クローズアップ→大画面モーメント→ヒロイン反応→満場の喝采、ライブ感満載。",
    img: "prompts/images/MrLarus_2053798102142693773_1.jpg",
  },
];

function buildEmailHtml(isJp) {
  const t = (cn, jp) => (isJp ? jp : cn);
  const cards = PROMPTS.map((p) => {
    const fullImg = `${SITE_URL}/${p.img}`;
    return `
    <tr>
      <td style="padding:0 0 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e5df;border-radius:2px;background:#fff;">
          <tr>
            <td style="padding:24px 28px 0;">
              <span style="display:inline-block;background:#f2ede5;color:#b8925a;font-size:10px;letter-spacing:.16em;padding:3px 10px;border-radius:2px;margin-bottom:10px;">No.${p.num} · ${t(p.cat_cn, p.cat_jp)}</span>
              <h3 style="font-family:'Noto Serif JP',Georgia,serif;font-size:20px;font-weight:400;color:#1a1814;margin:0 0 8px;">${t(p.title_cn, p.title_jp)}</h3>
              <p style="font-family:'Noto Sans JP','Helvetica Neue',Arial,sans-serif;font-size:13px;color:#5a5650;line-height:1.8;margin:0 0 16px;">${t(p.desc_cn, p.desc_jp)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 20px 0;text-align:center;">
              <img src="${fullImg}" alt="${t(p.title_cn, p.title_jp)}" style="width:100%;max-width:500px;height:auto;display:block;margin:0 auto;">
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }).join("");

  const headerTitle = t("📩 精选提示词5选 — 立即可用", "📩 厳選プロンプト5選 — すぐに使えます");
  const headerSub = t(
    "从订阅者热门提示词中精选5条，涵盖电商海报、穿搭升级、科普图解、视频制作。直接复制使用。",
    "購読者に人気のプロンプトから5本を厳選。ECポスター、スタイルアップ、科普図解、動画制作まで。コピペですぐ使えます。"
  );
  const cta = t("查看完整提示词 →", "完全なプロンプトを見る →");
  const footer1 = t(
    "这5条提示词也可以在网页上随时查看：",
    "この5本のプロンプトはWeb上でもいつでもご覧いただけます："
  );
  const footer2 = t(
    "※ 此邮件由 AI知識庫 (kb.snsaladdin.com) 自动发送。如需退订，请回复此邮件。",
    "※ このメールはAI知識庫 (kb.snsaladdin.com) より自動送信されています。配信停止はこのメールに返信してください。"
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
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <!-- Header -->
        <tr>
          <td style="padding:0 0 36px 0;text-align:center;">
            <p style="font-family:'Noto Serif JP',Georgia,serif;font-size:13px;letter-spacing:.12em;color:#b8925a;margin:0 0 20px;">AI 知識庫</p>
            <h1 style="font-family:'Noto Serif JP',Georgia,serif;font-size:26px;font-weight:400;color:#1a1814;margin:0 0 12px;line-height:1.4;">${headerTitle}</h1>
            <p style="font-family:'Noto Sans JP','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#5a5650;line-height:1.8;margin:0;max-width:460px;">${headerSub}</p>
          </td>
        </tr>
        <!-- Prompt Cards -->
        ${cards}
        <!-- CTA -->
        <tr>
          <td style="text-align:center;padding:8px 0 44px;">
            <a href="${SITE_URL}/free-prompts.html" style="display:inline-block;background:#1a1814;color:#faf9f6;font-family:'Noto Sans JP','Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:500;letter-spacing:.08em;text-decoration:none;padding:15px 40px;border-radius:2px;">${cta}</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid rgba(26,24,20,.1);padding-top:28px;">
            <p style="font-size:12px;color:#9a9490;line-height:1.8;margin:0 0 8px;">${footer1}<br><a href="${SITE_URL}/free-prompts.html" style="color:#b8925a;">${SITE_URL}/free-prompts.html</a></p>
            <p style="font-size:11px;color:#b0aba5;line-height:1.8;margin:0;">${footer2}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let email;
  try {
    const body = await req.json();
    email = body.email;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured. Available env keys:", Object.keys(process.env).filter(k => k.includes('RESEND') || k.includes('API')).join(', '));
    return new Response(JSON.stringify({ error: "Email service not configured — RESEND_API_KEY env var not found", ok: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Detect language preference from Accept-Language header or default to Japanese-centric
  const acceptLang = req.headers["accept-language"] || "";
  const isJp = acceptLang.includes("ja") && !acceptLang.startsWith("zh");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AI知識庫 <info@snsaladdin.com>",
        to: [email],
        subject: isJp
          ? "【AI知識庫】厳選プロンプト5選 — コピペですぐ使えます"
          : "【AI知识库】精选提示词5选 — 复制粘贴即可使用",
        html: buildEmailHtml(isJp),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Resend API error", detail: data, ok: false }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal error", ok: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
