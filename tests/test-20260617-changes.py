#!/usr/bin/env python3
"""Test script for 2026-06-17 changes:
  1. data.json: 15 new prompts for 5 gap industries
  2. creator-simple.html: GitHubURL removed, subscribe CTA added
  3. checkout.html + success.html: redirect loop
  Run: python tests/test-20260617-changes.py
"""

import json, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

PASS = 0
FAIL = 0

def test(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  PASS  {name}")
    else:
        FAIL += 1
        d = f" - {detail}" if detail else ""
        print(f"  FAIL  {name}{d}")

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

# ═══════════════════════════════════════════════════════════
# SECTION 1: data.json integrity
# ═══════════════════════════════════════════════════════════
section("1. data.json -- 57→72 prompts, 15 new entries for 5 gap industries")

data = json.load(open("prompts/data.json", encoding="utf-8"))

test("Valid JSON, 72 entries", len(data) == 72, f"got {len(data)}")

# New entries have IDs 200-214
new_entries = [p for p in data if p["id"] >= 200]
test("15 new entries (IDs 200-214)", len(new_entries) == 15, f"got {len(new_entries)}")

# All new entries have author "SNS Aladdin"
all_aladdin = all(p.get("author") == "SNS Aladdin" for p in new_entries)
test("All new entries author='SNS Aladdin'", all_aladdin)

# All new entries have free=true
all_free = all(p.get("free") == True for p in new_entries)
test("All new entries free=true", all_free)

# All new entries have valid cat
valid_cats = {'自拍类','电商/商业海报','穿搭/形象/造型','教育/科普/图解',
              '品牌/VI/包装','游戏/娱乐/影视','全景/3D/空间','健康/生活/实用工具','视频制作/Seedance'}
all_valid_cat = all(p["cat"] in valid_cats for p in new_entries)
test("All new entries have valid cat", all_valid_cat)

# All new entries have non-empty image_prompt (the core value)
all_have_prompt = all(p.get("image_prompt","").strip() for p in new_entries)
test("All new entries have image_prompt", all_have_prompt)

# All new entries have date 2026-06-17
all_today = all(p.get("date","").startswith("2026-06-17") for p in new_entries)
test("All new entries dated 2026-06-17", all_today)

# No duplicate IDs
ids = [p["id"] for p in data]
test("No duplicate IDs", len(ids) == len(set(ids)), f"total={len(ids)}, unique={len(set(ids))}")

# ═══════════════════════════════════════════════════════════
# SECTION 2: Gap industry coverage (simulate INDUSTRY_BOOST)
# ═══════════════════════════════════════════════════════════
section("2. Recommendation engine -- gap industry coverage")

INDUSTRY_BOOST = {
    '家装': ['全景/3D/空间','品牌/VI/包装'],
    '餐饮': ['电商/商业海报'],
    '旅游': ['全景/3D/空间','自拍类'],
    '医疗/健康': ['健康/生活/实用工具'],
    '宠物': ['电商/商业海报','自拍类']
}

# Also classify into types
CONTENT_TYPES = {
    'persona':  ['自拍类'],
    'product':  ['电商/商业海报','穿搭/形象/造型','教育/科普/图解','品牌/VI/包装'],
    'viral':    ['游戏/娱乐/影视','全景/3D/空间','健康/生活/实用工具','视频制作/Seedance']
}

def classify(cat):
    for key, cats in CONTENT_TYPES.items():
        if cat in cats: return key
    return 'viral'

for industry, boost_cats in INDUSTRY_BOOST.items():
    matching = [p for p in data if p["cat"] in boost_cats]
    new_matching = [p for p in matching if p["id"] >= 200]

    # Each gap industry must have >=3 matching in its boost categories
    test(f"{industry}: >=3 matching prompts", len(matching) >= 3, f"got {len(matching)}")

    # Each gap industry must have >=1 NEW matching prompt
    test(f"{industry}: >=1 NEW matching prompt", len(new_matching) >= 1, f"got {len(new_matching)}")

    # Check type coverage: each industry should have prompts across its boost types
    types_seen = set(classify(p["cat"]) for p in matching)
    test(f"{industry}: covers at least one content type", len(types_seen) >= 1, f"types: {types_seen}")

# Check boost categories that were previously weak (0-2) now have >=3
print()
critical_cats = {'全景/3D/空间': 1, '品牌/VI/包装': 1, '自拍类': 1, '健康/生活/实用工具': 2}
for cat, before in critical_cats.items():
    now = len([p for p in data if p["cat"] == cat])
    test(f"Category '{cat}': {before}→{now} prompts (was weak)", now >= 3, f"now {now}")

# ═══════════════════════════════════════════════════════════
# SECTION 3: creator-simple.html fixes
# ═══════════════════════════════════════════════════════════
section("3. creator-simple.html -- GitHubURL removed + subscribe CTA")

cs = open("creator-simple.html", encoding="utf-8").read()

# GitHubURL placeholder removed
test("No 'GitHubURL' placeholder text", "GitHubURL" not in cs)

# Tool cards have href field
test("TOOLS have href field", "href:'tools.html'" in cs)

# Detail link present (Chinese)
test("Tool card shows '详情→' link", "詳細→" in cs or "详情→" in cs)

# Subscribe CTA on login failure
test("Login error shows '立即订阅 →'", "立即订阅" in cs)
test("Login error shows checkout redirect link", "checkout.html?redirect=creator-simple" in cs)

# ═══════════════════════════════════════════════════════════
# SECTION 4: checkout.html -- redirect storage
# ═══════════════════════════════════════════════════════════
section("4. checkout.html -- saves redirect preference")

ch = open("checkout.html", encoding="utf-8").read()

test("Saves redirect to sessionStorage", "sessionStorage.setItem('checkout-redirect'" in ch)
test("Reads redirect from URL param", "URLSearchParams(window.location.search).get('redirect')" in ch)

# ═══════════════════════════════════════════════════════════
# SECTION 5: success.html -- reads redirect preference
# ═══════════════════════════════════════════════════════════
section("5. success.html -- routes back to creator-simple")

sh = open("success.html", encoding="utf-8").read()

test("Reads checkout-redirect from sessionStorage", "sessionStorage.getItem('checkout-redirect')" in sh)
test("Clears redirect after reading", "sessionStorage.removeItem('checkout-redirect')" in sh)
test("Routes to creator-simple when redirect=creator-simple", "cta.href = 'creator-simple.html'" in sh)
test("Changes CTA text to '去灵感推荐'", "去灵感推荐" in sh)

# ═══════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════
section("SUMMARY")
total = PASS + FAIL
print(f"  {PASS}/{total} passed, {FAIL} failed")
if FAIL == 0:
    print("  ALL TESTS PASSED")
else:
    print(f"  {FAIL} TEST(S) FAILED!")
    sys.exit(1)
