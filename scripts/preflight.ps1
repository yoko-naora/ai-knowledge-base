# preflight.ps1 — 开工自检
# 用法: .\scripts\preflight.ps1
# 做: 对比实际文件 vs PROJECT.md → 不一致就修 → commit
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "=== preflight ===" -ForegroundColor Cyan

# 1. 数文章
$ids    = Get-ChildItem articles\*.html | ForEach-Object { $_.BaseName } | Sort-Object
$actual = $ids.Count
$maxId  = [int]($ids[-1])
$range  = "001-$('{0:D3}' -f $maxId)"
Write-Host "articles/*.html: $actual 篇 (范围 $range)" -ForegroundColor Gray

# 2. 读 PROJECT.md 写的内容
$raw = Get-Content PROJECT.md -Raw

# 找文章范围
$rangeMatch = [regex]::Match($raw, 'articles/(\d{3}-\d{3})')
$docRange   = if ($rangeMatch.Success) { $rangeMatch.Groups[1].Value } else { $null }

# 找文章计数
$countMatch = [regex]::Match($raw, '(\d+) articles\)')
$docCount   = if ($countMatch.Success) { [int]$countMatch.Groups[1].Value } else { 0 }

Write-Host "PROJECT.md: range=articles/$docRange  count=$docCount" -ForegroundColor Gray

# 3. git log
$lastCommit = git log --oneline -1
Write-Host "git HEAD: $lastCommit" -ForegroundColor Gray

# 4. 对比 & 修复
$changed = $false

if ($docRange -ne $range) {
    Write-Host "[!] 范围不一致: 实际 $range vs 文档 $docRange" -ForegroundColor Yellow
    $raw = $raw -replace [regex]::Escape("articles/$docRange"), "articles/$range"
    $changed = $true
}

$expectedCount = $actual
if ($docCount -ne $expectedCount) {
    Write-Host "[!] 计数不一致: 实际 $expectedCount vs 文档 $docCount" -ForegroundColor Yellow
    $raw = $raw -replace "$docCount articles\)", "$expectedCount articles)"
    $changed = $true
}

if ($changed) {
    $raw | Set-Content PROJECT.md -NoNewline -Encoding UTF8
    Write-Host "[✓] PROJECT.md 已更新" -ForegroundColor Green
    git add PROJECT.md scripts/preflight.ps1
    git commit -m "preflight: PROJECT.md 文章数修正 $docCount→$actual"
    Write-Host "[✓] committed" -ForegroundColor Green
} else {
    Write-Host "[✓] PROJECT.md 与实际一致" -ForegroundColor Green
}

# 5. git remote
$remote = git remote get-url origin 2>$null
Write-Host "remote: $remote" -ForegroundColor Gray

Write-Host "=== preflight done ===`n开工。" -ForegroundColor Cyan
