# CLAUDE.md — kb.snsaladdin.com（精简版）

## 项目

AI知识库会员制サイト。月額 ¥2,980 / 年額 ¥30,000 購読。
URL: https://kb.snsaladdin.com | GitHub: yoko-naora/ai-knowledge-base (main)

## 核心铁律

### 0. 开工
`.\scripts\preflight.ps1` — 不跑 = 不开工。不一致会自动修+commit。

### 1. 工作目录
`C:\Users\jding\kb-site`。不搞双目录。

### 2. 直接改源文件
不用 Python 中间层生成 HTML。需要改 `generator.html` 就改源文件，不走 `write_gen*.py` → patch 管线。脚本归档在 `scripts/` 仅供参考。

### 3. 开工前查
- **视觉产出** → 先读 `_blocks/STYLE-GUIDE.md`，确定风格和工具再动手
- **支付/用户认证/安全相关** → 先读 `SECURITY.md`，所有密钥从 `context.env.XXX` 拿，不写默认值

### 4. 语言切换
一个 `switchLang` 函数在 `main.js`。用 `langchange` 事件通知各页面。**不再写第二个 switchLang。**

### 5. 变更即提交
改完就 `git add -A && git commit -m "<简述>" && git push`

---

## generator.html 当前流程（2026-06）

- 01 + 02 已合并为一个面板（主题 + 写作要求直接生成第一稿）
- 去掉旧「加料面板」checkbox，改用自由文本输入
- 新增 `write-article` endpoint（审题 + 写作一次完成）
- AP 新增 `notes` / `modifications` 参数
- 整体步骤从 7 步缩减为 6 步
- 平台选择新增「朋友圈」
- API 已注入 2026 年日期

---

## 快速参考

### Deploy
```
cd C:\Users\jding\kb-site
npx wrangler pages deploy . --project-name=ai-knowledge-base-v3 --branch=main --commit-dirty=true
```

### 测试
| 项目 | 值 |
|------|-----|
| Test card | 4242 4242 4242 4242 |
| Test email | yokonaora@gmail.com |
| CF project | ai-knowledge-base-v3 |

### Key Links
- Cloudflare: https://dash.cloudflare.com
- Stripe: https://dashboard.stripe.com
- Resend: https://resend.com
- GitHub: https://github.com/yoko-naora/ai-knowledge-base

### Known Issues
- Stripe Automatic Tax (+10%) 生产环境未验证
- 订阅者 0 名，周次邮件未本番发送

### 目录结构
```
kb-site/
├── index.html / creator.html / generator.html  # 页面
├── tools.html / insights.html / free-prompts.html
├── articles/ / prompts/ / images/ / assets/     # 内容
├── functions/api/                                # Cloudflare Functions
├── scripts/                                       # 参考脚本（已归档）
├── _blocks/ / _context/ / _registry/ / _skills/  # 设计系统与路由
├── CLAUDE.md / AGENTS.md / PROJECT.md / TEST.md / SECURITY.md
├── _legacy/                                       # 待清理
└── output/                                         # 产出缓存
```
