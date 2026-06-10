# CLAUDE.md — kb.snsaladdin.com

**This is the single source of truth for ALL agents (Claude Code / Hermes / Codex).**
Every agent working on this project reads this file first.

---

## Project Overview

AI知识库会员制サイト。月額 ¥2,980 / 年額 ¥30,000 購読。AI活用記事・プロンプト・ツール情報。
**v2：创作中心——creator.html MVP 已完成。订阅者输入话题/文章URL，产出各平台成品。**

- **URL:** https://kb.snsaladdin.com
- **Repo:** `yoko-naora/ai-knowledge-base` (main branch)
- **Local dir (Windows):** `C:\Users\jding\kb-site`
- **Host:** Cloudflare Pages (`ai-knowledge-base-v3`), GitHub auto-deploy on push
- **Main index:** `C:\Users\jding\PROJECTS.md`

## Four-Layer Architecture

```
Layer 1 · Foundation  → CLAUDE.md + _context/ + _registry/
Layer 2 · Blocks      → _blocks/ (guizang 模板 + baoyu 预设 + STYLE-GUIDE.md)
Layer 3 · Skills      → _skills/routes/ (6 条调度规则) + qc.md
Layer 4 · Projects    → output/ 产出目录
```

### Layer 1 · Foundation（地基）

| 文件 | 内容 |
|------|------|
| `_context/BRAND.md` | SNS Aladdin 品牌语调、禁用词、受众 |
| `_context/VISUAL-DNA.md` | 杂志高级风 Identity Test + 订阅者 4 风格 |
| `_context/PRODUCT-BRIEF.md` | 产品定义、创作中心 6 入口、发布策略 |
| `_registry/SKILLS.md` | 所有可用 skill 索引（内容/视觉/发布） |
| `_registry/BLOCKS.md` | 所有视觉积木索引（guizang/baoyu/wewrite） |

### Layer 2 · Blocks（积木）

**视觉路由总锁：`_blocks/STYLE-GUIDE.md`——任何视觉产出前必须查此表。**

| 目录 | 内容 |
|------|------|
| `_blocks/guizang/templates/` | editorial-card.html + swiss-card.html（种子模板） |
| `_blocks/baoyu/cover-presets/` | magazine/tech/warm 封面 preset |
| `_blocks/baoyu/xhs-presets/` | knowledge-card/warm-share/sketch-summary/cute-share 小红书 preset |

### Layer 3 · Skills（调度规则）

| 文件 | 场景 |
|------|------|
| `_skills/routes/scratch-wechat.md` | 从0开始 → 公众号长文 |
| `_skills/routes/scratch-xhs.md` | 从0开始 → 小红书滚图 |
| `_skills/routes/scratch-moments.md` | 从0开始 → 朋友圈图文 |
| `_skills/routes/reference-wechat.md` | 参考某文 → 公众号仿写 |
| `_skills/routes/reference-xhs.md` | 参考某文 → 小红书仿写 |
| `_skills/routes/reference-moments.md` | 参考某文 → 朋友圈改编 |
| `_skills/qc.md` | 质检规则（AI 味检测/高风险/标题优化） |

## Creative Center Routing（创作中心调度）

### 用户触发 → 读对应 route 文件 → 按顺序调 skill

```
用户说"写一篇公众号关于XX" → 读 scratch-wechat.md → 执行
用户说"参考这篇文章写小红书" → 读 reference-xhs.md → 执行
```

### 通用生产流水线

```
输入（话题/URL）
  ↓
选题（writing-fragments → 3 选题 → AskUserQuestion 选 1）
  ↓
写作（writing-shape → 按平台规则写）
  ↓
质检（dbs-ai-check → 自动修 → 复检 → 最多 3 轮）
  高风险内容 → 提醒用户；其余静默
  ↓
配图（读 STYLE-GUIDE.md → 查表确定工具和积木 → 执行）
  ↓
交付（告知用户成品路径 + 下一步手动操作）
```

## Visual Production Rules（视觉生产铁律）

### 🔴 Pre-flight Checklist（配图前必须全部 Yes）

| # | 检查项 | 状态 |
|---|--------|:--:|
| 1 | 已读 `_blocks/STYLE-GUIDE.md`，确定了风格和工具 | ⬜ |
| 2 | 如果用 guizang → 已拷种子模板，未手写 HTML/CSS | ⬜ |
| 3 | 如果用 baoyu → 已读对应 preset 文件，写了 prompt 到 prompts/ | ⬜ |
| 4 | 已确定 recipe/布局（每页一个 recipe） | ⬜ |
| 5 | 验证脚本已跑（guizang: `validate-social-deck.mjs`；baoyu: 检查中文可读） | ⬜ |

