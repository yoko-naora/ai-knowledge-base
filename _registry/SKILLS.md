# 技能注册表

> 所有可用 skill 的索引。Agent 在调度前查此表，确认 skill 是否存在、做什么、在哪。

## 内容生产链

| Skill | 阶段 | 干什么 | 来源 |
|-------|------|--------|------|
| `edit-article` | 分析 | 拆结构、语气、节奏 | superpowers |
| `writing-fragments` | 选题 | 从原文炸出选题角度 | superpowers |
| `dbs-content` | 选题 | 判断选题值不值得做 | dbs |
| `writing-shape` | 写作 | 把选题长成完整文章 | superpowers |
| `dbs-ai-check` | 质检 | AI 味检测 → 自动修 → 复检 | dbs |
| `dbs-hook` | 质检 | 开头钩子优化（视频/口播时用） | dbs |

## 视觉生产

| Skill | 产出 | 方式 | 文字准确度 |
|-------|------|------|:--:|
| `guizang-social-card-skill` | 封面、卡片、滚图、套图 | HTML/CSS → Playwright 截图 | ⭐⭐⭐ 100% |
| `baoyu-cover-image` | 封面氛围图 | AI 生图（DALL·E/Imagen 等） | ⭐⭐ 不可靠 |
| `baoyu-xhs-images` | 小红书/微信图文卡 | AI 生图 | ⭐⭐ 不可靠 |
| `baoyu-infographic` | 高密度信息图 | AI 生图 | ⭐⭐ 不可靠 |
| `baoyu-article-illustrator` | 文章内插图 | AI 生图 | ⭐⭐ 不可靠 |
| `baoyu-slide-deck` | PPT 幻灯片 | AI 生图 | ⭐⭐ 不可靠 |
| `guizang-ppt-skill` | 横向翻页网页 PPT | HTML/CSS | ⭐⭐⭐ 100% |
| `runninghub` | AI 生图（294 端点） | API 调用 | ⭐⭐ 不可靠 |

## 发布

| Skill | 目标平台 | 方式 |
|-------|---------|------|
| `wewrite` | 公众号草稿箱 / 本地 HTML | Markdown → 微信 HTML |
| `blog-to-x` | X Articles | Markdown → X 富文本 |
| `baoyu-post-to-x` | X 推文 | 浏览器自动化 |
| `baoyu-post-to-wechat` | 公众号草稿箱 | 浏览器自动化 |
| `social-media-auto-publish` | 抖音/小红书/快手/B站 | CLI |

## 输入

| Skill | 干什么 |
|-------|--------|
| `baoyu-danger-x-to-markdown` | X/Twitter URL → Markdown |
| `baoyu-url-to-markdown` | 任意网页 → Markdown |
| `baoyu-youtube-transcript` | YouTube 字幕提取 |
| `baoyu-electron-extract` | 网页内容提取 |
| `baoyu-wechat-summary` | 公众号文章摘要 |

## 不在此注册表的不用

如果 Agent 发现某个需求没有对应 skill，不要自己发明。告诉用户"这个功能目前没有工具支持"。
