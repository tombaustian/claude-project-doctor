# Essenzielle Skill-Kategorien fuer jedes Projekt

Diese Checkliste wird in Phase 2c automatisch gegen den Ist-Zustand des Projekts geprueft.
Fehlende Kategorien werden dem User als Empfehlung vorgelegt.

---

## 1. Security (IMMER pruefen)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| Secret-Scanning | .env, .credentials.json, token.json, *.key im Projektbaum | Rule oder Hook: deny fuer Secret-Dateien |
| .gitignore-Audit | Sensible Dateien nicht in .gitignore | .gitignore ergaenzen |
| Dependency-Check | package-lock.json, requirements.txt vorhanden? | `npm audit` / `pip-audit` empfehlen |
| Credentials-Trennung | Secrets in settings.json oder CLAUDE.md? | In .env oder Vault auslagern |
| OWASP-Basics | Web-Projekt? Input-Validierung, XSS, CSRF | Security-Rule oder -Skill empfehlen |

**Empfohlene Skills/Rules:**
- `.claude/rules/security-and-secrets.md` — Regeln fuer Secret-Handling
- Security-Scanner-Hook (PreToolUse: warnt bei Zugriff auf Secret-Pfade)
- Dependency-Audit als Teil des Build-Workflows

---

## 2. Versionskontrolle & Backup (IMMER pruefen)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| Git vorhanden? | .git/ Verzeichnis | Git initialisieren |
| .gitignore vorhanden? | Datei im Root | Erstellen mit projektspezifischen Eintraegen |
| Remote konfiguriert? | git remote -v | Remote-Setup empfehlen |
| Auto-Push-Hook? | Stop-Hook fuer auto-commit-push | scripts/auto-commit-push.sh installieren |
| Backup-Strategie? | _backup/, SNAPSHOTS/, Doku | Backup-Logik empfehlen |

**Empfohlene Skills/Rules:**
- `.claude/rules/backup-and-recovery.md`
- `scripts/auto-commit-push.sh` (im Skill mitgeliefert)

---

## 3. Dokumentation & Nachvollziehbarkeit (IMMER pruefen)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| CLAUDE.md vorhanden? | Datei im Root oder .claude/ | Erstellen |
| CLAUDE.md aktuell? | Referenzen auf existierende Pfade? | Bereinigen |
| Rules vorhanden? | .claude/rules/ | Mindestens 2-3 Rules empfehlen |
| Debugging-Doku? | docs/debugging/ oder Known Issues | Struktur anlegen |
| Session-Handover? | docs/session-handover/ oder state/ | Handover-Mechanismus empfehlen |
| Changelog? | CHANGELOG.md oder docs/changelog.md | Empfehlen |

**Empfohlene Skills/Rules:**
- `.claude/rules/docs-and-reporting.md`
- `.claude/rules/debugging-discipline.md`

---

## 4. Code-Qualitaet (pruefen wenn Code-Projekt)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| Linting konfiguriert? | .eslintrc, pylint, prettier, etc. | Linter einrichten |
| Formatter konfiguriert? | .prettierrc, black, etc. | Formatter empfehlen |
| Tests vorhanden? | test/, tests/, __tests__/, *.test.* | Test-Framework empfehlen |
| CI/CD Pipeline? | .github/workflows/, Jenkinsfile | Pipeline empfehlen |
| Code-Review-Prozess? | PR-Templates, Review-Rules | Review-Workflow empfehlen |

**Empfohlene Skills/Rules:**
- `.claude/rules/coding-standards.md`
- `.claude/rules/testing-and-validation.md`

---

## 5. Projekt-Organisation (IMMER pruefen)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| Klare Ordnerstruktur? | src/, docs/, config/ etc. | Struktur empfehlen |
| README vorhanden? | README.md | Erstellen oder aktualisieren |
| Lose Dateien im Root? | temp-files, debug-output, etc. | Aufraeumen empfehlen |
| Build-Artefakte getrennt? | dist/, build/, .next/ in .gitignore | .gitignore pruefen |

---

## 6. Claude-Code-Hygiene (IMMER pruefen)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| Settings-Trennung? | settings.json vs settings.local.json | Sauber trennen |
| Keine Secrets in Settings? | API-Keys in settings.json? | In .local oder .env verschieben |
| Skills passen zum Projekt? | Installierte Skills vs Projekttyp | Unpassende deaktivieren, fehlende empfehlen |
| Agents nicht aufgeblaeht? | Zu viele projektlokale Agents? | Reduzieren |
| Hooks funktional? | Hooks referenzieren existierende Scripts? | Defekte Hooks fixen |
| Debug-Dateien unter Kontrolle? | .claude/debug/ Groesse | Rotation empfehlen |
| MCP sauber? | .mcp.json konsistent? | Pruefen und dokumentieren |

---

## 7. Deployment & Release (pruefen wenn relevant)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| Deploy-Prozess dokumentiert? | docs/deploy/ oder DEPLOY.md | Dokumentieren |
| Environment-Variablen dokumentiert? | .env.example | Erstellen |
| Release-Checkliste? | docs/release-checklist.md | Empfehlen |

---

## Wie der Skill diese Checkliste nutzt

In Phase 2c prueft der Skill automatisch:

1. **Alle Kategorien 1-3 und 5-6** werden bei JEDEM Projekt geprueft (projekttyp-unabhaengig)
2. **Kategorie 4** wird nur bei Code-Projekten geprueft (wenn src/, package.json, requirements.txt etc. vorhanden)
3. **Kategorie 7** wird nur geprueft wenn Deployment-Artefakte gefunden werden

Ausgabe im Audit-Bericht (Section F):

```
### Empfohlene Skills/Rules basierend auf Projekt-Analyse

**Fehlend und dringend empfohlen:**
- [ ] .gitignore — Sensible Dateien sind ungeschuetzt
- [ ] rules/security-and-secrets.md — Kein Security-Regelwerk
- [ ] auto-commit-push Hook — Kein automatisches Backup

**Empfohlen fuer diesen Projekttyp (Web-App):**
- [ ] rules/testing-and-validation.md
- [ ] Dependency-Audit-Hook

**Bereits abgedeckt:**
- [x] CLAUDE.md vorhanden
- [x] Settings-Trennung sauber
```
