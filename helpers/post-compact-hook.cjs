#!/usr/bin/env node
/**
 * post-compact-hook.cjs
 * PreCompact hook: injects critical behavioral rules into the compacted context.
 *
 * Claude loses CLAUDE.md context after auto-compaction. This hook fires just
 * before compaction and injects the 5 most critical rules as additionalContext,
 * ensuring they survive into the new context window.
 */
'use strict';

const fs = require('fs');

// Drain stdin to prevent cmd.exe echo
if (!process.stdin.isTTY) try { fs.readFileSync(0, 'utf8'); } catch {}

const rules = [
  'NEVER hardcode secrets, API keys, tokens, or passwords in source files — use env vars',
  'SQL queries MUST use parameterized statements — no string concatenation',
  'Shell commands with user input MUST use execFile/array args — no string-built commands',
  'ALWAYS run tests after changing source files — or explicitly waive with user approval',
  'Do ONLY what was asked — no extra features, refactors, or unsolicited improvements',
].join(' | ');

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PreCompact',
    additionalContext: `[Rules nach Compact] ${rules}`,
  },
}));

process.exit(0);
