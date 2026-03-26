# Claude Project Doctor

Audits and conservatively modernizes any Claude Code project.

## What it does

- **Phase 1**: Full audit of your project structure, CLAUDE.md, settings, hooks, skills, rules, Git, backups, security, and integrations
- **Phase 2**: Conservative, reversible improvements based on audit findings
- **Auto-backup**: Sets up Git auto-commit+push hooks
- **Essential Skills Checklist**: Checks 7 categories every project needs (security, Git, docs, code quality, organization, Claude hygiene, deployment)
- **Smart Skill Discovery**: Searches for and recommends skills that fit your project
- **3 upgrade paths**: In-place fix (A), Git worktree (B), or parallel rebuild (C)

## Install

### As a Claude Code Plugin (recommended)

```bash
claude plugin add --from github:tombaustian/claude-project-doctor
```

### Manual install

Copy to your global skills directory:

```bash
# Mac/Linux
cp -r claude-project-doctor ~/.claude/skills/

# Windows
xcopy /E claude-project-doctor %USERPROFILE%\.claude\skills\claude-project-doctor\
```

## Usage

Just say any of these in Claude Code:

- "Project Doctor"
- "Audit my project"
- "Check my Claude setup"
- "Is my setup good?"
- "Clean up my project"

Or use the slash command:

```
/claude-project-doctor
```

## How it works

1. **Audit** — Scans your project and reports what's good, outdated, missing, and what should stay untouched
2. **Recommend** — Suggests Option A (in-place fix), B (worktree), or C (parallel rebuild)
3. **You approve** — Nothing changes without your OK
4. **Improve** — Adds missing files, fixes inconsistencies, sets up Git/backups
5. **Report** — Documents everything that changed and why

## Key principles

- Conservative and reversible
- Existing structures take priority
- Never breaks what works
- Minimal-invasive improvements only
- Documents every decision
- Respects global RuFlo/claude-flow installations

## License

MIT
