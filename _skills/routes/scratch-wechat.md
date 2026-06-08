# scratch-wechat · 从0开始 → 公众号长文

## 输入
- 话题/关键词（用户提供）
- 风格选择（读 `_blocks/STYLE-GUIDE.md`，默认"杂志高级风"）

## 调度顺序

### Step 1：选题生成
```
调用 Skill: writing-fragments
输入：用户话题
输出：3 个选题角度（各 1-2 句话）
```

### Step 2：用户确认
```
AskUserQuestion：
  问题：「选哪个选题？」
  选项：
    1. 选题A（推荐）
    2. 选题B
    3. 选题C
```

### Step 3：写作
```
调用 Skill: writing-shape
输入：用户选定的选题角度
输出：完整文章（Markdown，800-2000 字）
规则：按 _context/BRAND.md 的语气规则写
```

### Step 4：质检
```
按 _skills/qc.md 执行：
  ├── 调用 Skill: dbs-ai-check → 检测 AI 味
  ├── 自动修 → 复检 → 最多 3 轮
  └── 高风险内容提醒用户（其余静默）
```

### Step 5：封面
```
1. 读 _blocks/STYLE-GUIDE.md
2. 查表 → 确定工具和积木
3. 调用 Skill: guizang-social-card-skill
   输入：文章标题 + 杂志高级风
   输出：21:9 头图 + 1:1 方封面 → output/
4. 必须走种子模板 → 拷 editorial-card.html → 填 POSTERS_HERE → 渲染 → 验证
```

### Step 6：排版
```
调用 Skill: wewrite
命令：python wewrite preview article.md --theme professional-clean --output article.html
输出：微信兼容 HTML（用户可粘贴到公众号后台）
```

### Step 7：交付
```
告知用户：
  ✅ article.md（文章正文）
  ✅ cover-21x9.png + cover-1x1.png（封面）
  ✅ article.html（微信排版，粘贴即用）
  
  下一步：打开公众号后台 → 新建文章 → 粘贴 HTML → 上传封面 → 预览 → 发布
```
