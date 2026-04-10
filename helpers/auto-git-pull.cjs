#!/usr/bin/env node
/**
 * auto-git-pull.cjs
 * SessionStart hook: checks if the current project is a git repo with a remote,
 * and pulls if the local branch is behind. Uses --ff-only for safety.
 */

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');

// Read hook event JSON from stdin
let hookData = {};
try {
  const stdin = fs.readFileSync(0, 'utf8').trim();
  if (stdin) hookData = JSON.parse(stdin);
} catch {
  // stdin not available or not JSON — use process.cwd() as fallback
}

const projectDir = hookData.cwd || process.cwd();

function git(...args) {
  const result = spawnSync('git', args, {
    cwd: projectDir,
    encoding: 'utf8',
  });
  return {
    ok: result.status === 0,
    output: (result.stdout || '').trim(),
  };
}

function hookMessage(msg) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: msg,
    },
  }));
}

// 1. Check if inside a git repo
const isGit = git('rev-parse', '--is-inside-work-tree');
if (!isGit.ok || isGit.output !== 'true') process.exit(0);

// 2. Check if a remote is configured
const remoteCheck = git('remote');
if (!remoteCheck.ok || !remoteCheck.output.trim()) process.exit(0);

// 3. Fetch from remote (quietly)
const fetchResult = git('fetch', '--quiet');
if (!fetchResult.ok) process.exit(0);

// 4. Get current branch
const branch = git('branch', '--show-current');
if (!branch.ok || !branch.output) process.exit(0);
const branchName = branch.output;

// 5. Count commits we are behind
const behindCheck = git('rev-list', `HEAD..origin/${branchName}`, '--count');
if (!behindCheck.ok) process.exit(0);

const behindCount = parseInt(behindCheck.output, 10);

if (behindCount === 0) process.exit(0); // up to date — silent

// 6. We are behind — attempt fast-forward pull
const pullResult = git('pull', '--ff-only', '--quiet');

if (pullResult.ok) {
  hookMessage(`[git-pull] ${behindCount} neuer Commit(s) von origin/${branchName} gezogen.`);
} else {
  hookMessage(`[git-pull] WARNUNG: Pull fehlgeschlagen (${branchName}). Bitte manuell pruefen: git status`);
}

process.exit(0);
