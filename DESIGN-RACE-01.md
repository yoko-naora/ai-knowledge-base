# DESIGN-RACE-01 · index.html Landing Page 设计竞赛

> **竞赛编号：** 01
> **发起：** 2026-06-09
> **任务：** kb.snsaladdin.com 首页（Landing Page）重写
> **模式：** 三 Agent 并行 → 横向比较 → 选出最佳

---

## 1. 竞赛规则

```
Hermes 产出 4 版本（V1~V4，各用不同 Skill）
    ↓
Codex 测试 4 版本 → 测试报告
    ↓
用户肉眼筛选（第一轮）
    ↓
Claude 用 impeccable 专业评审（第二轮）→ 评分排名
    ↓
选出最佳 → 替换 index.html → commit + deploy
```

**铁律：**
- 每个 Agent 只做自己的事，不跨职责
- Hermes = 只做设计产出，不改后端/测试
- Codex = 只做测试，不改设计/后端
- Claude = 后端逻辑 + 最终评审，不参与设计

---

## 2. 产品背景

| 项目 | 内容 |
|------|------|
| 产品 | AI知识库会员网站 |
| URL | https://kb.snsaladdin.com |
| 价格 | 月额 ¥2,980 / 年额 ¥30,000 |
| 用户 | 一人企业主、知识型个体创业者 |
| 痛点 | 想做内容获客，缺设计能力、缺时间 |
| 价值主张 | 一个人也能用 AI 做出杂志级专业内容 |
| 品牌调性 | 平等对话、承认难度、短句为主、开门见山 |

---

## 3. 任务规格

### 3.1 页面目的

让目标用户看完后点击订阅（或留下邮箱领免费5选）。

### 3.2 必须包含的 Section（结构不可删减）

| # | Section | 内容 | 目的 |
|---|---------|------|------|
| 1 | **Hero** | 视频区 + 主标题 + 副标题 + CTA | 3秒抓住注意力 |
| 2 | **Pain Points** | 6~7个痛点 | 共鸣→"说的就是我" |
| 3 | **Pivot** | 一句话转折 | "不是你不行，是工具跟不上" |
| 4 | **Case Studies** | 5个行业案例 | 社会证明→"他们都可以" |
| 5 | **Pricing** | 月额/年额 + 免费5选获客表单 | 转化 |
| 6 | **Footer** | 链接 + 版权 | 收尾 |

> 可以增加 section（如 Features、How it Works、FAQ、Testimonials），但不能删减。

### 3.3 文案内容

**使用当前 index.html 的文案（中日双语），不要自己编。**
设计师可以调整排版、断行、强调方式，但不能改动文案含义。

---

## 4. 设计约束（所有版本必须遵守）

### 4.1 品牌视觉基因（来自 VISUAL-DNA.md）

| 维度 | 要求 |
|------|------|
| 风格 | Editorial Magazine × Ink Classic（高级杂志风） |
| 底色 | `#f3f0e8` 或 `#faf9f6`（纸色系） |
| 主色 | 深墨 `#1a1814` / `#0a0a0b` |
| 强调色 | 金 `#b8925a`（不是亮黄、不是橙） |
| 字体 | 标题=Noto Serif JP 500w，UI=Noto Sans JP 400 |
| 氛围 | 慢、体面、有距离感、像翻开一本杂志 |
| 禁用 | Swiss网格、emoji装饰轰炸、卡通、渐变、圆角卡 |

### 4.2 设计规范（来自 kb-site-design-system）

| 元素 | 规范 |
|------|------|
| 导航链接 | 11px |
| 正文 | 14px |
| 页脚 | 11px |
| pre/code | 12px |
| .quote/.tip | 13px |
| 单位 | **px**（不用 rem） |
| 字重 | 400/500/600（禁用 300） |
| 字体 | Noto Sans JP / Noto Serif JP / Courier New（禁用 Noto Sans SC / -apple-system / SF Mono） |

### 4.3 技术约束

