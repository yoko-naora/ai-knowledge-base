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

## Known Issues

| # | Issue | Priority | Status |
|---|-------|----------|--------|
| 1 | Admin 頁 產品名 + 実付金額顯示不全 | High | 調査中 |
| 2 | Stripe Automatic Tax (+10%) 未検証 | High | 待測試 |
| 3 | 購読者 0 名、週次メール未本番送信 | Low | 集客待ち |
| 4 | DNS 一部 ISP で未伝播（24h TTL 残存） | Low | 待機中 |

## Next Actions (優先順)

1. **TikTok 復帰配信実行** — 直播脚本 + 滚图準備完了、配信日決定
2. **Admin 表示修正** — 產品名・実付金額のデバッグ完了
3. **税額検証** — Stripe Tax +10% の webhook データ確認、admin に税額表示
4. **集客開始** — X (yoko/Ai_shukyaku) から kb サイトへの導線
5. **週次メール本番** — 購読者獲得後、初回本番送信

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
| `ADMIN_KEY` | Cloudflare | Admin page auth (default: admin2026) |
| `CLOUDFLARE_API_TOKEN` | Local only | wrangler deploy |

## Deploy

GitHub 連携済 — `main` ブランチに push すると自動デプロイ。手動デプロイが必要な場合：

```
cd C:\Users\jding\kb-site
$env:CLOUDFLARE_API_TOKEN = "<token>"
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
