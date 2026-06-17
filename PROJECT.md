# kb.snsaladdin.com — Project Master

## Overview

AI知识库会员制サイト。ユーザーは月額 ¥2,980 または年額 ¥30,000 で購読、AI活用記事・プロンプト・ツール情報にアクセスできる。

- **URL:** https://kb.snsaladdin.com
- **Repo:** `yoko-naora/ai-knowledge-base` (main)
- **Local dir:** `C:\Users\jding\kb-site`
- **Host:** Cloudflare Pages (`ai-knowledge-base-v3`, GitHub 自動デプロイ)
- **Main index:** `C:\Users\jding\PROJECTS.md`

## Architecture

```
User → Cloudflare Pages → Static HTML/JS/CSS
                        → Functions/ (Stripe webhook, email, admin API)
                              ↓
                         Stripe API (payment, customer)
                              ↓
                         Resend API (email delivery)
                              ↓
                         Gmail (info@snsaladdin.com)
```

## Completed

- [x] DNS: CNAME `kb` → `ai-knowledge-base-v3.pages.dev.` (value-domain, TTL 180s)
- [x] SSL: Cloudflare 自動証明書
- [x] 全ページ静的生成 (index, articles/001-037, prompts/index, detail, checkout, success, admin, tokushoho, free-prompts)
- [x] 中日バイリンガル対応 (nav, footer, article, prompts)
- [x] Stripe Payment Links (月額 ¥2,980 / 年額 ¥30,000)
- [x] Stripe Webhook → Resend 購読完了メール (2026-05-30 再検証・全リンク正常確認済)
- [x] 無料5選メール自動送信 (send-lead-email)
- [x] 週次更新メール (send-weekly, baseline 初期化済)
- [x] Admin 顧客管理画面 (税額/小計/実付 表示対応済, 2026-05-30)
- [x] プロンプト詳細頁 コピーボタン + 言語切替修正
- [x] 免費提示詞頁 (free-prompts.html)
- [x] 設計規範統一 (Noto Sans/Serif JP, 字号体系)
- [x] 2026-05-30 作業: Webhook デバッグ完了 (v2→v3 移行確認, 監視ログ追加)
- [x] 2026-05-30 作業: Admin 実付金額修正 (3層フォールバック: PI→invoice→subtotal+tax)
- [x] 2026-05-30 作業: Admin 税額/小計/実付カラム追加 + ¥0 表示修正
- [x] 2026-05-30 作業: サブスクリプション取消 API (POST /api/admin-customers?action=cancel)
- [x] 2026-05-30 作業: テストルール確立 (TEST.md, コード内 TEST コメント, feedback-test-rule 記憶)
- [x] 2026-05-30 作業: 本番テスト決済実施 → Webhook→メール→Admin 全リンク確認
- [x] v3 プロジェクト移行（v1+v2 削除、GitHub 自動デプロイ）
- [x] 404 ページ作成
- [x] ナビ ハンバーガーメニュー（900px 以下対応）
- [x] Success 頁 no-session-note 中文対応
- [x] Stripe Webhook URL 更新 → kb.snsaladdin.com
- [x] Statement Descriptor 変更 → AI CHISHIKIKO
- [x] テスト購読 5 件取消
- [x] Admin メール bypass 追加（yokonaora@gmail.com）
- [x] 成果物管理リスト DELIVERABLES.md 作成
- [x] 2時間直播脚本 保存
- [x] TikTok 日本語プロフィール文案 完成
- [x] yokonaora@gmail.com 全記事免付費 bypass（main.js 34頁覆蓋 + 服務端 check-subscription + #admin URL hash）
- [x] 直播滾圖 + 脚本分離（livestream-combined.html 主畫面 + 直播脚本-2小时.html 独立弹窗）
- [x] 直播滾圖 bat 更新（脱离 WSL 依赖，直連 kb-site 目錄）
- [x] 直播滾圖文字疊層全刪除（純圖片）
- [x] 脚本頁頂部「滾圖关了？点此重新打开」鏈接
- [x] Cloudflare Web Analytics 開啟 + analytics.html 實時統計面板
- [x] 全 34 頁 pageview beacon（main.js 統一追蹤）
- [x] 直播 bat 開 3 窗：滾圖 + 脚本 + 統計面板
- [x] admin bypass 修復 — main.js 主動檢查 kb_email、prompts/detail.html 補齊 email check
- [x] prompts/detail.html 浮動翻頁箭頭（←上一頁/下一页→，中日雙語，手機隱藏）
- [x] prompts/detail.html 即時語言切換（無頁面刷新，CustomEvent 驅動）
- [x] 語言切換架構統一 — main.js 入口 → langchange event → detail 監聽，消除 switchLang 衝突
- [x] 補完 Seedance 動画 id=26（Sam Altman偷拍主题）
- [x] 2026-06-07: Article 026 创建 + 首页卡片 ([Hermes])
- [x] 2026-06-07: CLAUDE.md + AGENTS.md 三端共享规则文件 ([Claude])
- [x] 2026-06-07: 多Agent分工确立（Claude=后端+Hermes=前端+Codex=测试/内容）
- [x] 2026-06-08: 四层架构搭建 — Foundation (_context/ + _registry/) + Blocks (_blocks/ + STYLE-GUIDE.md) + Skills (_skills/routes/ 6条生产线 + qc.md) ([Claude])
- [x] 2026-06-08: 创作中心产品定义 (PRODUCT-BRIEF.md) — 从0开始3入口 + 参考某文3入口 ([Claude])
- [x] 2026-06-08: 品牌视觉锁 (VISUAL-DNA.md + STYLE-GUIDE.md) — 杂志高级风 + 订阅者4风格路由 ([Claude])
- [x] 2026-06-08: yijian-chengpian 首次公众号生产测试通过 — 选题→写作→封面→草稿箱，端到端验证 ([Claude])
- [x] 2026-06-09: 首页重构方案确定 — 新 index.html=Landing Page（视频→痛点→案例→购买），旧 index→insights.html（3板块筛选）([Claude])
- [x] 2026-06-09: 旧 index.html → insights.html 备份完成 ([Claude])