任一为 No → 阻断，不得交付。

### 工具选择原则

| 需求 | 工具 | 原因 |
|------|------|------|
| 文字必须 100% 准确 | guizang（HTML → Playwright 截图） | AI 生图中文错误率高 |
| 需要视觉冲击/氛围 | baoyu-cover-image（AI 生图） | CSS 做不出手绘/水彩 |
| 数据对比/流程图 | baoyu-infographic | 21 布局 × 22 风格 |
| 文字转微信 HTML | wewrite | 16 套主题 |

### 禁止事项

1. 手写 HTML/CSS 替代种子模板
2. 跳过 STYLE-GUIDE.md 凭感觉选工具
3. Swiss 和 Editorial 在同一套图中混搭
4. AI 生图用在文字必须准确的卡上
5. emoji 出现在任何视觉产出里

---

## ⚠️ CRITICAL: Working Directory

**The working directory is `C:\Users\jding\kb-site`.**

**Rule:** Before editing ANY file, confirm you are in `C:\Users\jding\kb-site`. Never clone a new copy.

## Architecture

```
User → Cloudflare Pages → Static HTML/JS/CSS
                        → functions/api/ (Stripe webhook, email, admin)
                              ↓
                         Stripe API (payment, customer)
                              ↓
                         Resend API (email delivery)
                              ↓
                         Gmail (info@snsaladdin.com)
```

- **Platform:** Cloudflare Pages (NOT Netlify — `netlify/` is legacy, DO NOT EDIT)
- **Functions dir:** `functions/api/*.js` (deployed) — `netlify/functions/*.mjs` is source only
- **Verify platform:** `curl -sI https://kb.snsaladdin.com` → `Server: cloudflare`
- **Env vars:** Cloudflare Dashboard → Workers & Pages → `ai-knowledge-base-v3` → Settings → Environment Variables

## Before Editing Any File

1. `curl -sI https://kb.snsaladdin.com/` — confirm `Server: cloudflare`
2. Edit `functions/api/*.js`, NOT `netlify/functions/*.mjs`
3. After deploy, verify: `curl "https://kb.snsaladdin.com/api/..."` with `?t=<timestamp>` to bypass CDN cache

## Security Constraints (EVERY code change must follow)

- **All secrets from `context.env.XXX` — no default values, no `|| "fallback"`**
- Never hardcode emails, passwords, access codes in source
- All auth on server side — no client-side hash comparison
- When editing `admin-customers.js`: never expose full phone numbers
- `.env.example` values must be `change-me-xxx`
- Audit: `grep -rE "(password|secret|key|token|code)\s*=\s*['\"][a-zA-Z0-9]"`

## Language Switch Architecture (DO NOT BREAK)

```
main.js switchLang()          ← THE ONLY switchLang function. ONE.
  → body.classList.toggle('show-jp')
  → localStorage.setItem('kb-lang')
  → dispatchEvent('langchange')
     → detail.html listens → renderPrompt()
```

**NEVER write a second `switchLang` function.**

## Design System

| Element | Spec |
|---------|------|
| UI font | `'Noto Sans JP', sans-serif` |
| Heading font | `'Noto Serif JP', serif` |
| Mono font | `'Courier New', monospace` |
| Nav links | 11px |
| Body text | 14px |
| Footer | 11px |
| pre/code | 12px |
| .quote/.tip | 13px |
| Green badge | `#2e7d32` |
| Orange accent | `#FF6B35` |

**Forbidden:** `Noto Sans SC`, `-apple-system`, `SF Mono`, font-weight 300, `rem` units (use `px`).

## Work Principles (ALL agents must follow)

### 1. Commit after every change
```
git add -A && git commit -m "<agent>: <what>" && git push
```

### 2. Check blast radius before infra changes

### 3. Log immediately after task completion

### 4. 决策变更 = 立即清理旧产物（铁律）
**When a plan is abandoned or a decision is reversed, delete ALL related files IMMEDIATELY.**
- Old task files (CODEX-TASK.md, DESIGN-RACE-*.md, etc.) → `git rm`
- Stale branches → delete
- Outdated references in CLAUDE.md / PROJECT.md → update
- **Why:** 僵尸文件会误导下一个 Agent，浪费开工时间。这不是"以后再说"的事，是决策变更的一部分。
- **Test:** 新 Agent 开工时，读到的每一个文件都应该是当前有效的。

### 5. 收工 protocol
- Step 0: **审计** — 有没有今天淘汰的文件/分支？有就立刻删
- Step 1: Update PROJECT.md (completed ✓, Issues, Next)
- Step 2: `git status` → commit stragglers, confirm pushed
- Step 3: Brief report (today + tomorrow)

