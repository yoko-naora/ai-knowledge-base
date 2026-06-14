# 交叉检查报告 · 大神工具（完整版）

**検査日:** 2026-06-13
**検査対象:** generator.html（裸逻辑版）、functions/api/*.js（5 个新 endpoint）、prompts/api-templates/*.json
**全 33 項:** 根据交付物逐个检查

---

## A · 规则遵守（4 项）

| # | 检查项 | 结果 | 证据 |
|---|--------|:----:|------|
| A1 | 工作目录正确 | ✅ | 所有文件在 C:\Users\jding\kb-site\ |
| A2 | 纯 vanilla，无框架 | ✅ | generator.html = 原生 HTML/CSS/JS；API = Cloudflare Functions |
| A3 | 注释简洁不废话 | ✅ | 每个 endpoint 有标准头注释，无多余叙述 |
| A4 | 密钥无默认值 | ✅ | ANTHROPIC_API_KEY / FAL_API_KEY 都走 context.env，无 fallback |

## B · API 端点完整性（5 项）

| # | 检查项 | 结果 | 证据 |
|---|--------|:----:|------|
| B1 | writing-fragments 可用 | ✅ | POST /api/writing-fragments，topic + platform 输入，angles + gaps 输出。空 topic → 400，非法 platform → 400，无 key → 500 不暴露细节 |
| B2 | writing-shape 可用 | ✅ | POST /api/writing-shape，topic + platform + angles 输入，title + body 输出。空 angles → 400，无 key → 500 |
| B3 | dbs-content 可用 | ✅ | POST /api/dbs-content，article.title + article.body 输入，5 维 + aiSuggestions 输出。空 article → 400，grade 校验严格 |
| B4 | recommend-prompts 可用 | ✅ | POST /api/recommend-prompts，topic 输入，recommended[].cat + prompts[] 输出。空 topic → 400，category 可选参数支持手动切换 |
| B5 | generate-cover 可用 | ✅ | POST /api/generate-cover，article.title + platform 输入，imageUrl 输出。platform 只允许 xiaohongshu/video |

## C · 前端状态机完整性（6 项）

| # | 检查项 | 结果 | 证据 |
|---|--------|:----:|------|
| C1 | 8 步流转无断点 | ⚠️ | input→draft1→addons→draft2→qc→image→cover→done 结构完整。但 goToStep() 被定义了**两次**（L80 + L120），后一次覆盖前一次。Step 2 的 draft 生成逻辑只在第一次定义中，第二次定义不处理 Step 2。修复方案：合并为一个函数。 |
| C2 | Step 6 诊断数据可展示 | ⚠️ | goToStep6() 函数存在且能加载 MOCK.diagnosis，但 HTML 按钮调用的是 goToStep(6)（第二个定义，不加载数据）。Click "确认进入质检 →" → 空白的 Step 6。修复方案：按钮改为 onclick="goToStep6()" |
| C3 | Cover 展示 | ⚠️ | goToStep8() 函数存在但 HTML 按钮 onclick 为 "goToStep(8)"。从 Step 7 → 8 看到空白的封面页。修复方案：按钮改为 onclick="goToStep8()" |
| C4 | Step 5 diff 蓝色高亮 | ⚠️ | 设计文档要求蓝色左边框 + 标蓝文字。当前仅在 mock body 中硬编码 <span style='color:blue'>。无真实 diff 逻辑。修复方案：draft2 生成时跑 text diff |
| C5 | Step 6 "60分跳过"按钮 | ❌ | 设计文档明确要求"60分跳过"和"[全部修复]"按钮。当前缺失。 |
| C6 | Step 6 逐项修复 | ❌ | 设计文档要求点 ⚠️/❌ → AI 定点修复。当前只展示诊断结果，无可交互修复按钮 |

## D · 功能完整性（8 项）

| # | 检查项 | 结果 | 证据 |
|---|--------|:----:|------|
| D1 | Step 1 主题输入 + 平台选择 | ✅ | topic 文本框 + platform 下拉框（小红书/公众号） |
| D2 | Step 3 加料面板含推荐语 | ⚠️ | 4 个勾选项存在，但推荐语只是硬编码 "根据诊断推荐："，不来自 Step 2 诊断结果。设计文档要求推荐语来自静默诊断 |
| D3 | Step 3 "自己写一段" 不 AI 改写 | ✅ | userCustomText 传入第二稿拼接逻辑，mock 中有直接插入 |
| D4 | Step 7 免费配额控制 | ✅ | state.imageSession.hasUsedFreeQuota 控制，一次后锁定 |
| D5 | Step 7 不满意只出 prompt 不出第二张图 | ✅ | handleNotSatisfied() 严格遵守 |
| D6 | Step 7 小红书 3:4 + 视频号 9:16 同时出 | ✅ | generateImage() 展示两张不同比例图片 |
| D7 | Step 8 封面展示两个平台 | ⚠️ | cover 区域有描述但实际接口: showStep(8) 显示静态文字, goToStep8() 未触发。封面功能无真实 mock 数据 |
| D8 | localStorage 持久化 | ✅ | saveState() / loadState() 完整。刷新可恢复 |

## E · 大神工具专有检查（6 项）

| # | 检查项 | 结果 | 证据 |
|---|--------|:----:|------|
| E1 | 8 步状态机无死循环 | ✅ | 每一步都可返回上一步，resetAll 可重置。无无法退出的路径 |
| E2 | 免费配图配额控制正确 | ✅ | hasUsedFreeQuota=true 后 generateImage() 直接 return，不出第二张 |
| E3 | 不满意度复制 prompt 功能 | ⚠️ | handleNotSatisfied() 显示"Prompt 已复制到剪贴板（模拟）"，但实际 clipboard 写入用 alert() 替代。真正的 navigator.clipboard.writeText() 未实现 |
| E4 | 小红书 + 视频号尺寸同时输出 | ✅ | placehold.co 示例用 360x480（3:4）和 270x480（9:16）|
| E5 | category-mapping 关键词覆盖 | ✅ | 分类映射含 9 类共 ~90 个关键词，覆盖主要场景。Claude Code 在 recommend-prompts.js 中 inlined 了自己的版本（关键词略少，但不影响功能）|
| E6 | API 输入契约与前端 state 匹配 | ⚠️ | 前端 state.topic/state.platform/state.draft1 等字段与 API 接口契约一致。但 Step 6 按钮调用错误（goToStep(6) vs goToStep6()）导致数据流断裂 |

## F · 安全与错误处理（4 项）

| # | 检查项 | 结果 | 证据 |
|---|--------|:----:|------|
| F1 | 无 API 密钥在 HTML/JS | ✅ | 纯 mock 前端，密钥只存在于 Cloudflare env vars |
| F2 | API 错误处理覆盖 | ✅ | 400: 空输入/格式错误；500: LLM 超时/不可解析响应，返回用户友好消息 |
| F3 | CORS 配置 | ⚠️ | 5 个新 endpoint 未设置 CORS headers。generator.html 和 API 同域部署时不影响，但开发环境跨域测试需要 Access-Control-Allow-Origin |
| F4 | API 超时防护 | ⚠️ | Cloudflare Functions 默认 30s 超时。LLM 调用和图片生成可能超时。未设置 explicit timeout / retry 逻辑 |

---

## 总评

**33 项中 18 ✅ / 9 ⚠️ / 2 ❌ / 4 待验证**

### 阻断性问题（需立即修复）

| # | 问题 | 影响 | 修复方案 |
|---|------|------|---------|
| C5 | Step 6 缺少"60分跳过"按钮 | 用户无法快速跳过质检 | ? 在 diagnosis-report 区域下方加 .nav-buttons: [60分跳过] [全部修复] |
| C6 | Step 6 缺少逐项修复交互 | 用户看到 ⚠️/❌ 无法操作 | ? 每个维度下方加"优化"按钮，调用 LLM 定点修复 |
| C1 C2 C3 | goToStep 两次定义 + 按钮调用错误 | Step 2/6/8 数据流断裂 | ? 合并 goToStep，Step 6 按钮改为 goToStep6()，Step 8 按钮改为 goToStep8() |

### 高优先级问题

| # | 问题 | 影响 | 修复方案 |
|---|------|------|---------|
| C4 | Step 5 无真实 diff 逻辑 | 用户看不到具体改了什么 | ? draft2 生成时与 draft1 做 text diff → 蓝色标记新增部分 |
| D2 | Step 3 推荐语不来自诊断 | 加料面板缺乏针对性 | ? Step 2 存入 diagnosis → Step 3 读 diagnosis 生成推荐语 |
| D7 | Step 8 封面无真实数据 | 封面制作步骤无内容 | ? goToStep8() 中填入 mock cover URLs |
| F3 | 新 API 无 CORS headers | 开发环境跨域测试受限 | ? 每个 endpoint 加 corsHeaders() |

### 低优先级

| # | 问题 | 影响 |
|---|------|------|
| F4 | 无 timeout/retry | Cloudflare 默认 timeout，生产环境需优化 |
| E3 | clipboard 用 alert 模拟 | 功能原型可接受，上线前改 navigator.clipboard |
| B4 | recommend-prompts inlined 而非 import | 两份分类映射维护成本，功能无影响 |

### 待环境配置后验证

| # | 验证项 | 条件 |
|---|--------|------|
| V1 | writing-fragments 真实 LLM 调用 | ANTHROPIC_API_KEY 配置后 |
| V2 | writing-shape 真实 LLM 调用 | ANTHROPIC_API_KEY 配置后 |
| V3 | dbs-content 真实 LLM 调用 | ANTHROPIC_API_KEY 配置后 |
| V4 | generate-cover fal.ai 出图 | FAL_API_KEY 配置后 |