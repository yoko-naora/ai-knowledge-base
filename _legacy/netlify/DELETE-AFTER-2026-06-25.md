# LEGACY — DELETE AFTER 2026-06-25

These were the original Netlify Functions (`.mjs` format).
Migrated to Cloudflare Pages → `functions/api/*.js` on 2026-05-22.

## Files
- `functions/admin-customers.mjs`
- `functions/check-subscription.mjs`
- `functions/send-lead-email.mjs`
- `functions/stripe-webhook.mjs`

## Why this exists
- Original Netlify deploy target, replaced by Cloudflare Pages
- CLAUDE.md line 138: "Platform: Cloudflare Pages (NOT Netlify — `netlify/` is legacy, DO NOT EDIT)"

## Action
If nothing references these by **2026-06-25**, delete the entire `_legacy/netlify/` directory.
