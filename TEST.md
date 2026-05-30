# kb-site 测试手册

每次修改功能后，跑对应测试。测试规则也在各文件头部。

## 测试数据

| 用途 | 值 |
|------|-----|
| 测试卡号 | `4242 4242 4242 4242` |
| 测试邮箱 | `yokonaora@gmail.com` |
| Admin 密码 | `admin2026` |
| 项目名 (CF) | `ai-knowledge-base-v3` |
| 生产 URL | `https://kb.snsaladdin.com` |
| 部署命令 | `cd kb-site && npx wrangler pages deploy . --project-name=ai-knowledge-base-v3 --branch=main --commit-dirty=true` |

## Webhook 测试

```
# 端到端
1. Stripe Dashboard → Webhooks → Send test webhook → checkout.session.completed
2. 看 Cloudflare 日志确认: wrangler pages deployment tail <id> --project-name=ai-knowledge-base-v3
3. 预期: [webhook] SUCCESS, Resend 200
4. 验证: yokonaora@gmail.com 收邮件

# 快速可达性
curl -s -X POST "https://kb.snsaladdin.com/api/stripe-webhook" \
  -H "stripe-signature: t=1,v1=bad" -d '{}'
# 预期: 400, "Signature verification failed"
```

## Admin API 测试

```
curl -s "https://kb.snsaladdin.com/api/admin-customers?key=admin2026"
# 预期: customers 数组有数据, active 用户的 actual_paid > 0, subtotal > 0
```

## Admin 页面测试

```
1. 打开 https://kb.snsaladdin.com/admin.html
2. 输入密码 admin2026
3. 预期看到: 小計/税額/实付 三列, 金额以 ¥ 显示, 客户数据正常
```

## 取消订阅测试

```
curl -s -X POST "https://kb.snsaladdin.com/api/admin-customers?key=admin2026&action=cancel&email=yokonaora@gmail.com"
# 预期: {"ok":true,"action":"canceled","email":"yokonaora@gmail.com","subscription_id":"sub_xxx","status":"canceled"}
```

## 支付全流程测试

```
1. 在 Stripe Dashboard 创建测试模式 Payment Link (月额 ¥2,980)
2. 用测试卡 4242 4242 4242 4242 支付
3. Cloudflare 日志确认 webhook 被触发
4. Admin 页面确认新客户出现, actual_paid=2980
5. 确认邮件收到
```
