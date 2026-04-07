# Changelog

## [2.0.0] – 2026-04-08

### Breaking Changes
- Plugin is now a full installer, not just a skill. Run `install.sh` / `install.ps1` to activate.

### Added
- `helpers/` — 14 core hook scripts included in the repo:
  - `doctor-hook.cjs` — health check (6 checks + 3 security checks)
  - `hook-handler.cjs` — central dispatcher (pre-bash, pre-edit, post-bash, post-edit, route, post-task, session-restore/end, stats)
  - `auto-memory-hook.mjs` — Auto Memory Bridge (import on SessionStart, sync on Stop)
  - `auto-reflect-hook.cjs` — session reflection writer (Stop)
  - `auto-git-pull.cjs` — auto `git pull --ff-only` on SessionStart
  - `session-env-hook.cjs` — project type detection + env var injection
  - `learning-lifecycle-hook.cjs` — SQLite+HNSW pattern learning wrapper
  - `learning-hooks.sh` — bash learning pipeline
  - `intelligence.cjs` — PageRank + Trigram-Jaccard memory recall
  - `router.js` — keyword router (fallback)
  - `router-learning.js` — confidence-weighted learning router
  - `session.js` — session state management
  - `memory.js` — memory backend
  - `statusline.cjs` — status line script
- `install.sh` — Unix/macOS/Git Bash installer
- `install.ps1` — Windows PowerShell installer
- `SKILL.md` v2.0 — comprehensive documentation of all 5 security layers, memory system, hook pipeline
- `plugin.json` v2.0 — `install` field with platform-specific commands
- Security Harness: 5-layer defense (PreToolUse blocking, secret detection, dep-audit trigger, Haiku quality gate, OWASP skill)
- Self-Improving Memory System: MEMORY.md + Intelligence Graph + SQLite/HNSW + auto-reflect
- Intelligence Router: learns task→agent routing confidence over time
- Windows stdin-drain fix: all hooks drain stdin synchronously to prevent cmd.exe echo

### Changed
- README rewritten around plugin/installer flow — `install.sh` is the primary install path
- Hooks use `cmd /q /c` (quiet mode) to suppress Windows copyright banner

## [1.1.0] – 2026-03-27

### Added
- Phase 0: self-update check at skill start
- `scripts/auto-git-pull.cjs` — SessionStart hook for automatic `git pull --ff-only`

## [1.0.0] – 2026-03-26

### Added
- Initial release as `claude-project-doctor`
- `SKILL.md` with 12-phase audit process
- `references/phases.md` — detailed implementation instructions
- `references/essential-skills-checklist.md` — 7 categories of essential skills
- `scripts/auto-commit-push.sh` — Stop hook for automatic Git commit+push
- `plugin.json` for Claude Code plugin marketplace
- Cross-platform README (Windows, Mac, Linux)
