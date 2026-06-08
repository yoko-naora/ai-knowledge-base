# reference-moments · 参考某文 → 朋友圈改编

## 输入
- 参考文章 URL
- 用户行业/产品（可选）

## 调度顺序

### Step 1-2：内容提取 + 结构分析
```
同 reference-wechat Step 1-2
重点提取：原文最打动人的句子/观点（可改编到朋友圈）
```

### Step 3：选题生成
```
调用 Skill: writing-fragments
输出：3 个朋友圈文案角度（各 1 句话）
规则：原文核心观点 × 朋友圈口语化表达
```

### Step 4：用户确认
```
AskUserQuestion：选哪个？
```

### Step 5：改编
```
调用 Skill: writing-shape
输出：
  ├── 朋友圈文案（200 字以内，口语化）
  └── 配图需求
约束：
  ├── 保留原文核心观点
  ├── 语气改朋友圈口语化
  └── 长度压缩到原文的 20-30%
```

### Step 6：质检
```
_qc.md
```

### Step 7：配图
```
同 scratch-moments Step 5
```

### Step 8：交付
```
同 scratch-moments Step 6
```
