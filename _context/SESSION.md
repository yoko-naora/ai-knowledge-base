# SESSION.md — 跨会话状态

> 收工时更新本文件。开工时读本文件 + `git log -3` 即可恢复上下文。
> 不要在这个文件里写规则。规则在 CLAUDE.md。

## 最近更新

**2026-06-17 收工** — 提示词库扩充15条全部配图完成 (71/72)。detail.html 浮动翻页箭头恢复。creator-simple 有图优先排序修复。推荐逻辑完整记录供 Codex 审查。

---

## 全项目状态（2026-06-17）

| 项目 | 状态 | 最优先 |
|------|:--:|--------|
| kb | 🟡 | 提示词库扩充5行业（家装/餐饮/旅游/医疗/宠物各补2-4条 → data.json） |
| prompts | 🟡 | 20条 video 条目 image_prompt 補完 |
| course | 🟡 | 公開先決定 |
| yijian | 🟢 | TikTok 平台接入 sau CLI |
| sys | 🟢 | Cドライブ 66.9GB 静観 |
| x | 🟢 | コース集客導線 X→LINE |

---

## kb 详情

- **URL:** https://kb.snsaladdin.com
- **Repo:** yoko-naora/ai-knowledge-base (main)
- **Next:** 提示词库扩充 / 定价页接入付费墙 / TikTok 復帰配信 / Cloudflare ENV 配置
- **Known Issues:** Stripe Tax 未検証（購読者 0）/ DNS 一部未伝播 / 週次メール未本番

## prompts 详情

- **URL:** https://yoko-naora.github.io/prompt-library/
- **Repo:** yoko-naora/prompt-library (main)
- **Next:** image_prompt補完（20条）/ 精選20条マーク / kbサイト埋込

## course 详情

- **File:** Desktop\21days-course-intro.html
- **Next:** 公開先決定 / CTAリンク設定 / モバイル検証

## yijian 详情

- **Repo:** yoko-naora/yijian-chengpian (master)
- **Next:** TikTok接入sau / Path C视频质量修复

## sys 详情

- C: 66.9GB / OneDrive: 1.5GB / 起動: 17項目
- **次:** 15%以下で追加掃除

## x 详情

- yoko / Ai_shukyaku / フォロワー 3万
- **次:** X→LINE コース集客導線

---

## 今日待办

- [x] 提示词库扩充 15 条全部配图 (200-214)
- [x] detail.html 浮动翻页箭头恢复
- [x] creator-simple 有图优先排序修复
- [ ] 话题评分逻辑修复（CJK 二元分词 + 行业加成权重）
- [ ] 工具卡 GitHub URL 填入
- [ ] 定价页接入付费墙
