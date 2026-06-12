#!/bin/bash
# pre-commit hook: block commits if any _legacy/ item has passed its DELETE-AFTER date.
# Installed as .git/hooks/pre-commit. This versioned copy is the source of truth.

LEGACY_DIR="_legacy"
EXIT_CODE=0

if [ ! -d "$LEGACY_DIR" ]; then
  exit 0
fi

for md in "$LEGACY_DIR"/**/DELETE-AFTER-*.md "$LEGACY_DIR"/DELETE-AFTER-*.md; do
  [ -f "$md" ] || continue

  # Extract date from filename: DELETE-AFTER-YYYY-MM-DD.md → YYYY-MM-DD
  fname=$(basename "$md")
  expiry_date="${fname#DELETE-AFTER-}"
  expiry_date="${expiry_date%.md}"

  if [[ ! "$expiry_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "⚠️  WARNING: $md — filename date not in YYYY-MM-DD format, skipping"
    continue
  fi

  expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null || echo 0)
  now_epoch=$(date +%s)

  if [ "$expiry_epoch" -le "$now_epoch" ] 2>/dev/null && [ "$expiry_epoch" != "0" ]; then
    echo ""
    echo "⛔ EXPIRED LEGACY FILES FOUND ⛔"
    echo ""
    echo "  $md"
    echo "  → Delete date was $expiry_date"
    echo ""
    echo "  Action: git rm -r $(dirname "$md")"
    echo "  Then:   commit the deletion"
    echo ""
    echo "  (use git commit --no-verify to bypass, but only if you know what you're doing)"
    echo ""
    EXIT_CODE=1
  fi
done

exit $EXIT_CODE
