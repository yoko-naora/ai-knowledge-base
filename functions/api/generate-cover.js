// Cloudflare Pages Function: generate-cover
// POST /api/generate-cover
// 封面生成：根据文章内容 + 平台生成封面图
//
// Routes per STYLE-GUIDE.md:
//   xiaohongshu → magazine editorial style, 3:4
//   video       → magazine editorial style, 9:16
//
// Uses AI image generation (configurable via IMAGE_GEN_API_URL env var, defaults to fal.ai flux/dev).
// Cover prompt follows brand: Editorial Magazine × Ink Classic, warm palette, painterly rendering.
//
// TEST:
//   curl -s -X POST "https://kb.snsaladdin.com/api/generate-cover" \
//     -H "Content-Type: application/json" \
//     -d '{"article":{"title":"夏季口红推荐","body":"..."},"platform":"xiaohongshu"}'
//   预期: 200, { imageUrl: "..." }

function buildCoverPrompt(title, body, platform) {
  const aspectLabel = platform === "video" ? "9:16 vertical video cover" : "3:4 vertical portrait cover";

  // Extract first ~100 chars of body for context
  const snippet = (body || "").replace(/\n/g, " ").slice(0, 100).trim();

  return `Editorial magazine cover design. ${aspectLabel}. Japanese magazine aesthetic (Ushio, Brutus, Casa Brutus).

Title: "${title}"
Context: ${snippet || title}

Style: Editorial Magazine × Ink Classic. Warm paper-textured background (#faf9f6 family), deep ink-black (#1a1814) typography, gold accent details (#b8925a). Painterly rendering, not mechanical. Minimal decoration, generous negative space. The title should be the hero element — large, confident serif typography with generous letter-spacing. Film grain texture overlay.

Layout: Clean hierarchical typography. Title takes center stage with breathing room. No emoji, no icons, no clip art. No busy backgrounds. The image should feel like a premium magazine cover — sophisticated, editorial, timeless.

Technical: High resolution, sharp typography, warm film-like color grading.`;
}

async function generateImage(apiKey, prompt, platform) {
  const imageGenUrl =
    "https://fal.run/fal-ai/flux/dev";

  const imageSize =
    platform === "video"
      ? "portrait_9_16"
      : "portrait_4_3";

  const res = await fetch(imageGenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      image_size: imageSize,
      num_images: 1,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Image gen API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const imageUrl = data.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error("Image gen API returned no image URL");
  }
  return imageUrl;
}

export async function onRequestPost(context) {
  const imageGenApiKey = context.env.FAL_API_KEY;
  if (!imageGenApiKey) {
    return new Response(
      JSON.stringify({ error: "Service configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { article, platform } = body || {};

  if (!article || typeof article !== "object") {
    return new Response(
      JSON.stringify({ error: "article is required ({ title, body })" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!article.title || typeof article.title !== "string" || !article.title.trim()) {
    return new Response(
      JSON.stringify({ error: "article.title is required (string)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!platform || !["xiaohongshu", "video"].includes(platform)) {
    return new Response(
      JSON.stringify({ error: 'platform must be "xiaohongshu" or "video"' }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const prompt = buildCoverPrompt(
      article.title.trim(),
      article.body || "",
      platform
    );
    const imageUrl = await generateImage(imageGenApiKey, prompt, platform);
    return new Response(JSON.stringify({ imageUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-cover error:", err.message);
    return new Response(
      JSON.stringify({ error: "Cover generation failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
