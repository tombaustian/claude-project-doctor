#!/usr/bin/env node
/**
 * Claude Project Doctor Hook  (Phase 1 — ADR-051)
 *
 * Fast health check (<3 s) wired into SessionStart.
 * Outputs { systemMessage } JSON so Claude sees the digest at session start.
 *
 * Checks:
 *   1. Memory populated (project memory dir)
 *   2. Intelligence store & graph present
 *   3. Router-learning data
 *   4. Credential files exposed in CWD root
 *   5. Hook configuration completeness in settings.json
 *   6. Recent unreflected sessions
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

// Drain stdin to prevent cmd.exe from echoing the hook JSON context
if (!process.stdin.isTTY) try { fs.readFileSync(0, 'utf8'); } catch {}

const HOME       = os.homedir();
const CLAUDE_DIR = path.join(HOME, '.claude');
const SETTINGS   = path.join(CLAUDE_DIR, 'settings.json');
const CWD        = process.cwd();

// ─── 4-minute throttle: skip if last run was OK and recent ────────────────────
const CACHE_PATH = path.join(HOME, '.claude-flow', 'data', 'doctor-last-run.json');
try {
  const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
  if (cache && cache.status === 'ok' && (Date.now() - cache.ts) < 4 * 60 * 1000) {
    process.exit(0);
  }
} catch { /* no cache yet, run checks */ }

// Derive project key the same way Claude Code does:
// C:\Users\tomba  →  C--Users-tomba
const PROJECT_KEY = CWD.replace(/\\/g, '/').replace(/[:/]/g, '-').replace(/^-+/, '');
const PROJECT_MEM = path.join(CLAUDE_DIR, 'projects', PROJECT_KEY, 'memory');

// Data dir: prefer project-local .claude-flow, fall back to global (Phase 4)
const LOCAL_CF   = path.join(CWD, '.claude-flow');
const DATA_DIR   = fs.existsSync(LOCAL_CF)
  ? path.join(LOCAL_CF, 'data')
  : path.join(HOME, '.claude-flow', 'data');

const STORE_PATH = path.join(DATA_DIR, 'auto-memory-store.json');
const GRAPH_PATH = path.join(DATA_DIR, 'graph-state.json');
const LEARNED    = path.join(HOME, '.claude-flow', 'data', 'routing-learned.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

// ─── Result buckets ───────────────────────────────────────────────────────────

const issues   = [];   // Critical — blocks if any
const warnings = [];   // Important but non-blocking
const info     = [];   // Green status items (shown only if issues/warnings exist)

// ─── Check 1: Memory ──────────────────────────────────────────────────────────

function checkMemory() {
  if (!fs.existsSync(PROJECT_MEM)) {
    warnings.push('Memory-Dir fehlt — /reflect ausführen um Session-Lerneffekte zu speichern');
    return;
  }
  const files = fs.readdirSync(PROJECT_MEM)
    .filter(f => f.endsWith('.md') && f !== 'MEMORY.md');
  if (files.length === 0) {
    warnings.push('Memory leer — /reflect ausführen um Session-Wissen zu persistieren');
  } else {
    info.push(`Memory: ${files.length} Einträge`);
  }
}

// ─── Check 2: Intelligence store + graph ─────────────────────────────────────

function checkIntelligence() {
  if (!fs.existsSync(STORE_PATH)) {
    warnings.push('Intelligence-Store fehlt — PageRank-Gedächtnis noch nicht initialisiert (wächst ab nächster Session)');
    return;
  }
  const store = readJSON(STORE_PATH);
  if (!Array.isArray(store) || store.length === 0) {
    warnings.push('Intelligence-Store leer — Patterns akkumulieren sich mit jeder Session');
  } else {
    const graphOk = fs.existsSync(GRAPH_PATH);
    info.push(`Intelligence: ${store.length} Patterns${graphOk ? ' + Graph ✓' : ' (Graph wird rebuilt)'}`);
  }
}

// ─── Check 3: Router-learning data ───────────────────────────────────────────

function checkRouterLearning() {
  if (!fs.existsSync(LEARNED)) {
    info.push('Router-Learning: Noch keine gelernten Patterns (wächst automatisch)');
    return;
  }
  const data = readJSON(LEARNED);
  const count = Object.keys((data && data.patterns) || {}).length;
  const total = (data && data.totalRoutings) || 0;
  if (count > 0) {
    info.push(`Router-Learning: ${count} Patterns gelernt (${total} Routings gesamt)`);
  }
}

// ─── Check 4: Credential exposure ────────────────────────────────────────────

function checkCredentials() {
  const CRED = [
    '.env', '.env.local', '.env.production', '.env.staging', '.env.development',
    'credentials.json', '.credentials.json', 'token.json', 'secrets.json', 'api-keys.json',
  ];
  const found = CRED.filter(f => fs.existsSync(path.join(CWD, f)));
  if (found.length > 0) {
    issues.push(`Credential-Dateien im Root: ${found.join(', ')} — .gitignore prüfen!`);
  }
}

// ─── Check 5: Hook configuration ─────────────────────────────────────────────

function checkHooks() {
  const settings = readJSON(SETTINGS);
  if (!settings) { warnings.push('settings.json nicht lesbar'); return; }
  const hooks = settings.hooks || {};
  const required = ['SessionStart', 'Stop', 'UserPromptSubmit', 'PostToolUse'];
  const missing  = required.filter(h => !hooks[h] || hooks[h].length === 0);
  if (missing.length > 0) {
    warnings.push(`Fehlende Hook-Events: ${missing.join(', ')}`);
  } else {
    info.push(`Hooks: ${Object.keys(hooks).length} Events konfiguriert`);
  }
}

// ─── Check 6a: HOME root credential files (e.g. token.json outside of project) ─

function checkHomeCredentials() {
  const HOME_CRED = ['token.json', 'credentials.json', 'api-keys.json', 'secrets.json'];
  const found = HOME_CRED.filter(f => fs.existsSync(path.join(HOME, f)));
  if (found.length > 0) {
    issues.push(`Credential-Dateien im HOME-Root: ${found.join(', ')} — sofort sichern oder löschen!`);
  }
}

// ─── Check 6b: Security tools availability ────────────────────────────────────

function checkSecurityTools() {
  const { spawnSync } = require('child_process');
  const tools = [
    { cmd: 'semgrep', args: ['--version'], label: 'Semgrep (SAST)' },
    { cmd: 'gitleaks', args: ['version'], label: 'Gitleaks (secret scan)' },
  ];
  const missing = [];
  for (const { cmd, args, label } of tools) {
    const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 3000 });
    if (r.status !== 0 && !r.stdout) missing.push(label);
  }
  if (missing.length > 0) {
    info.push(`Optionale Security-Tools nicht installiert: ${missing.join(', ')} (npm install -g semgrep / brew install gitleaks)`);
  } else {
    info.push(`Security-Tools: ${tools.map(t => t.label).join(', ')} verfügbar`);
  }
}

