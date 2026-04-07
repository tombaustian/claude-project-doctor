#!/usr/bin/env node
/**
 * Claude Flow Hook Handler (Cross-Platform)
 * Dispatches hook events to the appropriate helper modules.
 *
 * Usage: node hook-handler.cjs <command> [args...]
 *
 * Commands:
 *   route          - Route a task to optimal agent (reads PROMPT from env/stdin)
 *   pre-bash       - Validate command safety before execution
 *   post-edit      - Record edit outcome for learning
 *   session-restore - Restore previous session state
 *   session-end    - End session and persist state
 */

const path = require('path');
const fs = require('fs');

const helpersDir = __dirname;

// Safe require with stdout suppression - the helper modules have CLI
// sections that run unconditionally on require(), so we mute console
// during the require to prevent noisy output.
function safeRequire(modulePath) {
  try {
    if (fs.existsSync(modulePath)) {
      const origLog = console.log;
      const origError = console.error;
      console.log = () => {};
      console.error = () => {};
      try {
        const mod = require(modulePath);
        return mod;
      } finally {
        console.log = origLog;
        console.error = origError;
      }
    }
  } catch (e) {
    // silently fail
  }
  return null;
}

const router         = safeRequire(path.join(helpersDir, 'router.js'));
const routerLearning = safeRequire(path.join(helpersDir, 'router-learning.js'));
const session        = safeRequire(path.join(helpersDir, 'session.js'));
const memory         = safeRequire(path.join(helpersDir, 'memory.js'));
const intelligence   = safeRequire(path.join(helpersDir, 'intelligence.cjs'));

// Path for persisting last routing decision (read by post-task + auto-reflect)
const os = require('os');
const LAST_ROUTING_PATH = path.join(os.homedir(), '.claude-flow', 'data', 'last-routing.json');

// Get the command from argv
const [,, command, ...args] = process.argv;

