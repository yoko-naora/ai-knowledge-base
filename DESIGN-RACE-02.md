# DESIGN-RACE-02 · index.html Landing Page 设计竞赛（第二次）

> **竞赛编号：** 02
> **发起：** 2026-06-09
> **任务：** kb.snsaladdin.com 首页（Landing Page）重写
> **模式：** Hermes 四 Skill 并行 → 用户肉眼筛选 → Claude impeccable 评审

---

## 0. 开工前必读（铁律，不可跳过）

**Hermes 必须先读以下文件，按顺序，读完一条确认一条：**

| # | 文件 | 确认 |
|---|------|:--:|
| 1 | `HERMES-RULES.md` | ⬜ |
| 2 | `DESIGN-RACE-02.md`（本文件） | ⬜ |
| 3 | `_context\BRAND.md` | ⬜ |
| 4 | `_context\VISUAL-DNA.md` | ⬜ |
| 5 | `_blocks\STYLE-GUIDE.md` | ⬜ |

**5 条全部确认后再开始。**

### Skill 加载验证（每个版本开工前必须做）

```
1. Skill 工具加载 skill 名
2. 返回了真实内容 → ✅ 继续
3. 返回空/报错 → ❌ 立即停止，报告 Claude
4. 加载成功但内容看不懂 → ❌ 停止，问 Claude
```

**禁止：凭 Skill 名字猜功能、加载失败假装用了、跳过 Skill 直接写代码。**

---

## 1. 竞赛规则

```
Hermes 产出 4 版本（V1~V4，每个用不同 Skill，严格按 Skill 流程）
    ↓
Codex 测试 4 版本 → TEST-RACE-02.md
    ↓
用户肉眼筛选（第一轮）
    ↓
Claude 用 impeccable 专业评审（第二轮）→ REVIEW-RACE-02.md
    ↓
选出最佳 → 替换 index.html → commit + deploy
```

---

## 2. 任务：kb.snsaladdin.com Landing Page

### 2.1 产品

| 项目 | 内容 |
|------|------|
| 产品 | AI知识库会员网站 |
| URL | https://kb.snsaladdin.com |
| 价格 | 月额 ¥2,980 / 年额 ¥30,000 |
| 用户 | 一人企业主、知识型个体创业者 |

### 2.2 必须包含的 Section

| # | Section | 说明 |
|---|---------|------|
| 1 | Hero | 视频区 + 主标题 + 副标题 + CTA |
| 2 | Pain Points | 6~7 个痛点 |
| 3 | Pivot | 一句话转折（"不是你不行，是工具跟不上"） |
| 4 | Case Studies | 5 个行业案例 |
| 5 | Pricing | 月额/年额 + 免费 5 选获客表单 |
| 6 | Footer | 链接 + 版权 |

**可以增加 section，不能删减。**

### 2.3 文案

使用当前 `index.html` 的中日双语文案。**可以调整排版、断行、强调方式，不改含义。**

---

## 3. 技术约束（四个版本通用）

```
✅ 单文件 HTML（inline CSS）
✅ 中日双语：.lang-content.cn / .lang-content.jp + body.show-jp
✅ 引用 <script src="assets/js/main.js"></script>
✅ Google Fonts: Noto Serif JP (400,600) + Noto Sans JP (400,500,700)
✅ 响应式：900px + 500px 断点
✅ <meta> OG tags 保留
✅ Nav: 精选文章→insights.html, 提示词→prompts/, 创作中心→creator.html
✅ Nav CTA → #pricing
✅ px 不用 rem
✅ 字体：Noto Sans JP / Noto Serif JP（不禁用 Noto Sans SC，但首选 JP）
❌ 不引入新框架（React/Vue/jQuery）
❌ 不写第二个 switchLang 函数
```

---

## 4. 四个版本（每个必须用不同 Skill）

