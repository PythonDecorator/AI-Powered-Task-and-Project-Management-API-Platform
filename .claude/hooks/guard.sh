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

# Block direct pushes to master/main (e.g. "git push origin main" or "git push origin master")
# Allow only pushes to non-protected branch names
if echo "$COMMAND" | grep -qE "git push" && echo "$COMMAND" | grep -qE "\b(master|main)\b"; then
  echo "BLOCKED: Direct push to master/main is not allowed. Use a feature branch and open a PR." >&2
  exit 2
fi

exit 0
