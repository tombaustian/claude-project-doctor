# Phasen 2–12: Umsetzungsanweisungen

Diese Phasen werden nur nach expliziter Freigabe durch den User durchgeführt.
Die Reihenfolge ist empfohlen, aber flexibel je nach Audit-Ergebnis.

---

## Phase 2 – Nicht-destruktive Modernisierung

### ERLAUBT:
- Fehlende Dateien ergänzen
- Bestehende Dateien behutsam strukturieren
- Neue Regeln, Skills, Agents, Docs oder Scripts ergänzen
- Settings vorsichtig erweitern
- Sichere, risikoarme Hooks ergänzen
- MCP sauber dokumentieren oder ergänzen
- Git sauber initialisieren oder strukturieren, falls nötig
- Backup-/Snapshot-Logik ergänzen
- Dokumentations- und Debugging-Struktur ergänzen
- Projektlokale RuFlo-Ergänzungen anlegen, falls echter Mehrwert besteht
- Bestehende Commands erhalten und nur ergänzend modernisieren

### NICHT ERLAUBT:
- Bestehende Skills löschen
- Bestehende Commands entfernen
- Globale RuFlo-Installation ungefragt umbauen
- Funktionierende Hooks ohne Grund ersetzen
- Vorhandene Workflows ohne Not fundamental umbauen
- Große Umbenennungen ohne zwingenden Grund
- Cleanup auf Kosten von Kompatibilität
- Radikale Reorganisation ohne dokumentierte Begründung
- Sensible Daten in versionierte Dateien schreiben
- Projektlokale Duplikate globaler RuFlo-Bausteine anlegen, wenn der Mehrwert fehlt
- Stillschweigend eine Parallelstruktur anlegen

---

## Phase 2b – Automatische Installation und Konfiguration (nach Freigabe)

Wenn der Audit ergibt, dass RuFlo, Skills, Agents, Commands oder andere Bausteine fehlen, installiere sie nach expliziter User-Freigabe automatisch und konfiguriere sie dauerhaft.

### RuFlo installieren (falls nicht vorhanden)

Wenn kein `.claude-flow/` oder `.mcp.json` mit claude-flow existiert:

```bash
# MCP-Server registrieren
claude mcp add claude-flow -- npx -y @claude-flow/cli@latest mcp start

# Daemon starten und Health-Check
npx @claude-flow/cli@latest daemon start
npx @claude-flow/cli@latest doctor --fix
```

Prüfe anschließend:
- `.mcp.json` vorhanden und korrekt
- `.claude-flow/config.yaml` erzeugt
- Daemon erreichbar

### Skills installieren und dauerhaft aktivieren

Wenn projektrelevante Skills fehlen:

1. **Prüfe, welche Skills global in `~/.claude/skills/` bereits vorhanden sind** — diese nicht duplizieren
2. **Erstelle fehlende projektlokale Skills** in `.claude/skills/` mit korrektem SKILL.md-Frontmatter
3. **Konfiguriere skills dauerhaft** — Skills in `~/.claude/skills/` werden automatisch entdeckt; projektlokale Skills in `.claude/skills/` des Projekts ebenso

### Agents, Commands und Hooks installieren

1. **Agents**: Fehlende projektspezifische Agents in `.claude/agents/` anlegen
2. **Commands**: Fehlende projektspezifische Commands in `.claude/commands/` anlegen
3. **Hooks**: Fehlende Hooks in `settings.json` unter dem entsprechenden Event-Key ergänzen

### Settings dauerhaft konfigurieren

Ergänze `.claude/settings.json` so, dass alle neu installierten Bausteine dauerhaft aktiv sind:

- Plugins aktivieren via `plugins.enabled` Array
- Hooks registrieren via `hooks` Objekt
- Permissions via `permissions.allow` / `permissions.deny`
- MCP-Server via `.mcp.json`

**Wichtig:**
- Frage den User vor jeder größeren Installation explizit nach Freigabe
- Dokumentiere jede Installation im Abschlussbericht
- Erstelle ein Backup der aktuellen settings.json vor Änderungen: `cp .claude/settings.json .claude/settings.json.backup-pre-audit`
- Teste nach der Installation, ob die neuen Bausteine erreichbar sind

---

## Phase 2c – Intelligente Skill-Erkennung und -Installation (nach Freigabe)

Nach dem Audit kennt der Skill den Projekttyp, den Tech-Stack und die bestehenden Skills. Nutze dieses Wissen, um aktiv nach passenden zusätzlichen Skills zu suchen und sie nach User-Freigabe zu installieren.

### Schritt 1: Projekt-Profil erstellen