```
✅ 单文件 HTML（inline CSS，不依赖外部 .css 除了 fonts）
✅ 中日双语：.lang-content.cn / .lang-content.jp + body.show-jp 控制
✅ 引用 <script src="assets/js/main.js"></script>（语言切换 + pageview beacon）
✅ Google Fonts: Noto Serif JP (400,600) + Noto Sans JP (400,500,700)
✅ 响应式：Desktop 优先，900px + 500px 两个断点
✅ <meta> OG tags + description 保留
✅ Nav 包含：精选文章/insights.html、提示词/prompts/、创作中心/creator.html
✅ Nav CTA 按钮指向 #pricing
❌ 不引入新框架（React/Vue/jQuery）
❌ 不引入新的外部 CSS 文件
❌ 不写第二个 switchLang 函数
❌ 不使用 emoji 作为视觉元素
```

### 4.4 品牌语调（来自 BRAND.md）

- 平等对话：用"你"不是"大家"
- 承认难度：不说"很简单""一键搞定"
- 短句为主：主语+动词+宾语
- 禁用词："在当今""赋能""抓手""底层逻辑""降本增效""一键搞定""秒杀"

---

## 5. Hermes 任务：产出 4 个版本

### 5.1 四个版本

| 版本 | Skill | 文件名 | 说明 |
|------|-------|--------|------|
| V1 | `frontend-design` | `index-v1.html` | 生产级前端界面，creative+polished |
| V2 | `huashu-design` | `index-v2.html` | 设计方向顾问模式，选一流派深挖 |
| V3 | `ui-ux-pro-max` | `index-v3.html` | 组件级精细，50风格×21调色板 |
| V4 | `beautiful-html-templates` | `index-v4.html` | 模板复用，快速高质量 |

### 5.2 通用要求

1. **先读项目文档再动手：**
   - `C:\Users\jding\kb-site\_context\BRAND.md`
   - `C:\Users\jding\kb-site\_context\VISUAL-DNA.md`
   - `C:\Users\jding\kb-site\_blocks\STYLE-GUIDE.md`
   - `C:\Users\jding\kb-site\DESIGN-RACE-01.md`（本文件）

2. **每个版本必须调用对应的 Skill**，不允许跳过 Skill 直接写代码

3. **产出文件命名：** `index-v1.html` ~ `index-v4.html`，放在 `C:\Users\jding\kb-site\` 根目录

4. **每个版本完成后，在文件顶部注释写明：**
   ```html
   <!-- DESIGN-RACE-01 V1 | Skill: frontend-design | Agent: Hermes | Date: 2026-06-09 -->
   ```

### 5.3 各版本特殊要求

#### V1 · frontend-design
- 严格遵循 `frontend-design` skill 流程
- 避免 generic AI 美学（不要典型的 AI 生成的渐变紫/蓝 landing page）
- 必须有让人"想截图分享"的视觉亮点

#### V2 · huashu-design
- 使用 huashu-design 的"设计方向顾问模式"
- 从 5 流派 × 20 设计哲学中选一个方向，标注在文件顶部注释
- 避免 AI slop 清单中的所有项

#### V3 · ui-ux-pro-max
- 指定风格、调色板、字体配对
- 关注组件级细节（按钮 hover、间距一致性、表单 focus 状态）

#### V4 · beautiful-html-templates
- 从模板库选最接近的模板作为起点
- 适配到 SNS Aladdin 品牌色/字体
- 标注用了哪个模板（文件顶部注释）

---

## 6. Codex 任务：测试验收

### 6.1 测试清单

| # | 测试项 | 方法 | 预期 |
|---|--------|------|------|
| T1 | HTML 有效性 | 浏览器打开，F12 Console 无错误 | 0 error |
| T2 | 中日语言切换 | 点"日本語"按钮 | body 有 show-jp class，所有文字切换 |
| T3 | 语言切换持久化 | 切换后刷新页面 | 保持上次选择的语言 |
| T4 | Nav 链接正确 | 逐个点击 nav 链接 | 跳转到正确页面（insights.html/prompts/index.html/creator.html） |
| T5 | Nav CTA 按钮 | 点击"立即订阅" | 滚动到 #pricing 区域 |
| T6 | 免费5选表单 | 输入邮箱提交 | 显示成功/失败消息 |
| T7 | 定价 CTA | 点击月额/年额 CTA | 跳转到 checkout.html?plan=monthly/yearly |
| T8 | 响应式 900px | 浏览器宽度 ≤900px | 布局正常、无横向滚动 |
| T9 | 响应式 500px | 浏览器宽度 ≤500px | 移动端可读、按钮可点击 |
| T10 | 字体加载 | 检查 Computed 样式 | Noto Sans JP / Noto Serif JP 生效 |
| T11 | 设计规范检查 | 测量 nav 字号/footer 字号 | nav=11px, footer=11px |
| T12 | 无 rem 单位 | grep `rem` | 0 结果 |
| T13 | 无禁用字体 | grep `Noto Sans SC\|-apple-system\|SF Mono` | 0 结果 |
| T14 | 视频区域存在 | 检查 #hero 区域 | 有视频 placeholder 或 iframe |
| T15 | OG meta 标签 | 检查 <head> | og:title/description/image/url 完整 |

### 6.2 输出格式

测试报告 `TEST-RACE-01.md`：
```markdown
# TEST-RACE-01 · 测试报告

