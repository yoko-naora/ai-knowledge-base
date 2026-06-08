# reference-wechat · 参考某文 → 公众号仿写

## 输入
- 参考文章 URL
- 用户行业/产品（可选——如果不给，系统围绕原文同行业出选题）

## 调度顺序

### Step 1：内容提取
```
如果 URL 是 X/Twitter：
  调用 Skill: baoyu-danger-x-to-markdown → 提取为 MD
如果 URL 是公众号/网页：
  调用 Skill: baoyu-url-to-markdown → 提取为 MD
如果用户直接粘贴文章：
  直接使用
```

### Step 2：结构分析
```
调用 Skill: edit-article
分析：
  ├── 结构（几段、怎么分的、开头/结尾方式）
  ├── 语气（平等对话 / 权威说教 / 朋友聊天）
  ├── 节奏（长句还是短句、有没有故事穿插）
  └── 配图风格（什么类型图、几张、放什么位置）
输出：结构分析报告（不展示给用户）
```

### Step 3：选题生成
```
调用 Skill: writing-fragments
输入：原文结构 + 用户行业（或原文同行业）
输出：3 个仿写选题
  ├── 选题 1：同结构 + 同语气 + 换你的内容
  ├── 选题 2：同结构 + 换一个切入角度
  └── 选题 3：微调结构 + 更适配你的行业
```

### Step 4：用户确认
```
AskUserQuestion：
  展示 3 个选题（各 2-3 句描述）
  问：「选哪个？」
```

### Step 5：仿写
```
调用 Skill: writing-shape
输入：选定选题 + 原文结构/语气/节奏分析
约束：
  ├── 结构仿原文（几段、怎么分）
  ├── 语气仿原文（除非用户行业完全不适合）
  ├── 内容/观点用你自己的（不抄）
  └── 按 _context/BRAND.md 禁用词过滤
```

### Step 6：质检
```
_qc.md
```

### Step 7：封面 + 排版
```
同 scratch-wechat Step 5 + Step 6
风格：默认杂志高级风
```

### Step 8：交付
```
同 scratch-wechat Step 7
```
