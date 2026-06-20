#!/bin/bash
# session-end.sh — logs session end and reminds about tests
# async — does not block

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
BRANCH=$(git -C "$CLAUDE_PROJECT_DIR" branch --show-current 2>/dev/null || echo "unknown")
LOG_FILE="$CLAUDE_PROJECT_DIR/.claude/session.log"

# Count uncommitted changes
CHANGED=$(git -C "$CLAUDE_PROJECT_DIR" diff --name-only 2>/dev/null | wc -l | tr -d ' ')
STAGED=$(git -C "$CLAUDE_PROJECT_DIR" diff --cached --name-only 2>/dev/null | wc -l | tr -d ' ')

echo "[$TIMESTAMP] Session ended | Branch: $BRANCH | Changed: $CHANGED | Staged: $STAGED" >> "$LOG_FILE"

# Rotate log — keep last 500 lines
if [ -f "$LOG_FILE" ] && [ "$(wc -l < "$LOG_FILE")" -gt 500 ]; then
  tail -n 500 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

# Remind about tests if files were changed
if [ "$CHANGED" -gt 0 ] || [ "$STAGED" -gt 0 ]; then
  echo "" >&2
  echo "📋 Session complete. Reminder:" >&2
  echo "  • Run tests: docker-compose run --rm backend sh -c 'python manage.py test'" >&2
  echo "  • Run lint:  docker-compose run --rm backend sh -c 'flake8 app/'" >&2
  echo "  • Files changed: $CHANGED unstaged, $STAGED staged" >&2
fi
