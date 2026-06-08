# VISUAL-DNA.md — SNS Aladdin 视觉基因

## 唯一风格：Editorial Magazine × Ink Classic

任何 SNS Aladdin 出品的视觉内容，必须通过以下身份测试：

### 身份测试（3 条全过才是 Editorial Magazine）

1. **有氛围层吗？** 纸纹 + ink wash + WebGL canvas 至少其一。纯色背景 = 不通过。
2. **字体用对了吗？** 标题 = 衬线 500w + 正追踪（+.03em）。无衬线标题 700w = 不通过。
3. **有杂志元素吗？** issue row / issue strip / 页码 / 等宽标签 至少一个。纯图文无杂志元素 = 不通过。

### 配色 Token

```css
--paper:     #f3f0e8;
--paper-2:   #ebe6da;
--ink:       #0a0a0b;
--muted:     #68625a;
--line:      rgba(10,10,11,.22);
--accent:    #111111;
--accent-soft: #d8d2c6;
```

### 字体

| 角色 | 字体 | 字重 | 字号 | 追踪 |
|------|------|------|------|------|
| 大标题 | Noto Serif SC | 500 | 88-124px | +.03~.04em |
| 正文 | Noto Serif SC | 400 | 24-28px | normal |
| 标签/元数据 | IBM Plex Mono | 500 | 18-21px | +.20em |
| 英文斜体 | Playfair Display | 400 it | 36px | normal |

## 订阅者可选风格

订阅者使用创作中心时，可选以下 4 种风格：

| 风格 | 封面工具 | 正文卡工具 | 适用场景 |
|------|---------|-----------|---------|
| 杂志高级风 | baoyu-cover-image (warm + painterly) | guizang Editorial | 商业、知识、干货 |
| 手绘知识卡 | baoyu-xhs-images (sketch-notes) | baoyu-xhs-images (notion) | 教育、教程、年轻化 |
| 极简科技风 | baoyu-cover-image (cool + digital) | guizang Swiss | AI 工具、产品、效率 |
| 温暖生活风 | baoyu-cover-image (earth + hand-drawn) | baoyu-xhs-images (warm) | 探店、旅行、手工 |

## 反模式（做了就是错的）

1. Swiss 和 Editorial 混搭在同一套图里
2. 正文卡用 AI 生图（文字会乱码）
3. 封面图用 guizang 纯排版（缺氛围感）
4. 扁平纯色背景的 Editorial（缺纸纹/ink wash）
5. emoji 出现在任何视觉产出里
6. 手写 CSS 替代种子模板（必须拷种子模板再改）