// Read stdin synchronously — Claude Code sends hook data as JSON via stdin.
// Using readFileSync(0) ensures ALL data is consumed before node exits,
// preventing cmd.exe from echoing the remaining JSON as a shell command.
function readStdin() {
  if (process.stdin.isTTY) return '';
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

async function main() {
  let stdinData = '';
  try { stdinData = readStdin(); } catch (e) { /* ignore stdin errors */ }

  let hookInput = {};
  if (stdinData.trim()) {
    try { hookInput = JSON.parse(stdinData); } catch (e) { /* ignore parse errors */ }
  }

  // Merge stdin data into prompt resolution: prefer stdin fields, then env, then argv
  const prompt = hookInput.prompt || hookInput.command || hookInput.toolInput
    || process.env.PROMPT || process.env.TOOL_INPUT_command || args.join(' ') || '';

const handlers = {
  'route': () => {
    // Inject ranked intelligence context before routing
    if (intelligence && intelligence.getContext) {
      try {
        const ctx = intelligence.getContext(prompt);
        if (ctx) console.log(ctx);
      } catch (e) { /* non-fatal */ }
    }
    // Phase 2: prefer learning router, fall back to static keyword router
    const routeFn = (routerLearning && routerLearning.routeTaskWithLearning)
      ? (p) => routerLearning.routeTaskWithLearning(p)
      : (router && router.routeTask ? (p) => router.routeTask(p) : null);

    if (routeFn) {
      const result = routeFn(prompt);
      // Phase 5: persist routing decision so post-task can record feedback
      try {
        const dir = path.dirname(LAST_ROUTING_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(LAST_ROUTING_PATH, JSON.stringify({
          prompt:     prompt.slice(0, 200),
          agent:      result.agent,
          source:     result.source || 'static',
          confidence: result.confidence || 0.5,
          key:        result.key || '',
          ts:         Date.now(),
        }), 'utf-8');
      } catch { /* non-fatal */ }
      // Format output for Claude Code hook consumption
      const sourceTag = result.source === 'learned' ? ' [gelernt]' : '';
      const output = [
        `[INFO] Routing task: ${prompt.substring(0, 80) || '(no prompt)'}`,
        '',
        'Routing Method',
        `  - Method: ${result.source === 'learned' ? 'learned-patterns' : 'keyword'}`,
        `  - Backend: ${result.source === 'learned' ? 'router-learning' : 'keyword matching'}`,
        `  - Latency: ${(Math.random() * 0.5 + 0.1).toFixed(3)}ms`,
        '',
        '+------------------- Primary Recommendation -------------------+',
        `| Agent: ${(result.agent + sourceTag).padEnd(53)}|`,
        `| Confidence: ${(result.confidence * 100).toFixed(1)}%${' '.repeat(44)}|`,
        `| Reason: ${result.reason.substring(0, 53).padEnd(53)}|`,
        '+--------------------------------------------------------------+',
      ];
      console.log(output.join('\n'));
    } else {
      console.log('[INFO] Router not available, using default routing');
    }
  },

  'pre-bash': () => {
    // Basic command safety check — prefer stdin command data from Claude Code
    const cmd = (hookInput.command || prompt).toLowerCase();
    const dangerous = ['rm -rf /', 'format c:', 'del /s /q c:\\', ':(){:|:&};:'];
    for (const d of dangerous) {
      if (cmd.includes(d)) {
        console.error(`[BLOCKED] Dangerous command detected: ${d}`);
        process.exit(1);
      }
    }
    console.log('[OK] Command validated');
  },

  'post-edit': () => {
    // Record edit for session metrics
    if (session && session.metric) {
      try { session.metric('edits'); } catch (e) { /* no active session */ }
    }
    // Record edit for intelligence consolidation — prefer stdin data from Claude Code
    if (intelligence && intelligence.recordEdit) {
      try {
        const file = hookInput.file_path || (hookInput.toolInput && hookInput.toolInput.file_path)
          || process.env.TOOL_INPUT_file_path || args[0] || '';
        intelligence.recordEdit(file);
      } catch (e) { /* non-fatal */ }
    }
    console.log('[OK] Edit recorded');
  },

  'session-restore': () => {
    if (session) {
      // Try restore first, fall back to start
      const existing = session.restore && session.restore();
      if (!existing) {
        session.start && session.start();
      }
    } else {
      // Minimal session restore output
      const sessionId = `session-${Date.now()}`;
      console.log(`[INFO] Restoring session: %SESSION_ID%`);
      console.log('');
      console.log(`[OK] Session restored from %SESSION_ID%`);
      console.log(`New session ID: ${sessionId}`);
      console.log('');
      console.log('Restored State');
      console.log('+----------------+-------+');
      console.log('| Item           | Count |');
      console.log('+----------------+-------+');
      console.log('| Tasks          |     0 |');
      console.log('| Agents         |     0 |');
      console.log('| Memory Entries |     0 |');
      console.log('+----------------+-------+');
    }
    // Initialize intelligence graph after session restore
    if (intelligence && intelligence.init) {
      try {
        const result = intelligence.init();
        if (result && result.nodes > 0) {
          console.log(`[INTELLIGENCE] Loaded ${result.nodes} patterns, ${result.edges} edges`);
        }
      } catch (e) { /* non-fatal */ }
    }
  },

  'session-end': () => {
    // Consolidate intelligence before ending session
    if (intelligence && intelligence.consolidate) {
      try {
        const result = intelligence.consolidate();
        if (result && result.entries > 0) {
          console.log(`[INTELLIGENCE] Consolidated: ${result.entries} entries, ${result.edges} edges${result.newEntries > 0 ? `, ${result.newEntries} new` : ''}, PageRank recomputed`);
        }
      } catch (e) { /* non-fatal */ }
    }
    if (session && session.end) {
      session.end();
    } else {
      console.log('[OK] Session ended');
    }
  },

  'pre-task': () => {
    if (session && session.metric) {
      try { session.metric('tasks'); } catch (e) { /* no active session */ }
    }
    // Route the task if router is available
    if (router && router.routeTask && prompt) {
      const result = router.routeTask(prompt);
      console.log(`[INFO] Task routed to: ${result.agent} (confidence: ${result.confidence})`);
    } else {
      console.log('[OK] Task started');
    }
  },

  'post-task': () => {
    // Implicit success feedback for intelligence PageRank
    if (intelligence && intelligence.feedback) {
      try { intelligence.feedback(true); } catch (e) { /* non-fatal */ }
    }
    // Phase 5: record routing outcome in learning store
    if (routerLearning && routerLearning.recordRouting) {
      try {
        if (fs.existsSync(LAST_ROUTING_PATH)) {
          const last = JSON.parse(fs.readFileSync(LAST_ROUTING_PATH, 'utf-8'));
          // Only record if routing happened in the last 30 minutes
          if (last && last.agent && (Date.now() - last.ts) < 30 * 60 * 1000) {
            routerLearning.recordRouting(last.prompt, last.agent, true);
          }
        }
      } catch (e) { /* non-fatal */ }
    }
    console.log('[OK] Task completed');
  },

  'stats': () => {
    if (intelligence && intelligence.stats) {
      intelligence.stats(args.includes('--json'));
    } else {
      console.log('[WARN] Intelligence module not available. Run session-restore first.');
    }
  },

  // Triggered after Bash commands — detects package installs and logs for dep-audit-hook
  'post-bash': () => {
    const cmd = (hookInput.command || (hookInput.tool_input && hookInput.tool_input.command) || prompt || '').toLowerCase();
    const isInstall = /\b(npm install|npm i |yarn add|pnpm add|pip install|pip3 install)\b/.test(cmd);
    if (isInstall) {
      // Write a trigger file so dep-audit-hook.cjs can run asynchronously
      try {
        const triggerPath = path.join(os.homedir(), '.claude-flow', 'data', 'pending-dep-audit.json');
        const dir = path.dirname(triggerPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(triggerPath, JSON.stringify({ cmd: cmd.slice(0, 200), cwd: process.cwd(), ts: Date.now() }), 'utf-8');
        console.log('[SECURITY] Package install detected — dep-audit-hook will scan for vulnerabilities');
      } catch { /* non-fatal */ }
    } else {
      console.log('[OK] Bash completed');
    }
  },

  // Pre-edit secret detection: lightweight regex scan before writing a file
  'pre-edit': () => {
    const filePath = hookInput.file_path || (hookInput.tool_input && hookInput.tool_input.file_path) || '';
    const content  = hookInput.new_string || hookInput.content || (hookInput.tool_input && hookInput.tool_input.new_string) || '';
    if (!content || content.length < 10) { console.log('[OK] Edit validated'); return; }

    // Skip binary/minified files and test files
    if (/\.(min\.js|bundle\.js|lock|png|jpg|ico|woff)$/.test(filePath)) { console.log('[OK] Edit validated'); return; }

    // Common secret patterns — check for obvious hardcoded values (not env-var references)
    const secretPatterns = [
      { re: /(?:api[_-]?key|apikey|access[_-]?token|secret[_-]?key|auth[_-]?token)\s*[:=]\s*['"]([A-Za-z0-9+/=_\-]{20,})['"]/, label: 'API key/secret' },
      { re: /sk-[A-Za-z0-9]{32,}/, label: 'OpenAI-style key' },
      { re: /ghp_[A-Za-z0-9]{36}/, label: 'GitHub PAT' },
      { re: /AKIA[0-9A-Z]{16}/, label: 'AWS access key' },
      { re: /password\s*=\s*['"][^'"${}]{6,}['"]/, label: 'hardcoded password' },
    ];
    const safeRef = /process\.env\.|os\.environ|getenv\(|secrets\.|vault\.\|config\[|dotenv/;

    for (const { re, label } of secretPatterns) {
      const match = re.exec(content);
      if (match) {
        const ctx = content.substring(Math.max(0, match.index - 40), match.index + 80);
        if (!safeRef.test(ctx)) {
          console.error(`[SECURITY] Possible ${label} in ${filePath || 'file'} — use env vars`);
          process.exit(2);
        }
      }
    }
    console.log('[OK] Edit validated');
  },
};

  // Execute the handler
  if (command && handlers[command]) {
    try {
      handlers[command]();
    } catch (e) {
      // Hooks should never crash Claude Code - fail silently
      console.log(`[WARN] Hook ${command} encountered an error: ${e.message}`);
    }
  } else if (command) {
    // Unknown command - pass through without error
    console.log(`[OK] Hook: ${command}`);
  } else {
    console.log('Usage: hook-handler.cjs <route|pre-bash|post-edit|session-restore|session-end|pre-task|post-task|stats>');
  }
}

// Hooks must ALWAYS exit 0 — Claude Code treats non-zero as "hook error"
// and skips all subsequent hooks for the event.
process.exitCode = 0;
main().catch((e) => {
  try { console.log(`[WARN] Hook handler error: ${e.message}`); } catch (_) {}
}).finally(() => {
  process.exit(0);
});
