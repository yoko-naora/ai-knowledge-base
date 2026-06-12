# KB Pipeline & API Handoff
Last updated: 2026-06-12 16:15 JST

## Project Structure
- Site: `C:\Users\jding\kb-site` -> `kb.snsaladdin.com`
- Pipeline: `kb-kb.snsaladdin.com\scripts\orchestrator.py`
- Feishu: app_token=`TXbubx31ia6M3Rsdy4jcaHeTnde`, table=`tblhJfDKdrJQMlbP`

## 大神工具 · 8 步工作流（当前进度）

```
Step 1-2 第一稿    ✅ API 写完      ❌ 未测试      ❌ generator.html 未建
Step 3-5 加料      ✅ API 写完      ❌ 未测试      ❌ generator.html 未建
Step 6 质检        ✅ API 写完      ❌ 未测试      ❌ generator.html 未建
Step 7 配图        ✅ API 写完      ❌ 未测试      ❌ generator.html 未建
Step 8 封面        ✅ API 写完      ❌ 未测试      ❌ generator.html 未建
交叉检查           —               —              ❌ 未开始
```

设计文档：`大神工具-设计文档.md` v2 · 分工计划：`大神工具-三端分工计划.md` v1

## API Endpoints ✅ (Claude Code — written, pushed, untested)

| # | Endpoint | File | Model | Status |
|---|----------|------|-------|--------|
| 1 | POST /api/writing-fragments | functions/api/writing-fragments.js | Haiku | ✅ written |
| 2 | POST /api/writing-shape | functions/api/writing-shape.js | Sonnet | ✅ written |
| 3 | POST /api/dbs-content | functions/api/dbs-content.js | Haiku | ✅ written |
| 4 | POST /api/recommend-prompts | functions/api/recommend-prompts.js | — (fetch + keyword match) | ✅ written |
| 5 | POST /api/generate-cover | functions/api/generate-cover.js | fal.ai flux/dev | ✅ written |

接口契约：见 `大神工具-三端分工计划.md` 二、接口契约
Category 匹配逻辑：内联在 recommend-prompts.js（等价于 `functions/api/lib/category-mapping.js`）

## Templates ✅ (Codex — delivered)

- prompts/api-templates/writing-fragments.json
- prompts/api-templates/writing-shape.json
- prompts/api-templates/dbs-content.json
- functions/api/lib/category-mapping.js

## Prompt 库

- 57 条，ID 109→1，9 类
- 分类分布：电商/商业海报 15 · 视频制作/Seedance 11 · 穿搭/形象/造型 11 · 游戏/娱乐/影视 8 · 教育/科普/图解 7 · 健康/生活/实用工具 2 · 品牌/VI/包装 1 · 自拍类 1 · 全景/3D/空间 1
- 类型：image 40 · video 16 · text 1
- ID_MAPPING.md for URL→ID

## Frontend ❌ (Hermes — not started)

- generator.html：8 步状态机 UI，纯 vanilla HTML/CSS/JS
- 设计约束：先读 STYLE-GUIDE.md → huashu-design 流程 → 种子模板（不能手写）
- 开发阶段用 MOCK 数据，联调阶段接真实 API
- 免费配图配额：前端 localStorage 控（`kami-free-quota-{uuid}`）

## Pipeline（另一套系统）

1. Read Feishu -> filter pending
2. Extract X via vxtwitter
3. Route: `图片提示词`/`视频提示词`/article
4. Update Feishu -> git push -> deploy

## 环境变量（待配置 — Cloudflare Dashboard）

| 变量 | 用途 | 状态 |
|------|------|:--:|
| ANTHROPIC_API_KEY | endpoint 1-3 LLM 调用 | ❌ |
| FAL_API_KEY | endpoint 5 封面生图 | ❌ |
| STRIPE_SECRET_KEY | 支付 | ✅ |
| STRIPE_WEBHOOK_SECRET | 支付 webhook | ✅ |
| RESEND_API_KEY | 邮件 | ✅ |
| ACCESS_CODE | 会员访问码 | ✅ |

## 待办（优先级排序）

1. 🔴 Cloudflare 配 ANTHROPIC_API_KEY + FAL_API_KEY
2. 🔴 curl 测试 5 个 endpoint
3. 🔴 Hermes 建 generator.html（先走 huashu-design 流程）
4. 🟡 联调：generator.html ↔ API
5. 🟡 Codex 交叉检查报告
6. ⚪ Pipeline 继续加飞书记录
7. ⚪ 修复 pre-commit hook

## Rules
- detail?id=N = data[N] array index
- Do not touch old prompts
- pre-commit hook disabled (broken)
- Sandbox blocks video.twimg.com (download locally)
- 提交：`git add -A && git commit -m "[Agent] <what>" && git push`
- 禁 `git push --force`
- 编辑 `functions/api/*.js`，不是 `_legacy/netlify/functions/*.mjs`
