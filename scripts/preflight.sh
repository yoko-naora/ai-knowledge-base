#!/bin/bash
# preflight.sh — 开工自检 (WSL/Linux版)
# 用法: bash scripts/preflight.sh
# 做: 对比实际文件 vs PROJECT.md → 不一致就修 → commit
set -euo pipefail
cd "$(dirname "$0")/.."

echo -e "\033[36m=== preflight ===\033[0m"

# 0. 先拉最新，确保读到正确的 PROJECT.md 和快照
git pull --ff-only 2>/dev/null || true

# 1. 数文章 (find 比 ls 可靠，WSL 下不会漏)
ids=($(find articles/ -maxdepth 1 -name '*.html' -printf '%f\n' | sed 's|\.html||' | sort -n))
actual=${#ids[@]}
if [ "$actual" -eq 0 ]; then
    echo -e "\033[31m[✗] articles/ 下未找到 HTML 文件，目录对吗？\033[0m"
    exit 1
fi
max_id=${ids[-1]}
range=$(printf "001-%03d" "$max_id")

# 自检：范围ID跨度 vs 实际文件数不能矛盾（如 001-031 ≠ 35）
range_span=$((max_id - ${ids[0]} + 1))
echo -e "\033[90marticles/: ${actual} 篇, ID范围 ${range}, 跨度${range_span}个ID, 缺${range_span}-${actual}个号\033[0m"

# 2. 读 PROJECT.md 写的内容
raw=$(cat PROJECT.md)

# 找文章范围
doc_range=$(echo "$raw" | grep -oP 'articles/\K\d{3}-\d{3}' | head -1)
# 找文章计数
doc_count=$(echo "$raw" | grep -oP '\d+(?= articles\))' | head -1)

echo -e "\033[90mPROJECT.md: range=articles/${doc_range}  count=${doc_count}\033[0m"

# 3. git log
last_commit=$(git log --oneline -1)
echo -e "\033[90mgit HEAD: ${last_commit}\033[0m"

# 4. 对比 & 修复
changed=false
blocked=false

# 安全网：用快照校验文件系统视图是否完整
snapshot_count=$(wc -l < .preflight-snapshot 2>/dev/null || echo 0)
if [ "$snapshot_count" -gt 0 ] && [ "$actual" -lt "$snapshot_count" ]; then
    echo -e "\033[31m[✗] 安全阻断: 只扫到 ${actual} 篇，快照有 ${snapshot_count} 篇"
    echo -e "    当前环境看不到全部文件（WSL /mnt/ 缓存？请先 git pull 后重试）。"
    echo -e "    拒绝修改 PROJECT.md。\033[0m"
    blocked=true
elif [ "$actual" -lt "$doc_count" ]; then
    echo -e "\033[31m[✗] 安全阻断: 只扫到 ${actual} 篇，但 PROJECT.md 记录了 ${doc_count} 篇"
    echo -e "    拒绝修改 PROJECT.md。请在能访问完整文件的终端重试。\033[0m"
    blocked=true
fi

if ! $blocked; then
    if [ "$doc_range" != "$range" ]; then
        echo -e "\033[33m[!] 范围不一致: 实际 ${range} vs 文档 ${doc_range}\033[0m"
        raw=$(echo "$raw" | sed "s|articles/${doc_range}|articles/${range}|g")
        changed=true
    fi

    if [ "$doc_count" != "$actual" ]; then
        echo -e "\033[33m[!] 计数不一致: 实际 ${actual} vs 文档 ${doc_count}\033[0m"
        raw=$(echo "$raw" | sed "s|${doc_count} articles)|${actual} articles)|g")
        changed=true
    fi

    if $changed; then
        echo "$raw" > PROJECT.md
        echo -e "\033[32m[✓] PROJECT.md 已更新\033[0m"
        git add PROJECT.md scripts/preflight.sh 2>/dev/null || true
        git commit -m "preflight: PROJECT.md 文章数修正 ${doc_count}→${actual}"
        echo -e "\033[32m[✓] committed\033[0m"
    else
        echo -e "\033[32m[✓] PROJECT.md 与实际一致\033[0m"
    fi
fi

# 5. git remote
remote=$(git remote get-url origin 2>/dev/null || echo "未設定")
echo -e "\033[90mremote: ${remote}\033[0m"

echo -e "\033[36m=== preflight done ===\n开工。\033[0m"