Analysiere aus dem Audit:
- **Projekttyp**: Web-App, API, CLI-Tool, Datenbank-Projekt, Mobile, etc.
- **Tech-Stack**: React, Node.js, Python, TypeScript, etc.
- **Vorhandene Workflows**: CI/CD, Testing, Deployment, etc.
- **Vorhandene Skills**: Was ist bereits in `~/.claude/skills/` installiert?
- **Erkannte Lücken**: Welche wiederkehrenden Aufgaben haben keinen Skill?

### Schritt 2: Skill-Suche durchführen

Suche aktiv nach passenden Skills aus verschiedenen Quellen:

1. **Lokale Skill-Analyse**: Prüfe, welche der bereits installierten Skills zum Projekt passen aber möglicherweise nicht aktiv genutzt werden
2. **Web-Suche nach Claude Code Skills**: Suche nach `"claude code skill" + <tech-stack>` oder `"SKILL.md" + <projekttyp>` auf GitHub
3. **MCP-Registry**: Nutze `search_mcp_registry` um passende MCP-Server/Connectors zu finden
4. **Community-Skills**: Suche nach Skills in bekannten Claude-Code-Skill-Repositories und Plugin-Marketplaces

### Schritt 3: Empfehlungen zusammenstellen

Erstelle eine priorisierte Liste gefundener Skills:

```
## Empfohlene Skills für dein Projekt

### Hohe Relevanz (direkt zum Tech-Stack passend)
- [Skill-Name]: Warum er zum Projekt passt
- Quelle: GitHub URL / lokale Installation / MCP-Registry

### Mittlere Relevanz (nützlich für Workflow-Verbesserung)
- [Skill-Name]: Warum er hilfreich sein könnte

### Bereits vorhanden, aber ungenutzt
- [Skill-Name]: Ist installiert, passt zum Projekt, wird aber nicht genutzt
```

### Schritt 4: Installation nach Freigabe

Nach User-Freigabe für jeden genehmigten Skill:

```bash
# Für GitHub-basierte Skills:
git clone <skill-repo-url> /tmp/skill-download
cp -r /tmp/skill-download/skill-name ~/.claude/skills/skill-name

# Für MCP-Server:
claude mcp add <server-name> -- <start-command>

# Für lokale Skills (aus dem Projekt oder Templates):
mkdir -p ~/.claude/skills/<skill-name>
# SKILL.md mit Frontmatter schreiben
```

### Wichtige Regeln:

- **Nie ohne Freigabe installieren** — zeige immer erst die Empfehlungsliste
- **Quelle transparent machen** — woher kommt der Skill?
- **Keine Duplikate** — prüfe vorher, ob ein äquivalenter Skill bereits installiert ist
- **Sicherheit beachten** — Skills von unbekannten Quellen nicht blind installieren; auf verdächtige Inhalte prüfen
- **Dokumentiere jede Installation** im Abschlussbericht

---

## Phase 3 – Claude- und RuFlo-Zielstruktur

Bevorzugte Zielstruktur (nur soweit sinnvoll und kompatibel):

```
CLAUDE.md                          # Zentrale Projektanweisung
.claude/
  settings.json                    # Projektweite, commitbare Konfiguration
  settings.local.json              # Lokale, nicht-commitbare Dinge
  rules/                           # Klar getrennte Spezialregeln
  skills/                          # Fokussierte projektbezogene Skills
  agents/                          # Nur wenn echter Mehrwert
  commands/                        # Erhalten und kompatibel
  scripts/                         # Hook-Skripte / Hilfsautomationen
docs/
  decisions/                       # ADRs und Architekturentscheidungen
  debugging/                       # Debugging-Erkenntnisse
  session-handover/                # Session-Handover-Mechanismen
  changelog.md                     # Optional
BACKUPS/ oder SNAPSHOTS/           # Echte Wiederherstellung (optional)
```

RuFlo-Integrationsleitlinien:
- Globale RuFlo-Agents, Skills, Commands und Hooks gelten als vorhanden
- Projektlokal nur ergänzen, wenn das Projekt eigenes Wissen oder eigene Abläufe braucht
- Jede projektlokale RuFlo-/Claude-Datei muss klar markieren:
  1. Nutzt globale Infrastruktur
  2. Ergänzt globale Infrastruktur
  3. Gilt nur für dieses Projekt

---

## Phase 4 – CLAUDE.md behutsam nachrüsten

### Wenn eine CLAUDE.md existiert:
- Verbessere sie behutsam
- Erhalte Tonalität und Projektlogik
- Straffe nur, wenn nötig
- Verschiebe selten benötigte Spezialregeln eher in rules/ oder skills/

### Wenn keine CLAUDE.md existiert:
- Lege eine an

