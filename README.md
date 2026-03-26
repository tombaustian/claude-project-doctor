# Claude Project Doctor

Audits and conservatively modernizes any Claude Code project — structure, CLAUDE.md, settings, hooks, skills, rules, Git, backups, security, and integrations.

## What it does

- **Full Audit**: Scans your project structure, CLAUDE.md, settings, hooks, skills, rules, Git, backups, security, and integrations
- **Conservative Improvements**: Only reversible, minimal-invasive changes — nothing breaks
- **Auto-Backup**: Sets up Git auto-commit+push hooks so your work is always backed up
- **Essential Skills Checklist**: Checks 7 categories every project needs (security, Git/backup, docs, code quality, organization, Claude hygiene, deployment)
- **Smart Skill Discovery**: Searches online for skills that fit your project and recommends them
- **3 Upgrade Paths**: In-place fix (A), Git worktree (B), or parallel rebuild (C) — you choose

## Install

### Option 1: Git Clone (recommended)

Works on **Windows, Mac, and Linux**:

```bash
cd ~/.claude/skills/
git clone https://github.com/tombaustian/claude-project-doctor.git
```

On Windows, `~` means your user folder (`C:\Users\YourName`). If the `.claude/skills/` folder doesn't exist yet, create it first.

### Option 2: Download ZIP

1. Go to [github.com/tombaustian/claude-project-doctor](https://github.com/tombaustian/claude-project-doctor)
2. Click the green **"Code"** button, then **"Download ZIP"**
3. Extract the ZIP contents to your skills folder:

| Platform | Path |
|----------|------|
| **Windows** | `C:\Users\YourName\.claude\skills\claude-project-doctor\` |
| **Mac** | `~/.claude/skills/claude-project-doctor/` |
| **Linux** | `~/.claude/skills/claude-project-doctor/` |

4. Restart Claude Code

### Option 3: Claude Code CLI (if you have it)

If you have the CLI version installed (`npm install -g @anthropic-ai/claude-code`):

```bash
claude plugin add --from github:tombaustian/claude-project-doctor
```

### Verify installation

After installing, the skill should appear in Claude Code's skill list. You can check by typing `/claude-project-doctor` — if it autocompletes, you're good.

## Usage

Just say any of these in Claude Code:

- "Project Doctor"
- "Audit my project"
- "Check my Claude setup"
- "Is my setup good?"
- "Clean up my project"
- "Prüf mein Projekt" (German)

Or use the slash command:

```
/claude-project-doctor
```

## How it works

1. **Audit** — Scans your project and reports what's good, outdated, missing, and what should stay untouched
2. **Recommend** — Suggests Option A (in-place fix), B (worktree), or C (parallel rebuild)
3. **You approve** — Nothing changes without your OK
4. **Improve** — Adds missing files, fixes inconsistencies, sets up Git/backups, recommends skills
5. **Report** — Documents everything that changed and why

## Key principles

- Conservative and reversible — existing structures take priority
- Never breaks what works
- Minimal-invasive improvements only
- Documents every decision
- Respects global claude-flow/RuFlo installations
- Asks before making changes

## Requirements

- Claude Code (Desktop App or CLI)
- Any project directory

## License

MIT
