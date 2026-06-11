# Task Gate — 开工前 30 秒

**This is THE first file every agent reads. Before ANY tool call, answer all 3 questions below.**
Answering "I don't know" is acceptable — skipping the questions is not.

---

## Q1: What type of task is this?

| 我做的事 | 必须用 |
|----------|--------|
| 做图/设计/原型/HTML视觉 | `huashu-design` → 四问 → Junior Pass → 确认 → Full Pass |
| 用 guizang 模板 | 拷种子文件，**禁止手写** HTML/CSS |
| 用 baoyu 生图 | 读 preset 文件，写 prompt 到 `prompts/` |
| 写文章/文案 | `writing-fragments` → `writing-shape` → `dbs-ai-check` QC |
| 修 bug/加功能 | `systematic-debugging` 或 `tdd` |
| 商业诊断 | `dbs-diagnosis` |
| 处理死文件 | Dead File Protocol（CLAUDE.md） |

**Answer:** 我的任务是______，应该调用的 skill 是______

## Q2: What template/积木/reference exists?

搜索（不要凭记忆）：
- `_blocks/guizang/templates/` — 视觉模板
- `_blocks/baoyu/` — 生图 preset
- `_skills/routes/` — 内容调度规则
- `_context/` — BRAND / VISUAL-DNA / PRODUCT-BRIEF

**Answer:** 已读______（具体路径），没有就写"无"

## Q3: What files will I touch?

- 活代码：`functions/api/*.js`（不是 `_legacy/netlify/`）
- 死文件：`_legacy/` 里的只读不写
- 配置文件：`CLAUDE.md` / `PROJECT.md` / HERMES-RULES.md

**Answer:** 我会修改______，只读______

---

**如果任一问题答"不知道"→ 先查再开工。**
**跳过此文件 → 用户会说"你又自己瞎做"→ 重来。**
