// Cloudflare Pages Function: dbs-content
// POST /api/dbs-content
// 五维诊断：对文章做 5 个维度的质量诊断，每项 ✅/⚠️/❌ + 说明
//
// Model: Haiku (deepseek-chat)
// Based on: dbs-content SKILL.md → prompts/api-templates/dbs-content.json
//
// TEST:
//   curl -s -X POST "https://kb.snsaladdin.com/api/dbs-content" \
//     -H "Content-Type: application/json" \
//     -d '{"article":{"title":"测试标题","body":"测试正文..."}}'
//   预期: 200, { textCleanliness: { grade, detail }, headlineDiagnosis: {...}, ... }

const SYSTEM_PROMPT = `你是 dbs-content，一个内容创作诊断 AI。

你的任务是对用户提供的文章做五个维度的诊断。

**你不帮人写内容。你帮人诊断内容该怎么做。**

## 诊断五维

### 维度 1：文字洁癖检测
- 有没有 AI 味？（Emoji 堆叠、晦涩词汇、空洞的排比句）
- 有没有「干货」陷阱？（所有让你讲干货的建议都是不专业的）
- 语言是不是公共的、可验证的？
- 判断：✅ 干净 / ⚠️ 有 AI 味需要清洗 / ❌ 需要重写

### 维度 2：封面/标题诊断
- 平铺直叙能不能吸引人？如果不能，价值密度不够
- 标题的情绪是什么？是信息传递还是认知劫持？
- 判断：✅ 自带吸引力 / ⚠️ 需要优化 / ❌ 需要重做

### 维度 3：表达效率检测
- 能不能一句话说清楚核心观点？
- 有没有在用 99% 的时间包装 1% 的内容？
- 是在服务产品变现，还是在自嗨？
- 判断：✅ 高效 / ⚠️ 有冗余 / ❌ 本末倒置

### 维度 4：认知落差检测
- 同行把这个事情讲清楚了吗？
- 你的表达比同行好在哪？
- 受众看完会不会觉得「这个我知道」？
- 判断：✅ 有明显落差 / ⚠️ 落差较小 / ❌ 无落差

### 维度 5：AI 辅助创作建议
根据内容类型，推荐具体的 AI 工作流。

## 核心哲学
- 文字洁癖是底线
- 自媒体的本质是精神控制（封面和标题是认知劫持）
- 内容好坏 = 投入精力 × 对内容有正确理解
- 先有产品后有内容
- 知识博主的核心工作：把事情搞清楚，把事情说清楚

## 输出格式

只输出一个 JSON 对象，不要 markdown 代码块包裹：
{
  "textCleanliness": { "grade": "✅", "detail": "文字干净，无明显AI味" },
  "headlineDiagnosis": { "grade": "⚠️", "detail": "标题价值密度不足" },
  "expressionEfficiency": { "grade": "✅", "detail": "核心观点清晰" },
  "cognitiveGap": { "grade": "⚠️", "detail": "与同行差异不够明显" },
  "aiSuggestions": "建议在工作流中加入..."
}

grade 只能是 "✅"、"⚠️"、"❌" 三个值之一。`;

function buildUserMessage(title, body) {
  return `标题：${title}\n\n正文：\n${body}`;
}

async function callLLM(apiKey, title, body) {
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      max_tokens: 2048,
      
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(title, body) }],
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

  const dims = [
    "textCleanliness",
    "headlineDiagnosis",
    "expressionEfficiency",
    "cognitiveGap",
  ];
  const validGrades = ["✅", "⚠️", "❌"];

  const result = {};
  for (const dim of dims) {
    const d = parsed[dim];
    if (!d || !validGrades.includes(d.grade) || typeof d.detail !== "string") {
      throw new Error(`Invalid response: ${dim} missing or malformed`);
    }
    result[dim] = { grade: d.grade, detail: d.detail };
  }

  if (typeof parsed.aiSuggestions !== "string") {
    throw new Error("Invalid response: aiSuggestions missing");
  }
  result.aiSuggestions = parsed.aiSuggestions;

  return result;
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

  const { article } = body || {};
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
  if (!article.body || typeof article.body !== "string" || !article.body.trim()) {
    return new Response(
      JSON.stringify({ error: "article.body is required (string)" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const text = await callLLM(apiKey, article.title.trim(), article.body.trim());
    const result = parseResponse(text);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("dbs-content error:", err.message);
    if (err.message.includes("Invalid response")) {
      return new Response(
        JSON.stringify({ error: "AI response could not be parsed. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Diagnosis failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
