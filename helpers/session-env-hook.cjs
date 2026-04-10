#!/usr/bin/env node
/**
 * Session Environment Hook  (Trick 2 — ADR-055)
 *
 * SessionStart hook: detects project type and injects persistent env vars
 * into $CLAUDE_ENV_FILE so all hooks and Claude itself see them.
 *
 * Injects:
 *   PROJECT_TYPE      nodejs | python | rust | go | php | unknown
 *   PROJECT_TEST_CMD  detected test runner command
 *   PROJECT_BUILD_CMD detected build command
 *   PROJECT_HAS_GIT   true | false
 */
'use strict';

const fs   = require('fs');
const path = require('path');

// Drain hook context from stdin — prevents cmd.exe from echoing the JSON as a command
if (!process.stdin.isTTY) try { fs.readFileSync(0, 'utf8'); } catch {}

const CWD      = process.cwd();
const ENV_FILE = process.env.CLAUDE_ENV_FILE;

function detect() {
  const env = {};

  // ── Project type ────────────────────────────────────────────────────────────
  if (fs.existsSync(path.join(CWD, 'package.json'))) {
    env.PROJECT_TYPE = 'nodejs';
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(CWD, 'package.json'), 'utf-8'));
      env.PROJECT_TEST_CMD  = (pkg.scripts && pkg.scripts.test)  || 'npm test';
      env.PROJECT_BUILD_CMD = (pkg.scripts && pkg.scripts.build) || 'npm run build';
    } catch {
      env.PROJECT_TEST_CMD  = 'npm test';
      env.PROJECT_BUILD_CMD = 'npm run build';
    }
  } else if (fs.existsSync(path.join(CWD, 'requirements.txt')) ||
             fs.existsSync(path.join(CWD, 'pyproject.toml')) ||
             fs.existsSync(path.join(CWD, 'setup.py'))) {
    env.PROJECT_TYPE      = 'python';
    env.PROJECT_TEST_CMD  = 'pytest';
    env.PROJECT_BUILD_CMD = 'python -m build';
  } else if (fs.existsSync(path.join(CWD, 'Cargo.toml'))) {
    env.PROJECT_TYPE      = 'rust';
    env.PROJECT_TEST_CMD  = 'cargo test';
    env.PROJECT_BUILD_CMD = 'cargo build';
  } else if (fs.existsSync(path.join(CWD, 'go.mod'))) {
    env.PROJECT_TYPE      = 'go';
    env.PROJECT_TEST_CMD  = 'go test ./...';
    env.PROJECT_BUILD_CMD = 'go build ./...';
  } else if (fs.existsSync(path.join(CWD, 'composer.json'))) {
    env.PROJECT_TYPE      = 'php';
    env.PROJECT_TEST_CMD  = 'composer test';
    env.PROJECT_BUILD_CMD = 'composer install';
  } else {
    env.PROJECT_TYPE = 'unknown';
  }

  // ── Git presence ─────────────────────────────────────────────────────────────
  env.PROJECT_HAS_GIT = fs.existsSync(path.join(CWD, '.git')) ? 'true' : 'false';

  return env;
}

function writeEnvFile(vars) {
  if (!ENV_FILE) return; // not in SessionStart context — skip silently

  try {
    const lines = Object.entries(vars).map(([k, v]) => `export ${k}="${v}"`).join('\n');
    fs.appendFileSync(ENV_FILE, lines + '\n', 'utf-8');
  } catch (e) {
    process.stderr.write(`[SessionEnv] Could not write env file: ${e.message}\n`);
  }
}

const vars = detect();
writeEnvFile(vars);
process.exit(0);
