#!/usr/bin/env bash
# install.sh — Claude Project Doctor installer (macOS / Linux / Git Bash)
# Run once after cloning or updating:  bash install.sh

set -euo pipefail

CLAUDE_DIR="$HOME/.claude"
HELPERS_DIR="$CLAUDE_DIR/helpers"
SETTINGS="$CLAUDE_DIR/settings.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_HELPERS="$SCRIPT_DIR/helpers"

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo ""
echo -e "${CYAN}Claude Project Doctor — Installer${NC}"
echo -e "${CYAN}===================================${NC}"
echo ""

# 1. Ensure helpers directory exists
mkdir -p "$HELPERS_DIR"

# 2. Copy helper scripts
COPIED=0
for f in "$SRC_HELPERS"/*; do
  fname="$(basename "$f")"
  cp "$f" "$HELPERS_DIR/$fname"
  COPIED=$((COPIED + 1))
done
chmod +x "$HELPERS_DIR"/*.sh 2>/dev/null || true
echo -e "  ${GREEN}Copied $COPIED helper scripts to $HELPERS_DIR${NC}"

# 3. Ensure settings.json exists
if [ ! -f "$SETTINGS" ]; then
  echo '{}' > "$SETTINGS"
  echo -e "  ${YELLOW}Created empty settings.json${NC}"
fi

# 4. Backup settings.json
BACKUP="$SETTINGS.bak-$(date +%Y%m%d-%H%M%S)"
cp "$SETTINGS" "$BACKUP"
echo -e "  Backed up settings.json → $(basename "$BACKUP")"

# 5. Patch settings.json using Node.js
node - "$SETTINGS" << 'NODEEOF'
const fs   = require('fs');
const path = require('path');
const file = process.argv[2];
const home = process.env.HOME || process.env.USERPROFILE;

let cfg = {};
try { cfg = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}

if (!cfg.hooks) cfg.hooks = {};

const H = '%USERPROFILE%/.claude/helpers';
const cmd = (c, t) => ({ type: 'command', command: c, timeout: t });

// SessionStart
cfg.hooks.SessionStart = [{ hooks: [
  cmd(`node ${H}/hook-handler.cjs session-restore`, 15000),
  cmd(`node ${H}/auto-memory-hook.mjs import`, 8000),
  cmd(`node ${H}/auto-git-pull.cjs`, 15000),
  cmd(`node ${H}/doctor-hook.cjs`, 10000),
  cmd(`node ${H}/session-env-hook.cjs`, 5000),
  cmd(`node ${H}/learning-lifecycle-hook.cjs session-start`, 15000),
]}];

// UserPromptSubmit
cfg.hooks.UserPromptSubmit = [{ hooks: [
  cmd(`node ${H}/hook-handler.cjs route`, 10000),
]}];

// PreToolUse
cfg.hooks.PreToolUse = [
  { matcher: 'Bash',               hooks: [cmd(`node ${H}/hook-handler.cjs pre-bash`, 5000)] },
  { matcher: 'Write|Edit|MultiEdit', hooks: [cmd(`node ${H}/hook-handler.cjs pre-edit`, 5000)] },
];

// PostToolUse
cfg.hooks.PostToolUse = [
  { matcher: 'Write|Edit|MultiEdit', hooks: [
    cmd(`node ${H}/hook-handler.cjs post-edit`, 10000),
    cmd(`node ${H}/learning-lifecycle-hook.cjs store "code-edit" code 0.7`, 8000),
  ]},
  { matcher: 'Bash', hooks: [cmd(`node ${H}/hook-handler.cjs post-bash`, 5000)] },
];

// Stop
cfg.hooks.Stop = [{ hooks: [
  cmd(`node ${H}/auto-memory-hook.mjs sync`, 10000),
  cmd(`node ${H}/auto-reflect-hook.cjs`, 8000),
  {
    type: 'prompt',
    model: 'claude-haiku-4-5-20251001',
    prompt: 'Quality & Security Gate: Review this session\'s transcript. Check ALL: (1) IF source files modified: were tests run/passing, OR did user explicitly waive? (2) IF source files modified: any hardcoded API key, token, password, secret, or credential visible in the changes? (3) IF SQL queries written: parameterized queries used — NOT string concat? (4) IF shell commands constructed with user input: execFile/array args — NOT string concat? BLOCK with {"decision":"block","reason":"..."} if: (a) source files changed without tests and user did not waive, OR (b) hardcoded secrets detected, OR (c) SQL injection risk, OR (d) command injection risk. Otherwise {"decision":"approve"}.',
    timeout: 30000,
  },
]}];

// SessionEnd
cfg.hooks.SessionEnd = [{ hooks: [
  cmd(`node ${H}/hook-handler.cjs session-end`, 10000),
  cmd(`node ${H}/learning-lifecycle-hook.cjs session-end`, 15000),
]}];

fs.writeFileSync(file, JSON.stringify(cfg, null, 2), 'utf8');
console.log('  settings.json updated');
NODEEOF

echo ""
echo -e "  ${GREEN}Installation complete!${NC}"
echo ""
echo "  Next steps:"
echo "    1. Restart Claude Code to activate the new hooks"
echo "    2. Run: claude skills install agamm/claude-code-owasp"
echo "    3. Optional: npm install -g semgrep  (SAST)"
echo "    4. Optional: brew install gitleaks   (secret scan)"
echo ""
