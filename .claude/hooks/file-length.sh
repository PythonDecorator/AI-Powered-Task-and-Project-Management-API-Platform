#!/bin/bash
# file-length.sh — warns when a file exceeds 400 lines
# non-blocking — Claude sees the warning and should split the file

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('path',''))" 2>/dev/null)

# Only check Python and JS files
if ! echo "$FILE_PATH" | grep -qE "\.(py|js|jsx|ts|tsx)$"; then
  exit 0
fi

# Skip migrations
if echo "$FILE_PATH" | grep -qE "/migrations/"; then
  exit 0
fi

if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

LINE_COUNT=$(wc -l < "$FILE_PATH")
MAX_LINES=400

if [ "$LINE_COUNT" -gt "$MAX_LINES" ]; then
  echo "⚠ File too long: $FILE_PATH is $LINE_COUNT lines (max $MAX_LINES)." >&2
  echo "Split it into smaller modules immediately." >&2
fi

exit 0
