#!/bin/bash
# session-start.sh — logs session start with git context
# async — does not block Claude starting

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
BRANCH=$(git -C "$CLAUDE_PROJECT_DIR" branch --show-current 2>/dev/null || echo "unknown")
LOG_FILE="$CLAUDE_PROJECT_DIR/.claude/session.log"

echo "[$TIMESTAMP] Session started | Branch: $BRANCH" >> "$LOG_FILE"

# Warn if on master/main
if echo "$BRANCH" | grep -qE "^(master|main)$"; then
  echo "⚠ WARNING: You are on '$BRANCH'. Create a feature branch before making changes." >&2
fi
