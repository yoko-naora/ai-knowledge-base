# KB Pipeline & API Handoff
Last updated: 2026-06-12 15:00 JST

## Project Structure
- Site: `C:\Users\jding\kb-site` -> `kb.snsaladdin.com`
- Pipeline: `kb-kb.snsaladdin.com\scripts\orchestrator.py`
- Feishu: app_token=`TXbubx31ia6M3Rsdy4jcaHeTnde`, table=`tblhJfDKdrJQMlbP`

## Pipeline
1. Read Feishu -> filter pending
2. Extract X via vxtwitter
3. Route: `图片提示词`/`视频提示词`/article
4. Update Feishu -> git push -> deploy

## Prompts: 57 total, ID 109->1
Categories: {'视频制作/Seedance': 11, '电商/商业海报': 15, '游戏/娱乐/影视': 8, '教育/科普/图解': 7, '穿搭/形象/造型': 11, '品牌/VI/包装': 1, '自拍类': 1, '全景/3D/空间': 1, '健康/生活/实用工具': 2}
Types: {'video': 16, 'image': 40, 'text': 1}
ID_MAPPING.md for URL->ID

## API Endpoints (Claude Code)
- POST /api/writing-fragments (Haiku)
- POST /api/writing-shape (Sonnet)
- POST /api/dbs-content (Haiku)
- POST /api/recommend-prompts (none)
- POST /api/generate-cover (fal.ai)

## Templates (Codex)
- prompts/api-templates/*.json

## Env Vars Needed
- ANTHROPIC_API_KEY
- FAL_API_KEY

## Pending
1. Configure env vars in Cloudflare
2. Test endpoints
3. generator.html -> huashu-design
4. Continue pipeline (add Feishu records)

## Rules
- detail?id=N = data[N] array index
- Do not touch old prompts
- pre-commit hook disabled (broken)
- Sandbox blocks video.twimg.com (download locally)
