// Cloudflare Pages Function: write-article
// POST /api/write-article
// 合并审题+写作：一次 LLM 调用，产出角度 + 完整文章
// Model: deepseek-chat
const SYSTEM_PROMPT = `你是 write-article，一个内容创作助手。

基于用户的 topic 和 platform，一次性完成审题和写作。

## 第一步：审题
分析主题和平台，给出 3-5 个可行的写作角度（angles）和素材缺口清单（gaps）。

角度之间要有区分度，不能只是换种说法。素材缺口要具体。

## 第二步：写作
基于最佳角度，写出完整文章。包含标题和正文。

## 平台适配
- 小红书：开头直接给价值/痛点，短段落多换行，口语化，emoji 适度，结尾引导互动
- 公众号：开头有钩子/故事/观点，长段落，深度分析，逻辑链完整

## 写作原则
- 开头要能一秒钩住读者
- 每一段只讲一件事
- 多用具体案例和场景，少讲抽象道理
- 标题要包含关键词，有信息密度

## 输出格式
只输出一个 JSON 对象，不要 markdown 代码块：
{"title": "标题", "body": "正文...", "angles": ["角度1","角度2"], "gaps": ["缺口1","缺口2"]}`;

export async function onRequestPost(context) {
  const apiKey = context.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Service configuration error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
  let body;
  try { body = await context.request.json(); }
  catch { return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { "Content-Type": "application/json" } }); }
  const { topic, platform } = body || {};
  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return new Response(JSON.stringify({ error: "topic is required (string)" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 2048,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "当前日期：2026年6月15日\n主题：" + topic.trim() + "\n平台：" + platform }
        ]
      })
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error("DeepSeek API " + res.status + ": " + errText.slice(0, 200));
    }
    const data = await res.json();
    let text = data.choices[0].message.content.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*?\n?/, "").replace(/\n?```\s*$/, "");
    }
    const parsed = JSON.parse(text);
    if (!parsed.title || !parsed.body) {
      return new Response(JSON.stringify({ error: "AI response could not be parsed. Please try again." }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({
      title: parsed.title.trim(),
      body: parsed.body.trim(),
      angles: Array.isArray(parsed.angles) ? parsed.angles.filter(function(a) { return typeof a === "string" && a.trim(); }) : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps.filter(function(g) { return typeof g === "string" && g.trim(); }) : []
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("write-article error:", err.message);
    return new Response(JSON.stringify({ error: "Content generation failed. Please try again." }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
