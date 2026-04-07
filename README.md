# Claude Project Doctor

Turns any Claude Code installation into a **fully autonomous, security-hardened, and self-improving system** — with one install command.

## What it installs

**Security Harness (5 layers):**
- `PreToolUse[Bash]` — blocks dangerous shell commands before execution
- `PreToolUse[Write|Edit]` — scans for hardcoded secrets before writing files
- `PostToolUse[Bash]` — detects package installs, triggers dependency audit
- `Stop` Quality Gate — Haiku LLM checks every session for secrets, SQL injection, command injection, missing tests
- Anthropic `security-guidance` plugin (recommended separately)

**Self-Improving Memory:**
- Auto Memory Bridge — imports/syncs `MEMORY.md` on every session
- Intelligence Graph — PageRank + Trigram-Jaccard recall, consolidates on session end
- SQLite + HNSW pattern learning — learns which agent to route each task to
- `auto-reflect` — writes session reflection on Stop

**Full Hook Pipeline:** SessionStart → UserPromptSubmit → PreToolUse → PostToolUse → Stop → SessionEnd → PreCompact

## Install

### One command (recommended)

**macOS / Linux / Git Bash:**
```bash
git clone https://github.com/tombaustian/claude-project-doctor.git \
  ~/.claude/skills/claude-project-doctor && \
  bash ~/.claude/skills/claude-project-doctor/install.sh
```

**Windows PowerShell:**
```powershell
git clone https://github.com/tombaustian/claude-project-doctor.git `
  "$env:USERPROFILE\.claude\skills\claude-project-doctor"
pwsh "$env:USERPROFILE\.claude\skills\claude-project-doctor\install.ps1"
```

The install script:
1. Copies all helper scripts to `~/.claude/helpers/`
2. Writes the complete hook pipeline into `~/.claude/settings.json`
3. Backs up your existing `settings.json` before touching it

Restart Claude Code after installing to activate the hooks.

### Claude Code plugin command

```bash
claude plugin add --from github:tombaustian/claude-project-doctor
```

> Note: This installs the skill only. Run `install.sh` / `install.ps1` afterwards to also install the hooks.

### Optional: security tools

```bash
# SAST scanner (catches vulnerable code patterns)
npm install -g semgrep

# Secret scanner (scans git history for leaked credentials)
brew install gitleaks          # macOS
scoop install gitleaks         # Windows

# OWASP Top 10:2025 skill
claude skills install agamm/claude-code-owasp
```

## Usage

After installing, the doctor checks your system automatically at every session start. You'll see a status line like:

```
[Doctor] OK — Memory: 12 Einträge | Intelligence: 47 Patterns + Graph ✓ | Hooks: 9 Events konfiguriert
```

To run a full project audit, say any of:

- `"Project Doctor"` / `"Doctor"` / `"Audit my project"`
- `"Check my Claude setup"` / `"Is my setup good?"`
- `"Prüf mein Setup"` / `"Optimiere mein Claude-Setup"`

Or invoke directly:
```
/claude-project-doctor
```

## What the audit covers

1. **Phase 0** — Checks if this plugin has updates on GitHub
2. **Phase 1** — Full audit (structure, security, hooks, memory, integrations) — reports first, no changes
3. **You choose** — Option A (in-place fix), B (Git worktree), or C (parallel rebuild)
4. **Phases 2–12** — Conservative improvements after your approval

## Requirements

- Claude Code (Desktop App or CLI)
- Node.js ≥ 18
- Git

## License

MIT
