#!/bin/bash
# check-secrets.sh — scans written files for hardcoded secrets
# exit 2 = block (secret found) · exit 0 = allow

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('path',''))" 2>/dev/null)

# Only scan code files
if ! echo "$FILE_PATH" | grep -qE "\.(py|js|jsx|ts|tsx|json|yml|yaml|env|sh)$"; then
  exit 0
fi

# Skip .env.example and test files — they're allowed to have placeholder values
if echo "$FILE_PATH" | grep -qE "(\.example|test_|tests/|spec/)"; then
  exit 0
fi

if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Patterns that indicate real hardcoded secrets
SECRET_PATTERNS=(
  "sk-ant-[a-zA-Z0-9]"
  "AKIA[0-9A-Z]{16}"
  "AIza[0-9A-Za-z-_]{35}"
  "password\s*=\s*['\"][^'\"]{8,}"
  "secret_key\s*=\s*['\"][^'\"]{8,}"
  "api_key\s*=\s*['\"][^'\"]{8,}"
  "token\s*=\s*['\"][^'\"]{20,}"
  "postgresql://[^:]+:[^@]+@"
  "mysql://[^:]+:[^@]+@"
)

for pattern in "${SECRET_PATTERNS[@]}"; do
  MATCH=$(grep -inE "$pattern" "$FILE_PATH" 2>/dev/null)
  if [ -n "$MATCH" ]; then
    echo "BLOCKED: Possible hardcoded secret detected in $FILE_PATH" >&2
    echo "Pattern matched: $pattern" >&2
    echo "Use os.environ.get() or settings.* — never hardcode credentials." >&2
    exit 2
  fi
done

exit 0
