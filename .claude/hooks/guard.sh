#!/bin/bash
# guard.sh — blocks dangerous bash commands before they run
# exit 2 = block Claude · exit 0 = allow

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null)

# Block destructive commands
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf \*"
  "DROP TABLE"
  "DROP DATABASE"
  "git push.*master"
  "git push.*main --force"
  "git push -f"
  "chmod -R 777"
  "> /dev/sda"
  "mkfs"
  "dd if="
  "truncate.*--size 0"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "BLOCKED: Dangerous command detected — '$pattern'" >&2
    echo "Command: $COMMAND" >&2
    exit 2
  fi
done

# Block direct pushes to master/main
if echo "$COMMAND" | grep -qE "git push" && echo "$COMMAND" | grep -qE "(master|main)" && ! echo "$COMMAND" | grep -qE "(origin/|upstream/)"; then
  echo "BLOCKED: Direct push to master/main is not allowed. Use a feature branch." >&2
  exit 2
fi

exit 0