| 版本 | Skill | 文件名 | 差异化策略 |
|------|-------|--------|-----------|
| V1 | `frontend-design` | `index-v1.html` | 按 frontend-design 流程：先定美学方向→写代码→迭代。发挥其"creative+polished+反AI slop"优势 |
| V2 | `huashu-design` | `index-v2.html` | 按 huashu-design 流程：先走 Junior Designer 模式（写假设+placeholder）→用户确认→Full pass。发挥其"HTML设计师+品牌资产协议"优势 |
| V3 | `ui-ux-pro-max` | `index-v3.html` | 按 ui-ux-pro-max 流程：选风格+调色板+字体配对→组件级设计。发挥其"50风格×21调色板"优势 |
| V4 | `beautiful-html-templates` | `index-v4.html` | 按 beautiful-html-templates 流程：选模板→替换占位内容→适配品牌。发挥其"30+成熟模板"优势 |

### 4.1 品牌约束（放宽，让 Skill 自由发挥）

**建议参考的品牌方向（不强制，供 Skill 自行决定）：**
- 底色：纸色系 `#faf9f6` / `#f3f0e8`
- 强调色：金色 `#b8925a`
- 字体建议：Noto Serif JP（标题）+ Noto Sans JP（正文）

**但：** 如果某个 Skill 的设计哲学认为该用完全不同的配色/字体/布局——**允许**。让每个 Skill 按自己的方法论决定，而不是四个版本被同一个品牌基因锁死。

### 4.2 差异化的最低标准

四个版本必须能肉眼看出明显区别。如果用户看完说"这不都差不多吗"→ 竞赛失败。

**至少要在以下维度中有 2 个明显不同：**
- 布局结构（Hero 区是居中还是左对齐？案例区是 3 列还是横滑？）
- 配色方案（纸色+金色 vs 深色 vs 极简白 vs 其他）
- 排版节奏（字号跳跃比例、留白密度、是否用装饰元素）
- 叙事顺序（先痛点还是先案例？定价放在最前还是最后？）

---

## 5. 交付格式（每个版本）

文件顶部必须写：

```html
<!-- ============================================
DESIGN-RACE-02 | V[N]
Skill: [skill名] | 加载: [成功]
遵循Skill流程: [是]
本版本独特之处: [一句话说明和别的版本哪里不同]
============================================ -->
```

**如果"加载"或"遵循Skill流程"是"否" → 版本无效，不提交。**

---

## 6. Codex 测试清单（15 项）

同 DESIGN-RACE-01 Section 6。

---

## 7. Claude 评审维度

| 维度 | 权重 |
|------|:---:|
| 视觉冲击力 | 25% |
| 品牌一致性 | 20% |
| 转化设计 | 20% |
| 代码质量 | 15% |
| 细节执行 | 20% |

---

## 8. 文件清单

```
kb-site/
├── DESIGN-RACE-02.md     ← 本文件
├── HERMES-RULES.md       ← Hermes 强制规则（必读）
├── index.html            ← 当前线上版本（备份）
├── index-v1.html         ← V1 · frontend-design
├── index-v2.html         ← V2 · huashu-design
├── index-v3.html         ← V3 · ui-ux-pro-max
├── index-v4.html         ← V4 · beautiful-html-templates
├── TEST-RACE-02.md       ← Codex 测试报告（待产出）
└── REVIEW-RACE-02.md     ← Claude 评审报告（待产出）
```

---

## RACE-01 教训（不要重复）

| 问题 | 根因 | RACE-02 修复 |
|------|------|-------------|
| V2/V4 没加载 Skill | Hermes 符号链接损坏 | 已修复，4 Skill 全部真实可用 |
| Skill 不存在硬写 | 没做开工检查 | HERMES-RULES.md 第 1 条强制验证 |
| 4 版本看起来一样 | 品牌约束太紧 | RACE-02 放宽约束，允许 Skill 自由发挥 |
| 写了规则不执行 | 没验证可行性就写 | RACE-02 所有 Skill 已实测加载成功 |
