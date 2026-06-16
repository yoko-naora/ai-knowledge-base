# CLAUDE.md — kb.snsaladdin.com（精简版）

## 项目

AI知识库会员制サイト。月額 ¥2,980 / 年額 ¥30,000 購読。
URL: https://kb.snsaladdin.com | GitHub: yoko-naora/ai-knowledge-base (main)

## 开工/收工（三端共享，Claude·Hermes·Codex 必守）

```
开工：
  1. 读 _context/SESSION.md（恢复上次上下文）
  2. 读 git log -3（看最近改动）
  3. 开工分级：
     - 新功能/大改动 → 读 C:\Users\jding\PROJECTS.md + 各 PROJECT.md + 跑 preflight.ps1
     - 小修/文案/错字/明确请求 → 跳过全项目简报和 preflight，直接做
  4. 判断标准：涉及支付/安全/生成器逻辑/新文件 → 完整开工；纯文案/样式/错字/注释 → 快速开工

收工（只有被说话的那一端执行写操作）：
  1. 更新 _context/SESSION.md（项目状态 + 今日待办）
  2. git add -A && git commit -m "简述" && git push
  3. 简报（今日成果一行 + 明日第一步一行）
  4. 交叉检查手渡し（格式见下方交叉检查）
```

---

## 核心铁律

### 1. 工作目录
`C:\Users\jding\kb-site`。不搞双目录。镜像 `OneDrive\ドキュメント\kb.snsaladdin\` 只读参考，真源在此。

### 2. 直接改源文件
不用 Python 中间层生成 HTML。脚本归档在 `scripts/` 仅供参考。

### 3. 变更即提交
改完就 `git add -A && git commit -m "<简述>" && git push`

### 4. 语言切换
一个 `switchLang` 在 `main.js`。用 `langchange` 事件通知各页面。**不写第二个 switchLang。**

### 5. 改前必读
- **视觉产出** → 先读 `_blocks/STYLE-GUIDE.md`
- **支付/用户认证/安全** → 先读 `SECURITY.md`，所有密钥从 `context.env.XXX` 拿，不写默认值

---

## 沟通规则

- **先说结论**。第一句就是答案，再展开理由。
- 给出选项时附带风险说明。不默认替用户做决定。
- 对不确定的方案标注「不确定」并给出备选。
- 拒绝模糊指示——"做一下"不够，要问清楚目标、人群、范围。

---

## 质量规则

- 改完必须验证——跑测试、检查输出、确认不影响已有功能。
- 注释写"为什么"不写"是什么"。
- 函数/模块职责单一。不藏副作用。
- 交付前自检：功能是否完整？边界是否处理了？是否引入未讨论的变更？

---

## 安全规则

- 写代码/删代码/改流程前，必须先确认。例外：纯文案·错字·注释·格式化·局部变量重命名等不影响行为的变更可免确认。
- 不改不熟悉的 AI 库、框架、依赖。
- 不改 git 历史。不 reset --hard / checkout -- 除非明确要求。
- 所有密钥从 context.env.XXX 读，不存在默认值回退。
- 不改 CLAUDE.md / AGENTS.md 之外的配置规则文件，除非明确提到。

---

## 交叉检查手渡し格式

```
## 交叉检查手渡し
**作業Agent:** [Claude / Hermes / Codex]
**プロジェクト:** [name]
**変更内容:** [做了什么，一行]
**変更ファイル:** [list]
**テスト:** [跑了什么测试，结果]
**自己チェック:** [自己觉得有风险的点]
**関連ルール:** [本次应该遵守的规则条目]
```

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
├── _context/ / _blocks/ / _registry/ / _skills/  # 设计系统与路由
├── CLAUDE.md / AGENTS.md / PROJECT.md / TEST.md / SECURITY.md
├── _legacy/                                       # 待清理
└── output/                                         # 产出缓存
```
