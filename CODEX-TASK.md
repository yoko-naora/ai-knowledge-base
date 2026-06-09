# Codex 任务：kb.snsaladdin.com Landing Page 重写

## 你要产出的

**4 个 index.html 版本，用 4 个不同的 Skill，肉眼能看出明显区别。**

| 版本 | 文件名 | Skill |
|------|--------|-------|
| V1 | `index-v1.html` | `frontend-design` |
| V2 | `index-v2.html` | `huashu-design` |
| V3 | `index-v3.html` | `ui-ux-pro-max` |
| V4 | `index-v4.html` | `beautiful-html-templates` |

## 铁律

1. **每个版本必须先加载 Skill，再写代码。** Skill 加载失败 → 停 → 报告。
2. **四个版本不能看起来一样。** 配色、布局、字体、叙事顺序——至少 3 个维度明显不同。
3. **每个版本按 Skill 自己的流程走**，不要四个版本用同一套模板。

## 页面必须包含

- Hero（视频区 + 标题 + 副标题 + CTA）
- 痛点（6-7 个）
- 转折语（"不是你不行，是工具跟不上"）
- 案例（5 个行业）
- 定价（月额 ¥2,980 / 年额 ¥30,000 + 免费 5 选表单）
- Footer

## 技术约束

- 单文件 HTML，inline CSS
- 中日双语（`.lang-content.cn/.jp` + `body.show-jp`）
- `<script src="assets/js/main.js"></script>`
- Noto Serif JP + Noto Sans JP
- 响应式：900px + 500px 断点
- px 不用 rem

## 文案

用 `C:\Users\jding\kb-site\index.html` 里现成的中日晚双语文案。可以改排版断行，不改含义。

## 文件顶部必须写

```html
<!-- Skill: [名字] | 加载成功: [是/否] | 本版本独特之处: [一句话] -->
```

## 项目上下文

先读：
- `C:\Users\jding\kb-site\_context\BRAND.md`
- `C:\Users\jding\kb-site\_context\VISUAL-DNA.md`

## 和之前版本的区别

之前 Hermes 的 V1/V3/V4 是同一个文件复制了三份。你的四个版本必须是四个真正不同的设计。
