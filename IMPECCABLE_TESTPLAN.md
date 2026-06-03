# Impeccable 测试流程

> **安全规则**：当前在 `test-impeccable` 分支，所有改动不污染 main。
> 不满意只需：`git checkout main` 即可回到原样。
> **本测试流程只做只读检测，不修改任何原文件。**

## 安装状态

- Skill 已安装到 `.claude/skills/impeccable/`
- 31 个 reference 文件 + 检测器脚本
- 版本：v3.5.0

## 测试步骤

### Phase 1: 只读检测（安全，不改代码）

| 步骤 | 命令/操作 | 作用 | 影响 |
|:--:|------|------|:--:|
| 1 | `node .claude/skills/impeccable/scripts/context.mjs` | 检查项目是否有 PRODUCT.md + DESIGN.md | 只读 |
| 2 | 运行反模式检测器 | 扫描 kb-site 的 AI 设计味道（对比度、字体、间距等） | 只读 |
| 3 | `/impeccable critique index.html` | AI 审查首页 UX（层级、清晰度、情感共鸣） | 只读 |

### Phase 2: 创建项目上下文（可选，确认后执行）

| 步骤 | 命令/操作 | 作用 | 影响 |
|:--:|------|------|:--:|
| 4 | `/impeccable init` | 对话式创建 PRODUCT.md + DESIGN.md | 新增2个文件 |
| 5 | `/impeccable document` | 从已有代码反推 DESIGN.md | 新增1个文件 |

### Phase 3: 实际修改（可选，确认后执行）

| 步骤 | 命令/操作 | 作用 | 影响 |
|:--:|------|------|:--:|
| 6 | `/impeccable audit` | 技术质量检查（a11y/性能/响应式）并修复 | 修改文件 |
| 7 | `/impeccable harden` | i18n/边缘情况/文本溢出加固 | 修改文件 |
| 8 | `/impeccable typeset` | 字体层级检查 | 可能修改 |

### 日常使用规则（提案）

```
# 每次部署前
/impeccable audit          # 技术检查

# 新增页面后
/impeccable critique <新页面>  # UX审查

# 双语内容更新后
/impeccable harden         # i18n边缘情况

# 设计大改前
/impeccable craft <需求>   # 完整的 shape→build→iterate 流程
```

## 和现有设计系统的关系

- **不会冲突的规则**：对比度检查、行宽、flex/grid规范、z-index体系、动画规范、互动设计
- **可能冲突的规则**：字体配对建议（kb-site 用 Noto Sans/Serif JP 双字体是设计规范）、颜色体系（kb-site 用暖象牙白配色而非 OKLCH）
- **规则优先级**：`kb-site-design-system` memory > impeccable 建议

## 与 kb-site 现有设计的兼容性评估

| impeccable 规则 | kb-site 现状 | 兼容？ |
|------|------|:--:|
| 字体 ≤3 种 | Noto Sans JP + Noto Serif JP = 2 ✅ | ✅ |
| body 行宽 65-75ch | 待检测 | ❓ |
| 不用纯黑纯灰 | 用 `#1a1814`（带暖色）✅ | ✅ |
| 不用灰色文字放彩色背景 | 待检测 | ❓ |
| 不用弹性缓动动画 | 目前基本无动画 | ✅ |
| z-index 语义体系 | 待检测 | ❓ |
| 对比度 ≥4.5:1 | 待检测 | ❓ |