## Completed (2026-06-09)

- [x] 去付费墙：删除 gating.js + main.js admin bypass + prompts/detail.html 死代码
- [x] insights.html 板块化：3 筛选标签（前沿追踪14/上手实战6/搞钱案例6）+ 26篇文章分类
- [x] 全局 nav 更新：33 页面 index.html → insights.html
- [x] **insights.html 重组**：删 About/Who/Pain/免费试读/Lead Magnet，保留轮播+文章列表+定价+FINAL CTA
- [x] insights.html 去冗余：删 ~100行死 CSS + 所有 emoji 图标 + 免费/付费 badge
- [x] 全站导航统一：用AI看图作图\|大神工具\|大神文章\|大神提示词\|定价\|订阅
- [x] 全站脚注统一：©用AI看图作图\|SNS Aladdin\|特定商取引法\|Community badges\|Line QR
- [x] Logo 改名：AI知識庫 → 用AI看图作图
- [x] 文案改名：最新技术→大神文章，最新提示词→大神提示词
- [x] Skill 同步基础设施修复：Hermes 50+ 损坏符号链接修复 + sync-skills.ps1 创建
- [x] HERMES-RULES.md 创建：开工5条检查+Skill铁律+硬写禁令

## Completed (2026-06-12)

- [x] **大神工具-设计文档.md v2** — 8步工作流（主题→第一稿→加料→第二稿→质检→配图→封面→终稿）、数据模型、技能映射
- [x] **大神工具-三端分工计划.md v1** — Claude/Hermes/Codex 三端分工、依赖链、测试清单、文件清单
- [x] **5 个 API endpoint 写完并推送** — writing-fragments (Haiku) / writing-shape (Sonnet) / dbs-content (Haiku) / recommend-prompts (fetch+keyword) / generate-cover (fal.ai)
- [x] **HANDOFF.md 更新** — 全模块状态表、环境变量配置状态、待办优先级
- [x] **Phase 1 预研完成** — 读 prompts/data.json（9类57条）、STYLE-GUIDE.md（品牌路由）、CF Function 范式（stripe-webhook.js）

