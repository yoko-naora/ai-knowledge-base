// Cloudflare Pages Function: writing-fragments
// POST /api/writing-fragments
// 审题：给定 topic + platform，返回写作角度建议和素材缺口清单
//
// Model: Haiku (deepseek-chat)
// Based on: writing-fragments SKILL.md → prompts/api-templates/writing-fragments.json
//
// TEST:
//   curl -s -X POST "https://kb.snsaladdin.com/api/writing-fragments" \
//     -H "Content-Type: application/json" \
//     -d '{"topic":"夏季口红推荐","platform":"小红书"}'
//   预期: 200, { angles: [...], gaps: [...] }

const SYSTEM_PROMPT = `你是 writing-fragments，一个内容创作审题助手。

你的任务是基于用户的 topic 和 platform 给出写作角度建议和素材缺口清单。

## 工作方式

1. 分析用户提供的主题和平台
2. 输出 3-5 个可行的写作角度（angles），每个角度一句话概括
3. 输出素材缺口清单（gaps），指出当前主题缺少什么支撑素材（案例、数据、对比、场景等）

## 原则

- 角度之间要有区分度，不能只是换种说法
- 素材缺口要具体，不能是「需要更多信息」这种空话
- 平台不同角度不同：小红书偏实用/场景化，公众号偏深度/观点
- 不需要写正文，不需要提供完整结构

## 输出格式

只输出一个 JSON 对象，不要 markdown 代码块包裹：
{"angles": ["角度1", "角度2", "角度3"], "gaps": ["缺口1", "缺口2"]}`;

function buildUserMessage(topic, platform) {
  return `主题：${topic}\n平台：${platform}`;
}

async function callLLM(apiKey, topic, platform) {
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
        { role: "user", content: buildUserMessage(topic, platform) }],
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
  // Strip markdown code block if present
  let json = text.trim();
  if (json.startsWith("```")) {
    json = json.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  const parsed = JSON.parse(json);

  if (!Array.isArray(parsed.angles) || !Array.isArray(parsed.gaps)) {
    throw new Error("Invalid response format: missing angles or gaps arrays");
  }

  return {
    angles: parsed.angles.filter((a) => typeof a === "string" && a.trim()),
    gaps: parsed.gaps.filter((g) => typeof g === "string" && g.trim()),
  };
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

  const { topic, platform } = body || {};
  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return new Response(
      JSON.stringify({ error: "topic is required (string)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!platform || !["小红书", "公众号"].includes(platform)) {
    return new Response(
      JSON.stringify({ error: 'platform must be "小红书" or "公众号"' }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const text = await callLLM(apiKey, topic.trim(), platform);
    const result = parseResponse(text);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("writing-fragments error:", err.message);
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