### Inhalt der zentralen CLAUDE.md:
- Projektziel / Projektkontext
- Architektur- und Strukturhinweise
- Wichtige Build-/Test-/Lint-/Dev-Befehle
- Coding-Standards (nur projektspezifische)
- Review-/Validierungsregeln
- Bevorzugte Libraries / Patterns / No-Gos
- Typische Arbeitsweise im Projekt
- Verweise auf rules/, skills/, agents/ und wichtige Doku
- Hinweise auf Git-, Backup- und Snapshot-Logik
- Hinweise auf Debugging- und Dokumentationspflichten
- Klare Abgrenzung: globale RuFlo-Infrastruktur vs. projektlokale Erweiterungen

### Wichtig:
- Kompakt und lesbar – keine Mega-Datei
- Keine langen Tutorials
- Nur Inhalte, die Claude nicht zuverlässig allein aus dem Projekt ableiten kann

---

## Phase 5 – Rules statt Monolith

Wenn sinnvoll, ergänze `.claude/rules/` mit kleinen, klar abgegrenzten Dateien.

Mögliche Rule-Dateien (nur wenn passend):
- `coding-standards.md`
- `testing-and-validation.md`
- `docs-and-reporting.md`
- `security-and-secrets.md`
- `frontend-conventions.md`
- `backend-conventions.md`
- `repo-workflow.md`
- `debugging-discipline.md`
- `release-and-deploy.md`
- `backup-and-recovery.md`
- `global-vs-project-ruflo.md`
- `migration-notes.md`

Regeln für Rules:
- Nur anlegen, wenn sie zum Projekt passen
- Keine Redundanz zur CLAUDE.md
- Keine generischen Floskeln
- Konkret, scoped, umsetzbar

---

## Phase 6 – Skills modern und fokussiert

Regeln:
- Vorhandene `.claude/commands/` NICHT entfernen
- Nur ergänzend moderne Skills anlegen
- Skills klein, fokussiert, klar benannt
- Keine Mega-Skills
- Keine Skills für Standardfähigkeiten, die Claude oder RuFlo global bereits gut abdecken
- Skills nur für wiederkehrende projektbezogene Arbeitsweisen oder feste Prozesse

Mögliche sinnvolle projektlokale Skill-Typen:
- `architecture-audit`
- `safe-refactor`
- `bugfix-workflow`
- `release-check`
- `deploy-prep`
- `docs-update`
- `debugging-session`
- `changelog-update`
- `decision-log-update`
- `artifact-handover`
- `migration-audit`
- `project-rules-check`
- `backup-check`
- `handover-update`

Für jeden neu angelegten Skill:
- Klaren Zweck definieren
- Sagen, wann er genutzt werden soll
- Knapp und präzise bleiben
- Keine Duplikation global installierter RuFlo-Skills

---

## Phase 7 – Agents / Subagents nur mit klarem Mehrwert

Regeln:
- Keine Agent-Inflation
- Keine Duplikation global vorhandener RuFlo-Agents
- Keine Duplikation eingebauter Claude-Fähigkeiten
- Nur enge, klar abgegrenzte Rollen
- Lieber wenige gute als viele unklare

Mögliche projektspezifische Agenten:
- `codebase-auditor`
- `qa-validator`
- `docs-reporter`
- `migration-checker`
- `release-validator`
- `project-architect`
- `integration-checker`

Jeder Agent muss:
- Eine klare Rolle haben
- Eine klare Einsatzbeschreibung haben
- Möglichst enge Verantwortung haben
- Klar dokumentieren, warum ein eigener projektspezifischer Agent nötig ist

---

## Phase 8 – Settings sauber trennen

Ziel:
- Projektweite Dinge in `.claude/settings.json`
- Rein lokale Dinge in `.claude/settings.local.json`
- Keine Secrets in versionierten Dateien
- Keine persönlichen Sonderlocken in Team-Dateien
- Bestehende funktionierende Konfiguration nicht zerstören

Zusätzlich:
- Prüfe, ob das Projekt globale RuFlo-Hooks/Helpers voraussetzt
- Dokumentiere das sauber
- Vermeide unnötige projektspezifische Hook-Neudefinitionen, wenn global bereits sinnvoll gelöst
- Lasse unbekannte, aber funktionierende Dinge unangetastet

---

## Phase 9 – Hooks mit Augenmaß

Ergänze neue Hooks nur dann, wenn sie klar nützlich, risikoarm und projektkompatibel sind.

Geeignete Hook-Ideen:
- Sanfte Validierung vor kritischen Änderungen
- Hinweis auf Tests/Lint nach bestimmten Änderungen
- Schutz vor Zugriff auf klare Secret-Pfade
- Leichte Audit-/Logging-Hinweise bei Settings-Änderungen
- Session-/Handover-Hinweise
- Nicht-blockierende Qualitätschecks
- Snapshot-Auslösung bei Meilensteinen
- Projektbezogene Ergänzungen auf Basis vorhandener globaler RuFlo-Hook-Struktur

