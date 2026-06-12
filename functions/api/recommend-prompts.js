// Cloudflare Pages Function: recommend-prompts
// POST /api/recommend-prompts
// 配图推荐：根据 topic 匹配提示词分类，返回推荐分类和 prompt 预览
//
// No LLM — uses category-mapping.js + prompts/data.json
// Based on: Codex category-mapping.js + prompts/data.json（9 类，~57 条）
//
// TEST:
//   curl -s -X POST "https://kb.snsaladdin.com/api/recommend-prompts" \
//     -H "Content-Type: application/json" \
//     -d '{"topic":"夏季口红推荐"}'
//   预期: 200, { recommended: [...], allCategories: [...] }

const SITE_URL = "https://kb.snsaladdin.com";

// Category keyword matching — mirrors functions/api/lib/category-mapping.js logic
// (inlined to avoid CJS/ESM interop issues in CF Pages Functions)
const CATEGORIES = [
  { name: "电商/商业海报", keywords: ["电商","商业","海报","产品","广告","品牌","营销","促销","商品","店铺","卖货"] },
  { name: "穿搭/形象/造型", keywords: ["穿搭","形象","造型","时尚","服装","搭配","风格","穿衣","配色","衣橱","口红","美妆","化妆品","护肤","妆容","眼影","粉底","腮红","香水","美甲"] },
  { name: "教育/科普/图解", keywords: ["教育","科普","图解","学习","教程","知识","教学","课程","考试","学校"] },
  { name: "游戏/娱乐/影视", keywords: ["游戏","娱乐","影视","动漫","电影","视频","音乐","综艺","动画","电视剧"] },
  { name: "品牌/VI/包装", keywords: ["品牌","VI","包装","logo","视觉","标识","商标","设计系统","品牌形象"] },
  { name: "自拍类", keywords: ["自拍","人像","写真","美颜","自画像","大头贴","头像"] },
  { name: "全景/3D/空间", keywords: ["全景","3D","空间","VR","AR","三维","沉浸","虚拟","建模"] },
  { name: "健康/生活/实用工具", keywords: ["健康","生活","实用","工具","健身","饮食","养生","医疗","运动","美容","减肥","瑜伽","冥想"] },
  { name: "视频制作/Seedance", keywords: ["视频","制作","Seedance","动画","剪辑","短视频","vlog","影片"] },
];

const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

// In-memory cache for prompts data (lives across requests within same isolate)
let promptsCache = null;

async function loadPrompts() {
  if (promptsCache) return promptsCache;
  const res = await fetch(`${SITE_URL}/prompts/data.json`);
  if (!res.ok) throw new Error(`Failed to load prompts data: ${res.status}`);
  promptsCache = await res.json();
  return promptsCache;
}

function matchCategories(topic, count) {
  const t = topic.toLowerCase();
  const scored = CATEGORIES.map((c) => {
    let score = 0;
    for (const kw of c.keywords) {
      if (t.includes(kw)) score += kw.length;
    }
    return { name: c.name, score };
  });
  scored.sort((a, b) => b.score - a.score);

  if (scored[0].score === 0) {
    return CATEGORY_NAMES.slice(0, count);
  }
  return scored
    .slice(0, count)
    .filter((s) => s.score > 0)
    .map((s) => s.name);
}

function pickPromptsByCategory(allPrompts, cat, maxCount) {
  const matches = allPrompts.filter(
    (p) => p.cat === cat && p.image_prompt && p.image_prompt.trim()
  );
  // Shuffle and pick up to maxCount
  const shuffled = matches.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, maxCount).map((p) => ({
    id: p.id,
    title: p.title,
    image_prompt: p.image_prompt.trim(),
  }));
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { topic, category } = body || {};
  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return new Response(
      JSON.stringify({ error: "topic is required (string)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const allPrompts = await loadPrompts();

    // Determine which categories to use
    let selectedCategories;
    if (category && typeof category === "string" && CATEGORY_NAMES.includes(category)) {
      // User picked a specific category — show that one plus one more recommended
      const autoCat = matchCategories(topic.trim(), 2).find((c) => c !== category);
      selectedCategories = autoCat ? [category, autoCat] : [category];
    } else {
      selectedCategories = matchCategories(topic.trim(), 2);
    }

    // Pick 1 prompt per category as preview
    const recommended = selectedCategories.map((cat) => ({
      cat,
      prompts: pickPromptsByCategory(allPrompts, cat, 1),
    }));

    return new Response(
      JSON.stringify({ recommended, allCategories: CATEGORY_NAMES }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("recommend-prompts error:", err.message);
    return new Response(
      JSON.stringify({ error: "Prompt recommendation failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
