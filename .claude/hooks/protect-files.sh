#!/bin/bash
# protect-files.sh — blocks writes to sensitive files
# exit 2 = block · exit 0 = allow

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('path',''))" 2>/dev/null)

PROTECTED=(
  ".env"
  ".env.production"
  ".env.staging"
  "settings/production.py"
  "settings/staging.py"
)

for protected in "${PROTECTED[@]}"; do
  if echo "$FILE_PATH" | grep -qE "(^|/)$protected$"; then
    echo "BLOCKED: '$FILE_PATH' is a protected file." >&2
    echo "Edit it manually — Claude is not allowed to modify environment or production config files." >&2
    exit 2
  fi
done

exit 0
