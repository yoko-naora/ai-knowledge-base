# kb.snsaladdin.com — Project Master

## Overview

AI知识库会员制サイト。ユーザーは月額 ¥2,980 または年額 ¥30,000 で購読、AI活用記事・プロンプト・ツール情報にアクセスできる。

- **URL:** https://kb.snsaladdin.com
- **Repo:** `yoko-naora/ai-knowledge-base` (main)
- **Local dir:** `C:\Users\jding\kb-site`
- **Host:** Cloudflare Pages (`ai-knowledge-base-v2`)
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

- [x] DNS: CNAME `kb` → `kb-snsaladdin.netlify.app.` (value-domain, 末尾 `.` 必須)
- [x] SSL: Cloudflare 自動証明書
- [x] 全ページ静的生成 (index, articles/001-025, prompts/index, detail, checkout, success, admin, tokushoho, free-prompts)
- [x] 中日バイリンガル対応 (nav, footer, article, prompts)
- [x] Stripe Payment Links (月額 ¥2,980 / 年額 ¥30,000)
- [x] Stripe Webhook → Resend 購読完了メール
- [x] 無料5選メール自動送信 (send-lead-email)
- [x] 週次更新メール (send-weekly, baseline 初期化済)
- [x] Admin 顧客管理画面 (/admin.html, パスワード `admin2026`)
- [x] プロンプト詳細頁 コピーボタン + 言語切替修正
- [x] 免費提示詞頁 (free-prompts.html)
- [x] 設計規範統一 (Noto Sans/Serif JP, 字号体系)

## Known Issues

| # | Issue | Priority | Status |
|---|-------|----------|--------|
| 1 | Admin 頁 產品名 + 実付金額顯示不全 | High | 調査中 (2026-05-23) |
| 2 | Stripe Automatic Tax (+10%) 未検証 | High | 待測試 |
| 3 | TEST100 優惠碼測試單未在 admin 顯示 | Medium | 待確認 |
| 4 | 購読者 0 名、週次メール未本番送信 | Low | 集客待ち |

**2026-05-24 対応済:** DNS CNAME を Netlify から Cloudflare Pages に切替、全env var を secret_text 化

## Next Actions (優先順)

1. **Admin 表示修正** — 產品名・実付金額のデバッグ完了
2. **税額検証** — Stripe Tax +10% の webhook データ確認、admin に税額表示
3. **集客開始** — X (yoko/Ai_shukyaku) から kb サイトへの導線
4. **週次メール本番** — 購読者獲得後、初回本番送信

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

- **Production:** Cloudflare Dashboard → Workers & Pages → `ai-knowledge-base-v2` → Settings → Environment Variables
- **Local dev:** `.env` file (gitignored), template at `.env.example`

Variables needed:

| Variable | Where | Purpose |
|----------|-------|---------|
| `STRIPE_SECRET_KEY` | Cloudflare + .env | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Cloudflare + .env | Webhook signature verification |
| `RESEND_API_KEY` | Cloudflare + .env | Email delivery |
| `ADMIN_KEY` | Cloudflare | Admin page auth (default: admin2026) |
| `CLOUDFLARE_API_TOKEN` | Local only | wrangler deploy |

## Deploy

GitHub 連携済 — `main` ブランチに push すると自動デプロイ。手動デプロイが必要な場合：

```
cd C:\Users\jding\kb-site
$env:CLOUDFLARE_API_TOKEN = "<token>"
npx wrangler pages deploy . --project-name=ai-knowledge-base-v2 --branch=main --commit-dirty=true
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
├── admin.html              # Customer management (auth: admin2026)
├── free-prompts.html       # Free 5 prompts lead magnet
├── tokushoho.html          # 特定商取引法 (legal)
├── CNAME                   # kb.snsaladdin.com
├── articles/               # 001.html - 025.html (26 articles)
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
└── netlify/                # Legacy Netlify config (deprecated)
```
