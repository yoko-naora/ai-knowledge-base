# REVIEW-RACE-01 · Claude 评审任务

> 状态：用户肉眼筛选已结束 → 进入 Claude 专业评审阶段

## 当前状态

- **选用版本：** `index-v1.html`（V1+V2 结合版：V1 底色/主色/字体/氛围 + V2 单列居中布局）
- **已删除：** index-v2.html / index-v3.html / index-v4.html（未入选）

## 评审任务

按 DESIGN-RACE-01.md §7 的 impeccable 评审框架评分：

### 评审维度

| 维度 | 权重 |
|------|:----:|
| 品牌一致性 | 25% |
| 视觉层级 | 20% |
| 细节执行 | 20% |
| 转化设计 | 20% |
| 代码质量 | 15% |

### 评分表模板

| 维度 | V1 |
|------|:--:|
| 品牌一致性 (25%) | /10 |
| 视觉层级 (20%) | /10 |
| 细节执行 (20%) | /10 |
| 转化设计 (20%) | /10 |
| 代码质量 (15%) | /10 |
| **加权总分** | |

## V1 设计概要

| 维度 | 内容 |
|------|------|
| Skill | frontend-design（Ink Magazine） |
| 底色 | `#f3f0e8` 暖纸 + SVG 纸纹 overlay |
| 主色 | 深墨 `#0a0a0b` | 金 `#b8925a` |
| 字体 | Noto Serif JP 标题 / Noto Sans JP 正文 |
| 布局 | 单列居中（max-width: 800px） |
| 氛围 | 高级杂志编辑感 |
| 响应式 | 900px / 500px 两个断点 |

### 页面结构

1. **Hero** - 标题 + 副标题 + 视频区（YouTube 呼び出し可）
2. **Pain Points** - 7 个痛点（单列列表）
3. **Pivot** - 转折语 "不是你不行，是你的生产工具跟不上"
4. **Cases** - 5 行业案例（左图右文，服装类有实图）
5. **Pricing** - 月额 ¥2,980 / 年额 ¥30,000 + 免费5选表单
6. **Footer** - 版权 + 4 链接（一行 pipe 分隔）

### 特别注意点

- 中日双语：`.lang-content.cn` / `.lang-content.jp` + `body.show-jp`
- 图片：服装案例已引用实际图片，其他 4 行业为 placeholder
- 技术约束：无 rem、无禁止字体、单文件 inline CSS

## 评审后流程

1. Reviewer 给出修复建议（如有）
2. 修复完成后替换 index.html
3. git commit + deploy
