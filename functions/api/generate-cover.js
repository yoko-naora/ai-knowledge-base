// Cloudflare Pages Function: generate-cover
// POST /api/generate-cover
// 封面生成：返回杂志风封面 HTML（CSS 渲染，零成本）
//
// 基于 STYLE-GUIDE.md:
//   小红书封面 → guizang-social-card-skill → editorial-card.html + Ink Classic
//   视频号封面 → baoyu-cover-image（后补）
//   公众号封面 → guizang-social-card-skill（后补）
//
// TEST:
//   curl -s -X POST "https://kb.snsaladdin.com/api/generate-cover" \
//     -H "Content-Type: application/json" \
//     -d "{"article":{"title":"夏季口红推荐","body":"正文"},"platform":"xiaohongshu"}"

function buildCoverHtml(title, body, platform) {
  const isVideo = platform === "video";
  const width = isVideo ? "540" : "600";
  const height = isVideo ? "960" : "800";

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${width}px;
    height: ${height}px;
    background: #faf9f6;
    font-family: "Noto Serif SC", "Noto Serif JP", Georgia, "Times New Roman", serif;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
  .top-bar {
    height: 6px;
    background: #b8925a;
    flex-shrink: 0;
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px 48px;
    position: relative;
  }
  .issue-line {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #b8925a;
    margin-bottom: 20px;
    font-weight: 400;
  }
  .title {
    font-size: ${isVideo ? "42px" : "52px"};
    font-weight: 700;
    color: #1a1814;
    line-height: 1.15;
    letter-spacing: 2px;
    margin-bottom: 24px;
    max-width: 90%;
  }
  .divider {
    width: 60px;
    height: 2px;
    background: #b8925a;
    margin-bottom: 20px;
  }
  .subtitle {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: ${isVideo ? "13px" : "14px"};
    color: #6b6560;
    letter-spacing: 2px;
    line-height: 1.6;
    max-width: 80%;
  }
  .bottom-bar {
    height: 4px;
    background: #b8925a;
    flex-shrink: 0;
    margin-top: auto;
  }
  .gold-corner {
    position: absolute;
    bottom: 30px;
    right: 30px;
    width: 40px;
    height: 40px;
    border-right: 2px solid #b8925a;
    border-bottom: 2px solid #b8925a;
  }
</style>
</head>
<body>
  <div class="top-bar"></div>
  <div class="content">
    <div class="issue-line">Editorial &middot; Summer 2026</div>
    <h1 class="title">${escapeHtml(title)}</h1>
    <div class="divider"></div>
    <div class="subtitle">${isVideo ? "Featured Story" : "READ MORE INSIDE"}</div>
    <div class="gold-corner"></div>
  </div>
  <div class="bottom-bar"></div>
</body>
</html>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const { article, platform } = body || {};
  if (!article || typeof article !== "object") {
    return new Response(JSON.stringify({ error: "article required" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }
  if (!article.title || typeof article.title !== "string") {
    return new Response(JSON.stringify({ error: "title required" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const plat = platform === "video" ? "video" : "xiaohongshu";
  const coverHtml = buildCoverHtml(
    article.title.trim(),
    article.body || "",
    plat
  );

  return new Response(JSON.stringify({ coverHtml, platform: plat }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