Nicht tun:
- Aggressive Automatisierung
- Hooks, die überraschend Dateien umschreiben
- Hooks, die ständig blockieren
- Hooks, die ohne Not Builds oder Tests erzwingen
- Hooks, die das Projekt spürbar ausbremsen
- Hooks mit undokumentierten Seiteneffekten
- Globale RuFlo-Hooks ungefragt ersetzen

---

## Phase 10 – MCP / Plugins / RuFlo-Integration

Regeln:
- Bestehende funktionierende Integrationen nicht ersetzen
- Nur dokumentieren oder behutsam ergänzen
- Konfiguration von Credentials trennen
- Keine sensiblen Daten in versionierte Dateien
- Wiederverwendbares sauber dokumentieren
- Nicht vorschnell pluginisieren

RuFlo-Integrationskern – davon ausgehen, dass global vorhanden:
- Globale RuFlo-Agents, Skills, Commands
- Globale MCP-Einträge
- Globale Hooks und Helper-Skripte
- Globale Runtime / Memory / Daemon-Strukturen

Deshalb prüfen:
- Welche globalen RuFlo-Funktionen das Projekt faktisch schon nutzen kann
- Welche Projektdateien darauf verweisen
- Ob Pfade, Helpers, Hooks und Annahmen sauber dokumentiert sind
- Ob eine projektspezifische RuFlo-Initialisierung nötig oder vermeidbar ist

---

## Phase 11 – Git, Backups, Snapshots und Debugging

Das Projekt soll abbilden:
- Git als primäre Versionshistorie mit sinnvoller `.gitignore`-Logik
- Optional: Branch-/Checkpoint-/Tag-Konventionen
- Debugging-Erkenntnisse und wiederkehrende Probleme
- Session-Handover-Struktur
- Offene Baustellen
- Release-/Deploy-Hinweise
- Echte Backup-/Recovery-Logik
- Snapshot-/Meilenstein-Logik

Wenn Git vorhanden:
- Nutze Git als primäre Entwicklungs- und Versionsbasis
- Ergänze nur Dokumentation und Backup-Mechanismen, die Git nicht ersetzt
- Prüfe, ob ein Worktree für größere Eingriffe geeigneter ist

Wenn Git fehlt:
- Richte möglichst ein sauberes lokales Git-Fundament ein
- Falls Git ausnahmsweise nicht möglich: konservative Fallback-Struktur für Snapshots

### Auto-Commit+Push Hook einrichten (nach Freigabe)

Wenn Git vorhanden ist und ein Remote konfiguriert ist, biete dem User an, einen automatischen Push-Hook einzurichten. Dieser Skill liefert ein fertiges Script mit: `scripts/auto-commit-push.sh`

Installation (nach User-Freigabe):

1. Script ins Projekt kopieren:
   ```bash
   cp <skill-path>/scripts/auto-commit-push.sh .claude/scripts/auto-commit-push.sh
   ```

2. Stop-Hook in `.claude/settings.json` registrieren:
   ```json
   {
     "hooks": {
       "Stop": [
         {
           "type": "command",
           "command": "bash .claude/scripts/auto-commit-push.sh"
         }
       ]
     }
   }
   ```

Das Script:
- Prüft ob Änderungen vorhanden sind (sonst skip)
- Staged alle Änderungen, committed mit Zeitstempel
- Pusht automatisch zum Remote
- Failsafe: Wenn offline, wird der Commit lokal erstellt und beim nächsten Push nachgeholt

**Wichtig:** Nie ohne Freigabe installieren. Der User muss wissen, dass jedes Session-Ende einen Commit+Push auslöst.

Backups sollen berücksichtigen:
- Repo-Backup, Export-/Build-Artefakte, Datenbankdumps, Uploads/Medien
- Lokale Projektzustände, Meilensteine, Wiederanlauf nach Fehlern

---

## Phase 12 – Qualitätssicherung

Prüfe am Ende:

- [ ] Wurde etwas Bestehendes beschädigt?
- [ ] Wurden nur additive oder minimal-invasive Änderungen vorgenommen?
- [ ] Sind alte commands / skills / Einstellungen weiterhin nutzbar?
- [ ] Sind neue Dateien klar, knapp und sinnvoll?
- [ ] Ist die Struktur verständlicher als vorher?
- [ ] Sind sensible Daten sauber getrennt?
- [ ] Gibt es unnötige Dopplungen?
- [ ] Wurde Versions- und Wiederherstellbarkeit verbessert?
- [ ] Wurde die globale RuFlo-Installation respektiert?
- [ ] Wurden projektlokale Ergänzungen nur dort angelegt, wo sie echten Mehrwert haben?
- [ ] Wurde Overengineering vermieden?
