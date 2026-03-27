# claude-project-doctor – Entwicklungsprojekt

## Was ist das?

Ein Claude Code Skill, der bestehende Claude-Code-Projekte konservativ auditiert und auf Best-Practice-Stand bringt. Nutzer rufen ihn mit `/claude-project-doctor` oder natürlicher Sprache ("Audit mein Projekt") auf.

## Dateistruktur

```
SKILL.md                          # Haupt-Skill-Definition (Frontmatter + Phase 1 + Entscheidungsrahmen)
plugin.json                       # Skill-Metadaten, Version
README.md                         # Öffentliche Doku für GitHub / Nutzer
CHANGELOG.md                      # Versionshistorie (Keep-a-Changelog Format)
references/
  phases.md                       # Detaillierte Anweisungen für Phasen 2–12
  essential-skills-checklist.md   # 7-Kategorien-Checkliste für Phase 2c
scripts/
  auto-commit-push.sh             # Stop-Hook-Script für Auto-Commit+Push
```

## Entwicklungsworkflow

1. Änderungen hier im Repo-Verzeichnis vornehmen
2. Sync zum installierten Skill: `bash scripts/sync-to-skills.sh`
3. Skill in einem Test-Projekt mit `/claude-project-doctor` testen
4. Commit und Push: `git add . && git commit -m "..." && git push`

## Konventionen

- Sprache der Skill-Inhalte: Deutsch (Nutzer-Instruktionen), da primäre Zielgruppe deutschsprachig
- Jede Phase muss begründbar, minimal-invasiv und reversibel sein
- Keine Breaking Changes ohne Major-Version-Bump in `plugin.json`
- Vor jedem Release: `CHANGELOG.md` aktualisieren

## Installierter Skill-Pfad

```
C:\Users\tb\.claude\skills\claude-project-doctor-master\
```

Das Sync-Script (`scripts/sync-to-skills.sh`) hält diesen Pfad aktuell.

## Repo

https://github.com/tombaustian/claude-project-doctor
