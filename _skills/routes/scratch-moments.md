# scratch-moments · 从0开始 → 朋友圈图文

## 输入
- 话题/关键词
- 风格选择（读 `_blocks/STYLE-GUIDE.md`）

## 调度顺序

### Step 1：选题
```
调用 Skill: writing-fragments
输出：3 个选题（偏向短文案角度）
```

### Step 2：用户确认
```
AskUserQuestion：选哪个？
```

### Step 3：写文案
```
调用 Skill: writing-shape
输入：选定选题
输出：
  ├── 朋友圈文案（200 字以内，口语化，像在跟朋友聊天）
  └── 配图需求描述（需要什么类型的图，几张）
```

### Step 4：质检
```
_qc.md（静默）
```

### Step 5：配图
```
1. 读 _blocks/STYLE-GUIDE.md → 确定工具
2. 杂志风 → baoyu-cover-image（1-3 张氛围图）
   手绘风 → baoyu-xhs-images（1-6 张知识卡）
   极简风 → guizang swiss-card.html（1-3 张干净卡）
   温暖风 → baoyu-xhs-images warm preset
3. 输出：1-6 张或 1-9 张 PNG（1080×1080，1:1）
```

### Step 6：交付
```
告知用户：
  ✅ 朋友圈文案
  ✅ 配图（N 张）
  
  下一步：打开微信朋友圈 → 上传图片 → 粘贴文案 → 发布
```
