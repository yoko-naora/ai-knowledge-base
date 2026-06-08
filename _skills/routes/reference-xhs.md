# reference-xhs · 参考某文 → 小红书仿写

## 输入
- 参考文章 URL
- 用户行业/产品（可选）

## 调度顺序

### Step 1-2：内容提取 + 结构分析
```
同 reference-wechat Step 1-2
额外：提取原文的视觉风格特点（配色倾向、图类型、排版密度）
```

### Step 3：选题生成
```
同 reference-wechat Step 3
适配小红书：选题偏向"5个方法""3步搞懂""为什么你XX"等公式
```

### Step 4：用户确认
```
AskUserQuestion：选哪个选题？
```

### Step 5：仿写
```
调用 Skill: writing-shape
输出：小红书结构化内容
  ├── 封面标题（16 字以内）
  ├── 5-8 页内页（每页 1 个要点）
  └── 发布文案（150-400 字 + 话题 + 互动）
约束：结构/语气仿原文，内容用自己的
```

### Step 6：质检
```
_qc.md + dbs-xhs-title
```

### Step 7：滚图生成
```
同 scratch-xhs Step 5
视觉方向参考原文配图风格
```

### Step 8：交付
```
同 scratch-xhs Step 6
```
