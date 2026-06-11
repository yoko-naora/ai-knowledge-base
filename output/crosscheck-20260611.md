# 交叉检查手渡し · 2026-06-11

**作業Agent:** Claude
**检查Agent:** Codex
**プロジェクト:** kb.snsaladdin.com — creator.html 完整重写

---

## 检查清单（Codex 执行）

### A. 规则遵守（读文件 + grep）

| # | 检查项 | 怎么验 |
|---|--------|--------|
| A1 | Claude 是否读了 CLAUDE.md？ | 看 CLAUDE.md 的修改时间，是否在 creator.html 修改之前 |
| A2 | 是否用了 `frontend-design` 或 `huashu-design` skill？ | 看 transcript 或问用户——Claude 有没有 invoke Skill tool |
| A3 | 是否遵守设计系统？(`var(--paper)`, `var(--gold)`, `Noto Sans/Serif JP`) | `grep -c "var(--paper)" creator.html` |
| A4 | 是否遵守字体规则？（禁止 Inter/Roboto/rem） | `grep -i "inter\|roboto\|rem" creator.html` |
| A5 | 是否遵守工作目录？ | 文件是否在 `C:\Users\jding\kb-site\` 下 |

### B. 代码质量（grep + 打开文件检查）

| # | 检查项 | 怎么验 |
|---|--------|--------|
| B1 | 无硬编码密钥 | `grep -iE "password|secret|key|token.*=" creator.html` |
| B2 | nav/footer 与 tools.html 一致 | diff creator.html tools.html 的 nav 和 footer 部分 |
| B3 | 无 `switchLang` 重复定义 | `grep -c "function switchLang" creator.html` |
| B4 | JS 无语法错误 | 浏览器 F12 console 走一遍完整流程，0 error |
| B5 | 所有按钮 onclick 函数存在 | grep onclick= → 逐个确认函数定义存在 |

### C. 功能完整性（浏览器手动走流程）

| # | 检查项 | 怎么验 |
|---|--------|--------|
| C1 | 登录→文稿列表 | 输入 yokonaora@gmail.com |
| C2 | 新建→7步走通（公众号） | 选入口→输入话题→5问→选题→标题→封面→排版→生成 |
| C3 | 新建→6步走通（小红书） | 同样完整走一遍 |
| C4 | 角度/标题是选项不是空框 | Step 3 和 Step 4 应有预生成文字 |
| C5 | 参考模式有分析步骤 | 选 ref 入口→贴 URL→出现分析面板 |
| C6 | 下载 .md 和 .txt | 结果页点下载，文件内容完整 |
| C7 | 重做→数据保留 | 点重做→回步骤1→之前填的还在 |
| C8 | 返回/取消每个都通 | 每步点返回→数据保留；点取消→回列表 |
| C9 | 中/日切换 | 全流程文案跟随 |

### D. 安全问题

| # | 检查项 | 怎么验 |
|---|--------|--------|
| D1 | 无客户端密码验证 | `grep -i "===\s*['\"]admin\|hash\|password" creator.html` |
| D2 | 敏感信息不在 HTML 中 | `grep -i "sk-|api_key|Bearer" creator.html` |
| D3 | CORS 无 * | `grep "Access-Control" functions/api/*.js` |

---

## 产出要求

Codex 执行后，输出：
1. 每项的 ✅/❌ 结果
2. ❌ 项的具体位置（文件名+行号+内容）
3. 修复建议

交给 Claude 修。
