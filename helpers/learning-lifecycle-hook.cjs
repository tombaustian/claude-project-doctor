#!/usr/bin/env node
/**
 * Learning Lifecycle Hook  (V3 Integration — ADR-056)
 *
 * Wraps learning-hooks.sh for Windows-compatible hook execution.
 * Runs the SQLite+HNSW pattern learning pipeline on session lifecycle events.
 *
 * Usage:
 *   node learning-lifecycle-hook.cjs session-start
 *   node learning-lifecycle-hook.cjs session-end
 *   node learning-lifecycle-hook.cjs store <strategy> [domain] [quality]
 *
 * Wired in settings.json:
 *   SessionStart → session-start
 *   SessionEnd   → session-end
 */
'use strict';

const { spawnSync } = require('child_process');
const path          = require('path');
const os            = require('os');
const fs            = require('fs');

// Drain hook context from stdin — prevents cmd.exe from echoing the JSON as a command
if (!process.stdin.isTTY) try { fs.readFileSync(0, 'utf8'); } catch {}

const [,, cmd, ...args] = process.argv;
const HELPERS_DIR = path.join(os.homedir(), '.claude', 'helpers');
const SCRIPT      = path.join(HELPERS_DIR, 'learning-hooks.sh');

// Find bash executable (Windows: Git for Windows, Linux/Mac: /bin/bash)
function findBash() {
  const candidates = [
    'bash',
    'C:\\Program Files\\Git\\usr\\bin\\bash.exe',
    'C:\\Program Files (x86)\\Git\\usr\\bin\\bash.exe',
    '/bin/bash',
    '/usr/bin/bash',
  ];
  for (const c of candidates) {
    try {
      const r = spawnSync(c, ['--version'], { encoding: 'utf-8', timeout: 2000 });
      if (r.status === 0) return c;
    } catch { /* try next */ }
  }
  return null;
}

function runLearningHook(hookCmd, hookArgs = []) {
  const bash = findBash();
  if (!bash) {
    console.log('[Learning] bash not found — skipping learning lifecycle');
    process.exit(0);
  }

  if (!fs.existsSync(SCRIPT)) {
    console.log('[Learning] learning-hooks.sh not found — skipping');
    process.exit(0);
  }

  const sessionId = process.env.CLAUDE_SESSION_ID || `session-${Date.now()}`;
  const scriptArgs = hookCmd === 'session-start'
    ? [SCRIPT, 'session-start', sessionId]
    : hookCmd === 'session-end'
      ? [SCRIPT, 'session-end']
      : [SCRIPT, hookCmd, ...hookArgs];

  const result = spawnSync(bash, scriptArgs, {
    encoding: 'utf-8',
    timeout: 15000,
    cwd: process.cwd(),
    env: { ...process.env, TERM: 'xterm-256color' },
  });

  // Print output (strip ANSI colors for clean hook output)
  const out = (result.stdout || '').replace(/\x1b\[[0-9;]*m/g, '').trim();
  const err = (result.stderr || '').replace(/\x1b\[[0-9;]*m/g, '').trim();

  if (out) console.log(out);
  if (err && result.status !== 0) console.log(`[Learning] stderr: ${err.slice(0, 200)}`);

  if (result.status !== 0) {
    console.log(`[Learning] ${hookCmd} exited ${result.status} — non-fatal`);
  }
}

// Map hook commands
if (cmd === 'session-start' || cmd === 'session-end') {
  runLearningHook(cmd);
} else if (cmd === 'store' && args.length > 0) {
  runLearningHook('store', args);
} else {
  console.log('[Learning] Usage: session-start | session-end | store <strategy> [domain] [quality]');
}

process.exit(0);
