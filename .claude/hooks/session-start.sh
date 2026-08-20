#!/bin/bash
# Installs npm dependencies so tests, linters and the dev server are ready
# when a Claude Code on the web session starts.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

npm install --no-audit --no-fund
