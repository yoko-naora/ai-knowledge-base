# 积木注册表

> 所有可用视觉积木的索引。Agent 查 STYLE-GUIDE.md 确定风格后，来这里找对应的积木文件。

## guizang 积木（HTML 渲染，文字 100% 准确）

```
_blocks/guizang/
├── templates/
│   ├── editorial-card.html    ← 杂志风种子模板（3 种画板：xhs / square / wide）
│   └── swiss-card.html        ← 极简科技风种子模板
├── themes/                    ← 配色 CSS token（从 guizang skill 提取）
└── recipes/                   ← 布局配方 HTML 骨架（M01-M15 / S01-S12）
```

## baoyu 积木（AI 生图，视觉冲击）

```
_blocks/baoyu/
├── cover-presets/             ← baoyu-cover-image 用的 preset
│   ├── magazine-cover.md      ← type:hero + palette:warm + rendering:painterly
│   ├── tech-cover.md          ← type:minimal + palette:cool + rendering:digital
│   └── warm-cover.md          ← type:scene + palette:earth + rendering:hand-drawn
│
├── xhs-presets/               ← baoyu-xhs-images 用的 preset
│   ├── knowledge-card.md      ← style:notion + layout:dense
│   ├── study-guide.md         ← style:study-notes + layout:dense
│   ├── warm-share.md          ← style:warm + layout:balanced
│   ├── tech-minimal.md        ← style:minimal + layout:balanced
│   ├── cute-share.md          ← style:cute + layout:balanced
│   └── sketch-summary.md      ← style:sketch-notes + layout:balanced
│
└── infographic-presets/       ← baoyu-infographic 用的 preset
    ├── comparison.md          ← binary-comparison + craft-handmade
    └── process-flow.md        ← linear-progression + ikea-manual
```

## wewrite 主题（公众号排版）

| 品类 | 主题 |
|------|------|
| 商业/干货 | `professional-clean`（默认） |
| AI/科技 | `tech-modern` |
| 温暖/生活 | `warm-editorial` |
| 读书/文化 | `ink` / `newspaper` |