## Completed (2026-06-16)

- [x] **creator-simple.html** — 最小可卖产品页上线。登录→行业+话题→三类型推荐（人设·行业产品·大众话题）+ 弹窗查看原文提示词 + 复制回填 + 工具卡片（4格式×Skill链+使用方法）
- [x] **提示词推荐引擎** — 57条预分类、16行业×类别映射、日期优先排序、Top 8 智能换一批（行业感知随机抽）
- [x] **detail.html 极简重写** — 80行纯HTML+JS，零外部依赖，sessionStorage秒开
- [x] **creator-simple.html modal** — 纯DOM API构建弹窗，展示原文+图片+提示词+详情链接
- [x] **5 skill更新** — notebooklm/skill-creator/frontend-design/runninghub 更新成功，baoyu-article-illustrator路径修复
- [x] **skill-update-workflow 记忆** — Claude执行更新+Hermes检测审计の標準流程確立

## In Progress

- [ ] **提示词库扩充** — 5缺口行業（家装/餐饮/旅游/医疗/宠物）各补2-4条提示词到 data.json
- [ ] **generator.html** — 已放弃，被 creator-simple.html 替代
- [ ] **Cloudflare 环境变量配置** — ANTHROPIC_API_KEY + FAL_API_KEY（待配）
- [ ] **success.html → creator.html token 集成**

## Completed (2026-06-11)

- [x] **大神工具页 tools.html** — 完成。6条生产线公开橱窗页，每条标注Skill链+模板积木。全站38页nav同步更新。
- [x] **creator.html 完整重写** — 五步向导（登录→列表→7步管线→结果→重做+下载）。进度条+3封面CSS预览+角度/标题AI生成选项+参考模式文章分析+上次同款记忆+file://兼容复制+下载.md/.txt
- [x] **全站nav更新** — 38页 大神工具 `href="#"` → `tools.html`
- [x] **交叉检查** — Codex 24项检查，23✅/1⚠️→CORS已修，最终24/24✅
- [x] **工作准则追加** — ⑥约束优先 + ⑦交叉检查（Claude↔Codex互相审查）

- [x] **creator.html 设计完成** — huashu-design Junior→Full Pass，三平台真实logo，分组底色，左缘识别色，4pt间距+1.25字级，手机横排卡片
- [x] **成品展示页重设计** — 公众号暗底封面+小红书卡片网格+朋友圈post样式，平台badge
- [x] **公众号生产管线端到端验证** — writing-fragments→writing-shape→dbs-ai-check→guizang-social-card-skill→wewrite，产出完整文章+封面+排版
- [x] **baoyu-design skill 安装** — 正确接入设计系统流水线（compile→import→bind→build）
- [x] **open-design 安装** — 152套 DESIGN.md 设计系统就位
- [x] **Stripe 设计系统绑定** — 首次正确使用 baoyu 流程：compile→import-design-system→读_ds_prompt→只用var(--*)token 产出5页XHS滚图
- [x] **Design Canvas 风格预览** — 3话题×3方向并排对比
- [x] index-v1 → index.html 上线（竖列案例+实图，替换旧卡片网格版）
- [x] 痛点文字 vw 换行 bug 修复（clamp→固定字号）
- [x] CLAUDE.md 规则更新：Work Principle #3 视觉产出必须走设计流程 / #4 决策清理 / 指挥→更新对应表 / 三端并行协作
- [x] 废弃文件清理 × 2 轮：CODEX-TASK.md, DESIGN-RACE*, REVIEW-RACE*, IMPECCABLE_TESTPLAN

## Architecture Notes (2026-06-08) · 四层架构

```
Layer 1 · Foundation → CLAUDE.md + _context/ + _registry/
Layer 2 · Blocks     → _blocks/ (guizang模板 + baoyu预设 + STYLE-GUIDE.md)
Layer 3 · Skills     → _skills/routes/ (6调度规则，只调不写) + qc.md
Layer 4 · Projects   → output/
```

核心原则：不再一个 SKILL.md 全包。16 个 skill 各司其职，CLAUDE.md 管路由，STYLE-GUIDE.md 锁视觉参数。

