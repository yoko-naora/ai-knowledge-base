# CLAUDE.md — kb.snsaladdin.com

## 部署平台

- **Cloudflare Pages** (`ai-knowledge-base-v3`)，不是 Netlify
- GitHub `main` 分支 push 自动部署
- 函数目录: `functions/api/`（不是 `netlify/functions/`）
- 环境变量: Cloudflare Dashboard → Workers & Pages → ai-knowledge-base-v3 → Settings

## 修改文件前必做

1. `curl -sI https://kb.snsaladdin.com/` 确认 `Server: cloudflare`
2. 改函数改 `functions/api/*.js`，不是 `netlify/functions/*.mjs`
3. 验证部署: `curl "https://kb.snsaladdin.com/api/..."` 加 `?t=timestamp` 绕缓存

## 安全约束（修改任何代码都必须遵守）

- **所有密钥从 `context.env.XXX` 读取，无默认值，无 `|| "fallback"`**
- 不在代码中硬编码邮箱、密码、access code
- 所有认证走服务端，不做客户端 hash 比较
- 修改 `admin-customers.js` 时：不暴露完整电话号码

## 关键文件

| 文件 | 用途 |
|------|------|
| `functions/api/admin-customers.js` | 管理 API（需 ADMIN_KEY） |
| `functions/api/check-subscription.js` | 订阅验证 + access code |
| `functions/api/stripe-webhook.js` | Stripe webhook → 发邮件 |
| `assets/gating.js` | 前端付费墙 |
| `admin.html` | 管理面板 |
| `_headers` | Cloudflare 安全头 |
| `_redirects` | 敏感文件屏蔽 |
| `PROJECT.md` | 完整项目文档 |
