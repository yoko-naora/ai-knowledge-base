# CLAUDE.md — kb.snsaladdin.com

**This is the single source of truth for ALL agents (Claude Code / Hermes / Codex).**
Every agent working on this project reads this file first.

---

## Project Overview

AI知识库会员制サイト。月額 ¥2,980 / 年額 ¥30,000 購読。AI活用記事・プロンプト・ツール情報。

- **URL:** https://kb.snsaladdin.com
- **Repo:** `yoko-naora/ai-knowledge-base` (main branch)
- **Local dir (Windows):** `C:\Users\jding\kb-site`
- **Host:** Cloudflare Pages (`ai-knowledge-base-v3`), GitHub auto-deploy on push
- **Main index:** `C:\Users\jding\PROJECTS.md`

## ⚠️ CRITICAL: Working Directory

**The working directory is `C:\Users\jding\kb-site`. There is NO `ai-knowledge-base` directory.**

History: Claude once edited code in `C:\Users\jding\ai-knowledge-base\` and pushed, but the user's actual directory is `kb-site`. Two directories pointing to the same remote but NOT synced locally — user saw no changes, wasted hours debugging a nonexistent "bug."

**Rule:** Before editing ANY file, confirm you are in `C:\Users\jding\kb-site`. Never clone a new copy. If the user gives a `file:///` path, use that directory.

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
- **Env vars:** STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, ADMIN_KEY, CLOUDFLARE_API_TOKEN

## Language Switch Architecture (DO NOT BREAK)

```
main.js switchLang()          ← THE ONLY switchLang function. ONE.
  → body.classList.toggle('show-jp')
  → localStorage.setItem('kb-lang')
  → dispatchEvent('langchange')
     → detail.html listens → renderPrompt()
```

**NEVER write a second `switchLang` function.** Any page needing lang-aware refresh listens to `langchange` event.

CSS rules: `.lang-content.cn` / `.lang-content.jp` controlled by `body.show-jp` in `style.css:227-236`.

Script load order: `main.js` MUST load before page-specific scripts.

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

Full spec in memory: `kb-site-design-system`.

## Work Principles (ALL agents must follow)

### 1. Commit after every change
```
git add -A && git commit -m "<agent>: <what>" && git push
```
Push = auto-deploy. Git history = rollback safety. Don't wait for user to ask.

### 2. Check blast radius before infra changes
Before deleting, renaming, or changing DNS/env vars/credentials, ask:
1. What depends on this?
2. What breaks if I change/delete it?
3. How do I verify after?

### 3. Log immediately after task completion
Update PROJECT.md with [x] on completed items BEFORE user says "收工". User's PC may crash.

### 4. 收工 (end-of-day) protocol
When user says "收工":
- Step 1: Update PROJECT.md (completed ✓, Issues, Next re-sorted)
- Step 2: `git status` → commit any stragglers, confirm pushed
- Step 3: Brief report (today's results 1 line + tomorrow's first step 1 line)