## Architecture Notes (2026-05-27)

語言切換現在是單一機制：`main.js switchLang()` → body class + localStorage + `dispatchEvent('langchange')`。各頁面如需要跟隨語言刷新內容，監聽 `langchange` 事件即可。**不要再寫第二個 switchLang 函數。** See memory: `kb-site-architecture`.

## Generator Status (2026-06)

- 01 + 02 已合并为一个面板（主题 + 写作要求直接生成第一稿）
- 去掉旧「加料面板」checkbox，改用自由文本输入
- 新增 `write-article` endpoint（审题 + 写作一次完成）
- AP 新增 `notes` / `modifications` 参数
- 整体步骤从 7 步缩减为 6 步
- 平台选择新增「朋友圈」
- API 已注入 2026 年日期

## Known Issues

| # | Issue | Priority | Status |
|---|-------|----------|--------|
| 1 | Stripe Automatic Tax (+10%) 生産環境未検証（admin表示インフラは完了） | Medium | 実購読者待ち |
| 2 | 購読者 0 名、週次メール未本番送信 | Low | 集客待ち |
| 3 | DNS 一部 ISP で未伝播（24h TTL 残存） | Low | 待機中 |

## Completed (2026-06-17)

- [x] **提示词库扩充5行业** — 15条入库（家装/餐饮/旅游/医疗/宠物×3）+ 全部配图完成，71/72条有图
- [x] **detail.html 浮动翻页箭头恢复** — ←上一页/下一页→，中日双语，手机隐藏
- [x] **creator-simple 有图优先排序修复** — 避免新无图条目霸占三列推荐
- [x] **推荐逻辑文档** — 完整写出供 Codex 审查
- [x] **ID_MAPPING.md 确认过时** — 旧系统数组下标映射，现已改用 id 字段直查

## Next Actions (優先順) · 使用 Skill

| # | 任务 | 负责 | 说明 |
|---|------|------|------|
| 1 | 话题评分逻辑修复 | Codex | CJK二元分词 + 行业加成权重调整 |
| 2 | 工具卡 GitHubURL 填入 | 手动 | 4个Skill的真实GitHub地址 |
| 3 | 定价页/注册流程 | Claude | 把 creator-simple 接入付费墙 |
| 4 | TikTok 復帰配信 | `video-use` | 已有脚本+滚图 |
| 5 | Cloudflare 配 ANTHROPIC_API_KEY + FAL_API_KEY | 手动 | 拿到 key 后在 CF Dashboard 配置 |

## Key Links

| Service | URL |
|---------|-----|
| 本番サイト | https://kb.snsaladdin.com |
| Cloudflare Dashboard | https://dash.cloudflare.com |
| Stripe Dashboard | https://dashboard.stripe.com |
| Stripe Payment Links | https://dashboard.stripe.com/payment-links |
| Resend Dashboard | https://resend.com |
| Resend Domains | https://resend.com/domains |
| GitHub Repo | https://github.com/yoko-naora/ai-knowledge-base |
| Value-Domain DNS | https://www.value-domain.com |

## Secrets & Environment Variables

**Secrets are NEVER stored in this file.** They live in:

- **Production:** Cloudflare Dashboard → Workers & Pages → `ai-knowledge-base-v3` → Settings → Environment Variables
- **Local dev:** `.env` file (gitignored), template at `.env.example`

Variables needed:

| Variable | Where | Purpose |
|----------|-------|---------|
| `STRIPE_SECRET_KEY` | Cloudflare + .env | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Cloudflare + .env | Webhook signature verification |
| `RESEND_API_KEY` | Cloudflare + .env | Email delivery |
| `ADMIN_KEY` | Cloudflare | Admin page auth (強固なランダム値、デフォルトなし) |
| `ACCESS_CODE` | Cloudflare | 購読完了メールのアクセスコード (デフォルトなし) |
| `CLOUDFLARE_API_TOKEN` | Local only | wrangler deploy |

## Deploy

