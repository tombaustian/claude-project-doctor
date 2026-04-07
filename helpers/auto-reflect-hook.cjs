#!/usr/bin/env node
/**
 * Auto-Reflect Hook  (Phase 3 — ADR-053)
 *
 * Actively writes a session reflection to the project memory directory
 * on every Stop event. Replaces the passive "run /reflect" suggestion.
 *
 * The written .md file is picked up by intelligence.cjs on the next
 * SessionStart and indexed into the PageRank graph automatically.
 *
 * Called by the Stop hook in settings.json:
 *   cmd /c node %USERPROFILE%/.claude/helpers/auto-reflect-hook.cjs
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const HOME       = os.homedir();
const CLAUDE_DIR = path.join(HOME, '.claude');
const CWD        = process.cwd();

// Project key matches Claude Code's own derivation
const PROJECT_KEY = CWD.replace(/\\/g, '/').replace(/[:/]/g, '-').replace(/^-+/, '');
const MEM_DIR     = path.join(CLAUDE_DIR, 'projects', PROJECT_KEY, 'memory');

// Data dir (Phase-4-aware: local first, global fallback)
const LOCAL_CF    = path.join(CWD, '.claude-flow');
const DATA_DIR    = fs.existsSync(LOCAL_CF)
  ? path.join(LOCAL_CF, 'data')
  : path.join(HOME, '.claude-flow', 'data');

const PENDING_PATH   = path.join(DATA_DIR, 'pending-insights.jsonl');
const SESSION_FILE   = path.join(LOCAL_CF, 'sessions', 'current.json');
const LAST_ROUTE     = path.join(HOME, '.claude-flow', 'data', 'last-routing.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

// ─── Collect pending insights ─────────────────────────────────────────────────

function collectInsights() {
  const result = { edits: 0, files: new Set() };

  if (!fs.existsSync(PENDING_PATH)) return result;

  try {
    const lines = fs.readFileSync(PENDING_PATH, 'utf-8').split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.type === 'edit') {
          result.edits++;
          if (entry.file && entry.file !== 'unknown') result.files.add(entry.file);
        }
      } catch { /* skip malformed lines */ }
    }
    // Clear pending file after reading
    fs.writeFileSync(PENDING_PATH, '', 'utf-8');
  } catch { /* best effort */ }

  return result;
}

// ─── Session metrics ──────────────────────────────────────────────────────────

function getSessionMetrics() {
  const session = readJSON(SESSION_FILE);
  if (!session) return null;

  const startMs   = new Date(session.startedAt).getTime();
  const durationMin = Math.round((Date.now() - startMs) / 60_000);

  return {
    id:         session.id || 'unknown',
    durationMin,
    metrics:    session.metrics || {},
    cwd:        session.cwd || CWD,
  };
}

// ─── Last routing (for context annotation) ────────────────────────────────────

function getLastRouting() {
  return readJSON(LAST_ROUTE);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function run() {
  const insights = collectInsights();
  const session  = getSessionMetrics();
  const routing  = getLastRouting();

  const tasks    = (session && session.metrics && session.metrics.tasks)    || 0;
  const cmds     = (session && session.metrics && session.metrics.commands) || 0;

  // Skip if session had no meaningful activity
  if (insights.edits === 0 && tasks === 0 && cmds === 0) {
    process.exit(0);
  }

  // Ensure memory dir
  if (!fs.existsSync(MEM_DIR)) {
    try { fs.mkdirSync(MEM_DIR, { recursive: true }); } catch { process.exit(0); }
  }

  const now      = new Date();
  const dateStr  = now.toISOString().slice(0, 10);
  const timeStr  = now.toTimeString().slice(0, 5).replace(':', '-');
  const filename = `session-${dateStr}-${timeStr}.md`;
  const filePath = path.join(MEM_DIR, filename);

  // Deduplicate and limit file list
  const fileList = [...insights.files]
    .map(f => path.basename(f))
    .slice(0, 8)
    .join(', ') || '—';

  const metricLine = [
    session ? `Tasks: ${tasks}` : null,
    `Edits: ${insights.edits}`,
    session ? `Commands: ${cmds}` : null,
    session ? `Dauer: ~${session.durationMin} min` : null,
  ].filter(Boolean).join(' | ');

  const routingLine = routing
    ? `Routing: ${routing.agent} (${routing.source}, confidence: ${(routing.confidence || 0).toFixed(2)})`
    : null;

  const content = [
    '---',
    `name: Session ${dateStr} ${timeStr.replace('-', ':')}`,
    `description: Auto-Reflektion ${dateStr} — ${insights.edits} Edits, ${tasks} Tasks`,
    'type: project',
    '---',
    '',
    `# Session ${dateStr} ${timeStr.replace('-', ':')}`,
    '',
    `**Aktivität**: ${metricLine}`,
    `**Bearbeitete Dateien**: ${fileList}`,
    routingLine ? `**${routingLine}**` : null,
    '',
    '**Why**: Automatische Session-Reflektion via auto-reflect-hook (Phase 3)',
    '**How to apply**: Kontext für nachfolgende Sessions — wird von intelligence.cjs indexiert.',
  ].filter(l => l !== null).join('\n');

  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`[AutoReflect] ${filename} geschrieben (${insights.edits} Edits, ${tasks} Tasks)`);
  } catch (e) {
    console.log(`[AutoReflect] Fehler beim Schreiben: ${e.message}`);
  }

  process.exit(0);
}

run();
