# STYLE-GUIDE.md — 视觉路由总锁

> **规则：任何视觉产出（封面/卡片/套图），Agent 必须先查此表，不准凭感觉选工具或参数。**

---

## SNS Aladdin 品牌（唯一风格）

**风格：** Editorial Magazine × Ink Classic（高级杂志风）

| 产出物 | 工具 | 积木 | 参数 |
|--------|------|------|------|
| 公众号封面 21:9 + 1:1 | guizang-social-card-skill | `_blocks/guizang/templates/editorial-card.html` | data-theme="ink-classic"，recipe M01 封面对 |
| 公众号文章排版 | wewrite | `--theme professional-clean` | Markdown → 微信 HTML |
| 小红书封面 | guizang-social-card-skill | editorial-card.html + recipe M01 | data-theme="ink-classic"，3:4 |
| 小红书内页 | guizang-social-card-skill | editorial-card.html + recipe M05/M07/M14 | 每页 1 个要点，5-8 页 |
| 朋友圈配图 | baoyu-cover-image | `_blocks/baoyu/cover-presets/magazine-cover.md` | type:hero, palette:warm, rendering:painterly |
| 产品套图 | guizang-social-card-skill | editorial-card.html + recipe M01/M05 | .frame-shot + .device-browser 装截图 |

### 品牌封面具体参数

```
工具：baoyu-cover-image
preset：_blocks/baoyu/cover-presets/magazine-cover.md
type: hero（大标题 + 氛围图）
palette: warm（暖纸底 + 深墨色）
rendering: painterly（绘画感，不机械）
text: title-only（只有标题，无副标题）
mood: balanced（中等对比）
aspect: 16:9（默认）或 2.35:1（电影感）
```

---

## 订阅者可选风格（4 种）

### Style 1 · 杂志高级风（默认）

适用：商业思考、干货、知识付费、专业内容

| 产出 | 工具 | 积木 |
|------|------|------|
| 封面 | baoyu-cover-image | `cover-presets/magazine-cover.md` |
| 公众号正文 | wewrite | `--theme professional-clean` |
| 小红书滚图 | guizang Editorial | `editorial-card.html` + Ink Classic |
| 朋友圈图 | baoyu-xhs-images | preset: `clean-quote`（minimal + sparse） |

### Style 2 · 手绘知识卡

适用：教程、教育、年轻化内容、小红书种草

| 产出 | 工具 | 积木 |
|------|------|------|
| 封面 | baoyu-xhs-images | preset: `sketch-summary`（sketch-notes + balanced） |
| 公众号正文 | wewrite | `--theme warm-editorial` |
| 小红书滚图 | baoyu-xhs-images | preset: `knowledge-card`（notion + dense） |
| 朋友圈图 | baoyu-xhs-images | preset: `cozy-story`（warm + balanced） |

### Style 3 · 极简科技风

适用：AI 工具、SaaS、产品介绍、效率工具

| 产出 | 工具 | 积木 |
|------|------|------|
| 封面 | baoyu-cover-image | `cover-presets/tech-cover.md` |
| 公众号正文 | wewrite | `--theme tech-modern` |
| 小红书滚图 | guizang Swiss | `swiss-card.html` + IKB Blue |
| 朋友圈图 | baoyu-xhs-images | preset: `pro-summary`（minimal + balanced） |

### Style 4 · 温暖生活风

适用：探店、旅行、手工、美食、生活方式

| 产出 | 工具 | 积木 |
|------|------|------|
| 封面 | baoyu-cover-image | `cover-presets/warm-cover.md` |
| 公众号正文 | wewrite | `--theme warm-editorial` |
| 小红书滚图 | baoyu-xhs-images | preset: `cozy-story`（warm + balanced） |
| 朋友圈图 | baoyu-xhs-images | preset: `cute-share`（cute + balanced） |

---

## 工具选择原则

| 需求 | 用什么 | 为什么 |
|------|--------|--------|
| 文字必须 100% 准确（标题卡、要点卡） | guizang（HTML 渲染 + Playwright 截图） | AI 生图中文错误率太高 |
| 需要视觉冲击/氛围感（封面、配图） | baoyu-cover-image 或 baoyu-xhs-images（AI 生图） | CSS 做不出手绘/水彩/3D |
| 需要数据对比/流程图 | baoyu-infographic | 21 布局 × 22 风格，专业信息图 |
| 文字排版到微信 HTML | wewrite | 16 套主题，Markdown → 微信兼容 HTML |

## 硬性规则

1. **不准跳过查表。** 任何视觉产出前，Agent 必须先读此文件。
2. **不准混搭工具。** 同一套图只用一种风格。封面用 baoyu、内页用 guizang 是允许的（分层混合），但同层不能混。
3. **不准手写 CSS。** guizang 模板必须拷种子文件再改。baoyu 必须用 preset 文件。
4. **验证铁律。** 交付前必须：guizang → `node validate-social-deck.mjs`；baoyu → 检查图片中文字是否可读。
