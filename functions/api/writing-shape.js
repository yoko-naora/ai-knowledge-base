// Cloudflare Pages Function: writing-shape
// POST /api/writing-shape
// 写正文：给定 topic + platform + angles + 可选素材，输出完整文章标题和正文
//
// Model: Sonnet (deepseek-chat)
// Based on: writing-shape SKILL.md → prompts/api-templates/writing-shape.json
//
// TEST:
//   curl -s -X POST "https://kb.snsaladdin.com/api/writing-shape" \
//     -H "Content-Type: application/json" \
//     -d '{"topic":"夏季口红推荐","platform":"小红书","angles":["按肤色推荐","平价替代"],"addons":["真实用户案例"]}'
//   预期: 200, { title: "...", body: "..." }

const SYSTEM_PROMPT = `你是 writing-shape，一个内容创作写作助手。

你的任务是基于主题、平台、角度建议，写出完整的第一稿文章。如果用户提供了「追加素材」，必须将素材内容融入正文，不能忽略。

## 工作方式

1. 分析用户提供的主题、平台和写作角度
2. 输出标题 + 完整正文
3. 正文要有完整结构：开头吸引注意，中间逐步展开，结尾有力收束

## 平台适配

- **小红书**：开头直接给价值/痛点，短段落多换行，口语化，emoji 适度，结尾引导互动
- **公众号**：开头有钩子/故事/观点
- **朋友圈**：短文本(3-6句)，开头直接给价值，口语化亲切，emoji适度，结尾带话题标签#xx或引导互动，长段落，深度分析，逻辑链完整，结尾有总结或行动号召

## 写作原则

- 开头要能在一秒内钩住读者
- 每一段只讲一件事
- 多用具体案例和场景，少讲抽象道理
- 语言要干净，不要 AI 味（不要排比句、不要空洞词汇、不要过度修饰）
- 标题要包含关键词，有信息密度和吸引力

## 输出格式

只输出一个 JSON 对象，不要 markdown 代码块包裹：
{"title": "文章标题", "body": "文章正文..."}

## 追加素材说明

如果用户提供了追加素材清单（以「■」开头），必须将素材内容融入正文，不能忽略。

- ■ 真实用户案例/客户反馈 -> 在正文中加入一个具体案例段落
- ■ 产品对比/数据支撑 -> 在正文中加入产品对比或数据
- ■ 选购技巧/使用Tips -> 在正文中加入选购建议或使用技巧

## 输出格式`;

function buildUserMessage(topic, platform, angles, addons, userCustomText, modifications) {
  let msg = `当前日期：2026年6月15日\n主题：${topic}\n平台：${platform}\n写作角度：${angles.join("、")}`;
  if (addons && addons.length > 0) {
    msg += `\n追加素材：${addons.join("、")}`;
  }
  if (modifications && modifications.trim()) { msg += "\n\n修改要求（直接按照要求修改，不要忽略）：" + modifications.trim(); }
  if (userCustomText && userCustomText.trim()) {
    msg += `\n用户自写段落（直接插入正文，不改写）：\n${userCustomText.trim()}`;
  }
  return msg;
}

async function callLLM(apiKey, topic, platform, angles, addons, userCustomText) {
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      max_tokens: 1024,
      
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(topic, platform, angles, addons, userCustomText) },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`DeepSeek API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

function parseResponse(text) {
  let json = text.trim();
  if (json.startsWith("```")) {
    json = json.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  const parsed = JSON.parse(json);

  if (!parsed.title || !parsed.body) {
    throw new Error("Invalid response format: missing title or body");
  }

  return { title: parsed.title, body: parsed.body };
}

export async function onRequestPost(context) {
  const apiKey = context.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
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

  const { topic, platform, angles, addons, userCustomText, modifications } = body || {};

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return new Response(
      JSON.stringify({ error: "topic is required (string)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!platform || typeof platform !== "string") {
    return new Response(
      JSON.stringify({ error: "platform is required (string)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!Array.isArray(angles) || angles.length === 0) {
    return new Response(
      JSON.stringify({ error: "angles is required (non-empty array)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const text = await callLLM(
      apiKey,
      topic.trim(),
      platform,
      angles,
      addons || [],
      userCustomText || ""
    );
    const result = parseResponse(text);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("writing-shape error:", err.message);
    if (err.message.includes("Invalid response format")) {
      return new Response(
        JSON.stringify({ error: "AI response could not be parsed. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Content generation failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