GitHub 連携済 — `main` ブランチに push すると自動デプロイ。手動デプロイが必要な場合（OAuth ログイン済み `yokonaora@gmail.com`、API Token 不要）：

```
cd C:\Users\jding\kb-site
npx wrangler pages deploy . --project-name=ai-knowledge-base-v3 --branch=main --commit-dirty=true
```

## Design System

See memory: `kb-site-design-system` (2026-05-14)

- Fonts: Noto Sans JP (UI), Noto Serif JP (headings)
- Font sizes: nav 11px, body 14px, footer 11px
- Colors: green badge #2e7d32, orange accent #FF6B35
- Bilingual nav/footer on every page
- All articles share `assets/css/style.css` + `assets/js/main.js`

## File Map

```
kb-site/
├── index.html              # Home (articles, tools, pricing, FAQ)
├── checkout.html           # Payment page (Stripe Payment Links)
├── success.html            # Post-payment thank you
├── admin.html              # Customer management (auth: ADMIN_KEY env var)
├── free-prompts.html       # Free 5 prompts lead magnet
├── tokushoho.html          # 特定商取引法 (legal)
├── CNAME                   # kb.snsaladdin.com
├── CLAUDE.md               # 三端共享规则（真源）
├── AGENTS.md               # 薄桥接 → CLAUDE.md（Codex 入口）
├── TEST.md                 # テスト手順・テストデータ (see: feedback-test-rule)
├── articles/               # 001.html - 037.html (35 articles)
├── prompts/
│   ├── index.html          # Prompt listing
│   ├── detail.html         # Prompt detail (copy btn, lang switch)
│   └── data.json           # 45 prompts data
├── assets/
│   ├── css/style.css       # Shared article styles
│   ├── js/main.js          # Shared JS (lang switch)
│   └── gating.js           # Paywall gating logic
├── functions/
│   └── api/
│       ├── stripe-webhook.js   # Stripe webhook → email
│       ├── send-lead-email.js  # Free 5 prompts email
│       ├── admin-customers.js  # Customer list API
│       └── env-check.js        # Env var diagnostic
├── scripts/
│   ├── send-weekly-update.mjs  # Weekly email sender
│   └── weekly-update.json      # Baseline state
├── images/                 # Article images
├── videos/                 # Article videos
└── _legacy/netlify/        # Legacy — DELETE AFTER 2026-06-25
```

## Security (2026-06-05 审计后更新)

### 认证方式
- **Admin**: `ADMIN_KEY` 环境变量 → 服务端验证 (不再用客户端 hash)
- **付费墙**: Stripe 邮箱验证 → `/api/check-subscription?email=`
- **Access Code**: `ACCESS_CODE` 环境变量 → `/api/check-subscription?code=`
- **Webhook**: Stripe 签名验证 (`stripe-signature` header)

### 已移除的安全漏洞
- `admin2026` 默认密码 → 必须设置 `ADMIN_KEY` 环境变量
- `yokonaora@gmail.com` 硬编码后门 → 已删除
- `#admin` URL hash 绕过 → 已删除
- `aiknowledge2026` 硬编码 access code → 改为 `ACCESS_CODE` 环境变量
- 客户端 SHA-256 hash 验证 → 改为服务端验证
- 电话号码 PII 暴露 → 已脱敏
- CORS `*` 通配符 → 限制为 `https://kb.snsaladdin.com`
- API 错误消息泄露内部信息 → 已清理

### 安全头 (Cloudflare `_headers`)
- HSTS (max-age=1年)
- Content-Security-Policy
- X-Frame-Options: DENY
- Permissions-Policy

### 修改文件时注意
- **实际部署平台**: Cloudflare Pages (不是 Netlify)
- **函数目录**: `functions/api/` (不是 `_legacy/netlify/functions/`)
- **环境变量**: Cloudflare Dashboard → Workers & Pages → ai-knowledge-base-v3 → Settings
- **敏感文件屏蔽**: `_redirects` + `_headers`
- **验证部署**: `curl -sI https://kb.snsaladdin.com/` 检查 `Server: cloudflare`
- **无硬编码**: 所有密钥走 `context.env.XXX`，代码中不存在 `|| "default"` 回退值