## V1 · frontend-design
| # | 测试项 | 结果 | 备注 |
|---|--------|------|------|
| T1 | HTML 有效性 | ✅/❌ | ... |

## V2 · huashu-design
...

## 汇总
| 版本 | 通过率 | 主要问题 |
|------|--------|---------|
| V1 | 13/15 | ... |
```

---

## 7. Claude 任务：评审框架 + 后端

### 7.1 评审维度（impeccable skill）

| 维度 | 权重 | 评分标准 |
|------|:----:|---------|
| 品牌一致性 | 25% | 是否符合 Editorial Magazine × Ink Classic 风格 |
| 视觉层级 | 20% | 信息架构、阅读顺序、重点突出 |
| 细节执行 | 20% | 间距、对齐、hover 状态、表单交互 |
| 转化设计 | 20% | CTA 是否诱人、定价区是否清晰、获客表单是否好用 |
| 代码质量 | 15% | 结构清晰、注释合理、无冗余、响应式完整 |

### 7.2 评分表模板

```markdown
| 维度 | V1 | V2 | V3 | V4 |
|------|:--:|:--:|:--:|:--:|
| 品牌一致性 (25%) | /10 | /10 | /10 | /10 |
| 视觉层级 (20%) | /10 | /10 | /10 | /10 |
| 细节执行 (20%) | /10 | /10 | /10 | /10 |
| 转化设计 (20%) | /10 | /10 | /10 | /10 |
| 代码质量 (15%) | /10 | /10 | /10 | /10 |
| **加权总分** | | | | |
```

---

## 8. 当前 index.html 参考结构

```
index.html (541 行)
├── <head> — OG meta + Google Fonts
├── <style> — CSS 变量体系 + 全站样式（inline）
├── <nav> — fixed nav + 语言切换按钮
├── #hero — 视频区 + 主标题 + 副标题 + scroll-hint
├── #pain — 7 个痛点 (.pain-item) + pivot 转折
├── #cases — 5 个案例卡片 (3 列 grid)
├── #pricing — 2 档定价 + 免费5选表单
├── <footer> — 链接 + 版权
└── <script> — main.js + lead form + YouTube loader
```

---

## 9. 时间线

| 阶段 | 负责人 | 预计 |
|------|--------|------|
| 竞赛文档发布 | Claude | ✅ 完成 |
| 4 版本产出 | Hermes | → |
| 测试报告 | Codex | →（可并行） |
| 肉眼筛选 | 用户 | → |
| 专业评审 | Claude（impeccable） | → |
| 选出最佳 → 替换 → 部署 | Claude | → |

---

## 10. 文件清单

```
kb-site/
├── DESIGN-RACE-01.md     ← 本文件（竞赛规则）
├── index.html            ← 当前线上版本（备份）
├── index-v1.html         ← Hermes · frontend-design
├── index-v2.html         ← Hermes · huashu-design
├── index-v3.html         ← Hermes · ui-ux-pro-max
├── index-v4.html         ← Hermes · beautiful-html-templates
├── TEST-RACE-01.md       ← Codex 测试报告（待产出）
└── REVIEW-RACE-01.md     ← Claude 评审报告（待产出）
```
