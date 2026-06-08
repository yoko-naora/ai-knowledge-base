# scratch-xhs · 从0开始 → 小红书滚图

## 输入
- 话题/关键词（用户提供）
- 风格选择（读 `_blocks/STYLE-GUIDE.md`）

## 调度顺序

### Step 1：选题生成
```
调用 Skill: writing-fragments
输入：用户话题
输出：3 个选题角度
```

### Step 2：用户确认
```
AskUserQuestion：选哪个选题？
```

### Step 3：写作
```
调用 Skill: writing-shape
输入：选定选题
输出：小红书结构化内容
  ├── 封面标题（16 字以内，数字优先，疑问句优先）
  ├── 5-8 页内页（每页 1 个要点，每要点 2-3 句）
  └── 发布文案（150-400 字 + 话题标签 + 互动引导）
规则：按 _context/BRAND.md + _context/CONTENT-PLAYBOOK.md
```

### Step 4：质检
```
同 _skills/qc.md
额外：调用 Skill: dbs-xhs-title → 75 公式匹配最佳标题
```

### Step 5：滚图生成
```
1. 读 _blocks/STYLE-GUIDE.md → 确定风格和工具
2. 如果 guizang 路线 → 拷种子模板 → 填 POSTERS_HERE → 渲染 → 验证
   如果 baoyu 路线 → 查 xhs-presets/ → 生成 prompt → AI 生图
3. 输出：5-8 张 PNG（1080×1440，3:4）
   命名：01-cover.png, 02-xxx.png, ... 08-cta.png
```

### Step 6：交付
```
告知用户：
  ✅ output/xhs-01-cover.png ~ xhs-08-cta.png（滚图）
  ✅ output/caption.md（发布文案）
  
  下一步：打开小红书 → 上传图片 → 粘贴文案 → 发布
```