### 6. 开工 protocol
1. Read `C:\Users\jding\PROJECTS.md`
2. Read each project's PROJECT.md
3. Brief report

## Testing Rules

| Use | Value |
|-----|-------|
| Test card | `4242 4242 4242 4242` |
| Test email | `yokonaora@gmail.com` |
| Admin password | `admin2026` |
| CF project | `ai-knowledge-base-v3` |
| Production URL | `https://kb.snsaladdin.com` |

Full test manual: `TEST.md`.

## Multi-Agent Collaboration Rules

**Claude Code / Hermes / Codex 三端并行工作。**

### 协作基础
- Before start: `git pull`
- After finish: `git add -A && git commit -m "[AgentName] <description>" && git push`
- Never `git push --force`

### 任务分配规则
> ⚠️ **待定** — 三端如何拆分任务、避免冲突，稍后讨论追加。

## Deploy

GitHub auto-deploy on push to `main`. Manual deploy:
```bash
cd C:\Users\jding\kb-site
npx wrangler pages deploy . --project-name=ai-knowledge-base-v3 --branch=main --commit-dirty=true
```

## File Map

```
kb-site/
├── CLAUDE.md               ← THIS FILE — single source of truth
├── AGENTS.md               ← Thin bridge → CLAUDE.md（Codex 入口）
├── HERMES-RULES.md          ← Hermes 强制规则（开工5条+Skill铁律+硬写禁令）
├── PROJECT.md              ← Project progress
├── TEST.md                 ← Test procedures
│
├── _context/               ← Layer 1 · Foundation
│   ├── BRAND.md
│   ├── VISUAL-DNA.md
│   └── PRODUCT-BRIEF.md
├── _registry/              ← Layer 1 · Index
│   ├── SKILLS.md
│   └── BLOCKS.md
├── _blocks/                ← Layer 2 · Blocks
│   ├── STYLE-GUIDE.md      ← Visual routing lock
│   ├── guizang/templates/
│   └── baoyu/cover-presets/ + xhs-presets/
├── _skills/                ← Layer 3 · Skills
│   ├── routes/（6 调度文件）
│   └── qc.md
│
├── index.html              ← Landing Page（竖列案例+实图，已上线）
├── index-old.html          ← 旧版 Landing Page（卡片网格+emoji，备份）
├── creator.html            ← 创作中心（6入口→表单→状态轮询→文稿列表，MVP）
├── insights.html           ← 文章列表（3板块筛选：前沿追踪/上手实战/搞钱案例）
├── articles/               ← 001.html - 026.html
├── articles-src/           ← Markdown source (new)
├── prompts/                ← Prompt listing
├── creator.html            ← 创作中心（规划中，未建）
├── output/                 ← Layer 4 · Output
├── functions/api/          ← Cloudflare Functions
├── assets/                 ← CSS/JS/images
└── netlify/                ← LEGACY — DO NOT EDIT
```

## Key Links

| Service | URL |
|---------|-----|
| Production | https://kb.snsaladdin.com |
| Cloudflare | https://dash.cloudflare.com |
| Stripe | https://dashboard.stripe.com |
| Resend | https://resend.com |
| GitHub | https://github.com/yoko-naora/ai-knowledge-base |

## 指挥 → 文件更新对应表

| 用户说 | 要做什么 |
|--------|---------|
| 「做完了」「改好了」「修好了」「上线了」 | 更新 `PROJECT.md`：Completed 加条目，In Progress 移除，Next Actions 刷新 |
| 「删了」「不用了」「换方案」 | 更新 `PROJECT.md` + `git rm` 相关文件（见 Work Principle #4） |
| 「收工」 | 执行收工 protocol 全部 4 步 |
| 「开工」 | 读 PROJECTS.md → PROJECT.md → 简报 |
| 改了 CLAUDE.md 本身 | commit message 标注 `[Claude]`（其他 agent 同理） |

## Quick Reference: Common Pitfalls

1. **DON'T** edit `netlify/functions/` — legacy, not deployed
2. **DON'T** create a second `switchLang` function — use `langchange` event
3. **DON'T** use `rem` units — use `px`
4. **DON'T** hardcode secrets — use env vars
5. **DON'T** force push — use `pull --rebase`
6. **DON'T** work in `ai-knowledge-base` directory — use `kb-site`
7. **DON'T** Glob-search for PROJECT.md on 开工 — path is `C:\Users\jding\PROJECTS.md`
8. **DON'T** expose full phone numbers in `admin-customers.js`
9. **DON'T** skip STYLE-GUIDE.md before visual production
10. **DON'T** hand-write HTML/CSS for guizang cards — copy seed template
11. **DON'T** use AI-generated images for text-accurate cards
