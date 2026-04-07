#!/usr/bin/env node
/**
 * Learning Router  (Phase 2 — ADR-052)
 *
 * Extends the static keyword router with a persistent learning layer.
 * Learned patterns are stored in ~/.claude-flow/data/routing-learned.json.
 *
 * API:
 *   routeTaskWithLearning(prompt)          → { agent, confidence, reason, source, key }
 *   recordRouting(prompt, agent, success)  → void  (called from post-task hook)
 *   routingStats()                         → { totalPatterns, totalRoutings, … }
 *
 * CLI:
 *   node router-learning.js route   "<prompt>"
 *   node router-learning.js record  "<prompt>" <agent> [true|false]
 *   node router-learning.js stats
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const BASE_ROUTER  = require('./router.js');
const LEARNED_DIR  = path.join(os.homedir(), '.claude-flow', 'data');
const LEARNED_PATH = path.join(LEARNED_DIR, 'routing-learned.json');

// ─── Persistence ──────────────────────────────────────────────────────────────

function loadLearned() {
  try {
    if (fs.existsSync(LEARNED_PATH)) {
      return JSON.parse(fs.readFileSync(LEARNED_PATH, 'utf-8'));
    }
  } catch { /* start fresh */ }
  return { version: 1, patterns: {}, totalRoutings: 0, lastUpdated: null };
}

function saveLearned(data) {
  try {
    if (!fs.existsSync(LEARNED_DIR)) fs.mkdirSync(LEARNED_DIR, { recursive: true });
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(LEARNED_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch { /* best effort */ }
}

// ─── Prompt → stable key ──────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','to','of','in','for','on','with','at','by',
  'from','and','but','or','not','this','that','it','its','we','you','i','my','your',
  'ich','die','der','das','ein','eine','und','oder','nicht','von','mit','für','ist',
  'sind','war','hat','haben','werden','wird','im','am','dem','den','ein','ich',
]);

function promptKey(prompt) {
  return prompt.toLowerCase()
    .replace(/[^a-z0-9äöüß\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, 6)
    .sort()
    .join('|');
}

// ─── Route with learning ───────────────────────────────────────────────────────

function routeTaskWithLearning(prompt) {
  if (!prompt) return BASE_ROUTER.routeTask('');

  const learned = loadLearned();
  const key     = promptKey(prompt);

  // Use learned pattern if it has ≥2 successful uses and >50% success rate
  const p = learned.patterns[key];
  if (p && p.successCount >= 2) {
    const total      = p.successCount + p.failCount;
    const successRate = p.successCount / total;
    if (successRate > 0.5) {
      const confidence = Math.min(0.95, 0.65 + p.successCount * 0.05);
      return {
        agent:      p.agent,
        confidence,
        reason:     `Gelernt: ${p.successCount}x erfolgreich (${Math.round(successRate * 100)}% Erfolgsquote)`,
        source:     'learned',
        key,
      };
    }
  }

  // Fall back to static keyword routing
  const result = BASE_ROUTER.routeTask(prompt);
  return { ...result, source: 'static', key };
}

// ─── Record routing outcome ────────────────────────────────────────────────────

function recordRouting(prompt, agent, success) {
  if (!prompt || !agent) return;

  const learned = loadLearned();
  const key     = promptKey(prompt);

  if (!learned.patterns[key]) {
    learned.patterns[key] = {
      agent,
      successCount: 0,
      failCount:    0,
      firstSeen:    new Date().toISOString(),
      lastSeen:     null,
    };
  }

  const p = learned.patterns[key];
  if (success) {
    p.successCount++;
    p.agent = agent;  // track most recently successful agent
  } else {
    p.failCount++;
  }
  p.lastSeen = new Date().toISOString();
  learned.totalRoutings++;

  // Prune patterns with >10 samples and majority failures
  const total = p.successCount + p.failCount;
  if (total > 10 && p.failCount > p.successCount) {
    delete learned.patterns[key];
  }

  saveLearned(learned);
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function routingStats() {
  const learned  = loadLearned();
  const patterns = Object.values(learned.patterns);
  return {
    totalPatterns:    patterns.length,
    totalRoutings:    learned.totalRoutings,
    highConfidence:   patterns.filter(p => p.successCount >= 3).length,
    avgSuccessRate:   patterns.length > 0
      ? Math.round(
          patterns.reduce((acc, p) => acc + p.successCount / Math.max(1, p.successCount + p.failCount), 0)
          / patterns.length * 100,
        )
      : 0,
    lastUpdated: learned.lastUpdated,
  };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const [,, cmd, ...cliArgs] = process.argv;
if (require.main === module) {
  if (cmd === 'route') {
    const task = cliArgs.join(' ');
    if (task) console.log(JSON.stringify(routeTaskWithLearning(task), null, 2));
    else console.log('Usage: router-learning.js route "<task>"');
  } else if (cmd === 'record') {
    const [p, a, s] = cliArgs;
    if (p && a) {
      recordRouting(p, a, s !== 'false');
      console.log('Routing recorded.');
    } else {
      console.log('Usage: router-learning.js record "<prompt>" <agent> [true|false]');
    }
  } else if (cmd === 'stats') {
    console.log(JSON.stringify(routingStats(), null, 2));
  } else {
    console.log('Usage: router-learning.js <route|record|stats>');
  }
}

module.exports = { routeTaskWithLearning, recordRouting, routingStats, promptKey };