### 5. 开工 (start-of-day) protocol
When user says "开工":
1. Read `C:\Users\jding\PROJECTS.md` (FIXED PATH, never Glob-search)
2. Read each project's PROJECT.md
3. Brief report (each project status + today's top priority)

### 6. Never hardcode secrets
- All keys/passwords/tokens from environment variables
- `.env.example` values must be `change-me-xxx`
- Audit: `grep -rE "(password|secret|key|token|code)\s*=\s*['\"][a-zA-Z0-9]"`

## Testing Rules

### Every feature = code + test data + expected result
Never deploy without verifying. Test steps live in code comments AND TEST.md.

### Test format in file headers:
```
// TEST:
//   curl -s "<URL>" | python3 -c "<check>"
//   预期: field = value
```

### Test what you changed
- Changed only admin-customers → test only admin API
- Changed shared logic → test all impact surfaces
- Run one verification after every change

### Test data

| Use | Value |
|-----|-------|
| Test card | `4242 4242 4242 4242` |
| Test email | `yokonaora@gmail.com` |
| Admin password | `admin2026` |
| CF project | `ai-knowledge-base-v3` |
| Production URL | `https://kb.snsaladdin.com` |

Full test manual: `TEST.md`.

## Multi-Agent Collaboration Rules

**Only ONE agent edits code at a time.** Multiple agents editing simultaneously = merge conflicts.

### Before you start work:
1. `git pull` — get latest changes from other agents
2. Check recent commits for other agents' work

### When you finish work:
1. `git add -A && git commit -m "[AgentName] <description>" && git push`
2. Tag commits with your agent name: `[Claude]`, `[Hermes]`, `[Codex]`
3. If making a big change, declare "占用" (occupying) in commit message or branch name

### Conflict resolution:
- Never `git push --force`
- If conflict: `git pull --rebase`, resolve, then push
- If unsure, create a branch: `git checkout -b <agent>-<feature>` then merge after

### Skill installation:
- Install to `C:\Users\jding\.agents\skills\` (single source of truth)
- Run `C:\Users\jding\.agents\sync-skills.ps1` after install
- All 3 agents share skills via symlinks — install once, all see it

## Deploy

GitHub auto-deploy on push to `main`. Manual deploy if needed:

```bash
cd C:\Users\jding\kb-site
npx wrangler pages deploy . --project-name=ai-knowledge-base-v3 --branch=main --commit-dirty=true
```

## File Map

```
kb-site/
├── index.html              # Home (articles, tools, pricing, FAQ)
├── checkout.html           # Payment page (Stripe Payment Links)
├── success.html            # Post-payment thank you
├── admin.html              # Customer management (auth: admin2026)
├── free-prompts.html       # Free 5 prompts lead magnet
├── tokushoho.html          # 特定商取引法 (legal)
├── CNAME                   # kb.snsaladdin.com
├── CLAUDE.md               # ← THIS FILE — single source of truth
├── AGENTS.md               # Thin bridge → CLAUDE.md (for Codex compat)
├── PROJECT.md              # Project progress, issues, next actions
├── TEST.md                 # Test procedures and test data
├── articles/               # 001.html - 026.html
├── prompts/
│   ├── index.html          # Prompt listing
│   ├── detail.html         # Prompt detail (copy btn, lang switch listener)
│   └── data.json           # Prompts data
├── assets/
│   ├── css/style.css       # Shared article styles
│   ├── js/main.js          # Shared JS (switchLang, admin bypass, pageview)
│   └── gating.js           # Paywall gating logic
├── functions/api/          # ★ Deployed functions (Cloudflare Pages)
│   ├── stripe-webhook.js
│   ├── send-lead-email.js
│   ├── admin-customers.js
│   └── env-check.js
├── scripts/
│   ├── send-weekly-update.mjs
│   └── weekly-update.json
├── images/                 # Article images
├── videos/                 # Article videos
└── netlify/                # LEGACY — DO NOT EDIT
```

## Key Links

| Service | URL |
|---------|-----|
| Production | https://kb.snsaladdin.com |
| Cloudflare | https://dash.cloudflare.com |
| Stripe | https://dashboard.stripe.com |
| Resend | https://resend.com |
| GitHub | https://github.com/yoko-naora/ai-knowledge-base |
| DNS | https://www.value-domain.com |

## Quick Reference: Common Pitfalls

1. **DON'T** edit `netlify/functions/` — it's legacy source, not deployed
2. **DON'T** create a second `switchLang` function — use `langchange` event
3. **DON'T** use `rem` units — use `px`
4. **DON'T** hardcode secrets — use env vars
5. **DON'T** force push — use `pull --rebase`
6. **DON'T** work in `ai-knowledge-base` directory — use `kb-site`
7. **DON'T** Glob-search for PROJECT.md on 开工 — path is `C:\Users\jding\PROJECTS.md`
