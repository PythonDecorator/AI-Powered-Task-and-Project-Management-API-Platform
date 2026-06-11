#!/bin/bash
# lint-python.sh — runs flake8 on any .py file Claude just wrote
# non-blocking (exit 0 always) — output is shown as a warning only

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('path',''))" 2>/dev/null)

# Only run on Python files
if ! echo "$FILE_PATH" | grep -qE "\.py$"; then
  exit 0
fi

# Skip migrations
if echo "$FILE_PATH" | grep -qE "/migrations/"; then
  exit 0
fi

# Find the backend directory
BACKEND_DIR="$CLAUDE_PROJECT_DIR/backend"
if [ ! -d "$BACKEND_DIR" ]; then
  BACKEND_DIR="$CLAUDE_PROJECT_DIR"
fi

# Run flake8
cd "$BACKEND_DIR"
OUTPUT=$(flake8 "$FILE_PATH" 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "⚠ flake8 issues in $FILE_PATH:" >&2
  echo "$OUTPUT" >&2
fi

# Always exit 0 — lint warnings inform Claude but don't block
exit 0
