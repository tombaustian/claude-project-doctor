# Changelog

## [Unreleased]

## [1.1.0] – 2026-03-27
### Added
- Phase 0: Self-Update-Check beim Skill-Start — prüft automatisch ob eine neue Version auf GitHub verfügbar ist
- `scripts/auto-git-pull.cjs` — SessionStart-Hook für automatischen `git pull --ff-only`
- Phase 11 in `phases.md` um Auto-Pull-Dokumentation erweitert
- `.gitignore` und `CHANGELOG.md` hinzugefügt

## [1.0.0] – 2026-03-26
### Added
- Initiales Release als `claude-project-doctor` (umbenannt von `project-audit-modernize`)
- `SKILL.md` mit 12-Phasen-Audit-Prozess (Phase 1–12)
- `references/phases.md` — detaillierte Umsetzungsanweisungen
- `references/essential-skills-checklist.md` — 7 Kategorien essenzieller Skills für jedes Projekt
- `scripts/auto-commit-push.sh` — Stop-Hook für automatischen Git-Commit+Push
- `plugin.json` für Claude Code Plugin-Marketplace-Kompatibilität
- `README.md` mit plattformübergreifender Installationsanleitung (Windows, Mac, Linux)