// ─── Check 6c: OWASP skill installed ─────────────────────────────────────────

function checkSecuritySkills() {
  const owaspSkillPaths = [
    path.join(CLAUDE_DIR, 'plugins', 'cache', 'agamm', 'claude-code-owasp'),
    path.join(CLAUDE_DIR, 'skills', 'claude-code-owasp'),
  ];
  const hasOwasp = owaspSkillPaths.some(p => fs.existsSync(p));
  if (!hasOwasp) {
    info.push('OWASP-Skill nicht installiert — empfohlen: claude skills install agamm/claude-code-owasp');
  } else {
    info.push('OWASP Top 10:2025 Skill: aktiv');
  }
}

// ─── Check 6: Unreflected sessions ───────────────────────────────────────────

function checkSessions() {
  const sessDir = path.join(CLAUDE_DIR, 'sessions');
  if (!fs.existsSync(sessDir)) return;
  try {
    const files = fs.readdirSync(sessDir).filter(f => f.endsWith('.json'));
    const recent = files.filter(f => {
      const ageH = (Date.now() - fs.statSync(path.join(sessDir, f)).mtimeMs) / 3_600_000;
      return ageH < 72;
    });
    if (recent.length >= 3) {
      warnings.push(`${recent.length} Sessions (72 h) — stelle sicher, dass Lerneffekte gespeichert wurden`);
    }
  } catch { /* ignore */ }
}

// ─── Run all checks ───────────────────────────────────────────────────────────

try { checkMemory();           } catch { /* never crash Claude */ }
try { checkIntelligence();     } catch { /* never crash Claude */ }
try { checkRouterLearning();   } catch { /* never crash Claude */ }
try { checkCredentials();      } catch { /* never crash Claude */ }
try { checkHomeCredentials();  } catch { /* never crash Claude */ }
try { checkHooks();            } catch { /* never crash Claude */ }
try { checkSessions();         } catch { /* never crash Claude */ }
try { checkSecurityTools();    } catch { /* never crash Claude */ }
try { checkSecuritySkills();   } catch { /* never crash Claude */ }

// ─── Build output ─────────────────────────────────────────────────────────────

// Healthy + no warnings → silent exit, write cache
if (issues.length === 0 && warnings.length === 0) {
  try {
    const cacheDir = path.dirname(CACHE_PATH);
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify({ status: 'ok', ts: Date.now() }), 'utf-8');
  } catch { /* non-fatal */ }
  process.exit(0);
}

const lines = ['[Doctor] System-Diagnose:'];
if (issues.length > 0) {
  lines.push('KRITISCH:');
  issues.forEach(i => lines.push(`  ✗ ${i}`));
}
if (warnings.length > 0) {
  warnings.forEach(w => lines.push(`  ⚠ ${w}`));
}
if (info.length > 0) {
  info.forEach(i => lines.push(`  ✓ ${i}`));
}

// Write cache with 'issues' so throttle doesn't suppress on next run
try {
  const cacheDir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify({ status: 'issues', ts: Date.now() }), 'utf-8');
} catch { /* non-fatal */ }

process.stdout.write(JSON.stringify({ systemMessage: lines.join('\n') }));
process.exit(0);
