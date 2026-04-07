---
name: "claude-project-doctor"
description: "Vollautonomes Claude-Code-Setup: Security-Harness, Self-Improving Memory, Hook-Pipeline. Nutze diesen Skill bei: Setup-Health-Check, Projekt-Audit, Hooks einrichten, Sicherheit härten, Autonomie verbessern, RuFlo-Integration, CLAUDE.md modernisieren, 'mein Setup optimieren', 'vollautonomes System einrichten', 'sicher machen', 'aufräumen', 'verbessern'."
---

# Claude Project Doctor — Vollautonomes, sicheres & selbstlernendes System

Du richtest ein vollautonomes, sicherheitsgehärtetes und selbstlernendes Claude-Code-System ein.
Antworte immer auf Deutsch.

---

## SYSTEM-ÜBERSICHT

Der Claude Project Doctor ist ein Skill **und** ein globales Hook-System, das jede
Claude-Code-Installation in ein vollständig autonomes, intelligent lernfähiges und
sicherheitsgehärtetes System verwandelt. Es besteht aus fünf Säulen:

1. **Security Harness** — Blockt Angriffe und Fehler bevor sie passieren
2. **Quality Gate** — KI-basierte Nachkontrolle jeder Session (kostengünstig per Haiku)
3. **Self-Improving Memory** — Vierlagiges Gedächtnis das mit jeder Session klüger wird
4. **Intelligence Router** — Lernt automatisch, welche Aufgaben zu welchem Agenten gehören
5. **Doctor Health-Check** — Automatische Diagnose bei jedem Session-Start

---

## HOOK-AUTO-MODUS (läuft bei jedem SessionStart automatisch)

Der `doctor-hook.cjs` (`~/.claude/helpers/doctor-hook.cjs`) ist in der globalen `settings.json`
als letzter `SessionStart`-Hook konfiguriert. Er:

1. Läuft in <3 s still im Hintergrund
2. Gibt `{ "systemMessage": "..." }` aus — Claude sieht die Diagnose direkt beim Start
3. Blockiert nur bei kritischen Sicherheitsproblemen
4. Gibt bei gesundem System nur eine kompakte Info-Zeile aus

**Sechs automatische Health-Checks:**

| # | Check | Kritisch | Warnung |
|---|-------|----------|---------|
| 1 | Memory-Verzeichnis vorhanden & befüllt | — | leer → /reflect empfohlen |
| 2 | Intelligence-Store & Graph | — | fehlt → PageRank startet leer |
| 3 | Router-Learning-Daten | — | noch keine Patterns |
| 4 | Credential-Dateien im CWD-Root | .env, token.json etc. | — |
| 5 | Credential-Dateien im HOME-Root | token.json etc. | — |
| 6 | Hook-Konfiguration vollständig | fehlende Events | — |

**Bonus-Checks:**
- Optionale Security-Tools vorhanden: Semgrep (SAST), Gitleaks (Secret-Scan)
- OWASP Top 10:2025 Skill installiert (`agamm/claude-code-owasp`)
- Unreflektierte Sessions der letzten 72 h

**Installation des Doctor-Hooks in settings.json:**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cmd /q /c node %USERPROFILE%/.claude/helpers/doctor-hook.cjs",
            "timeout": 10000
          }
        ]
      }
    ]
  }
}
```

> **Windows-Hinweis:** `cmd /q /c` (quiet mode) verhindert, dass cmd.exe seinen
> Copyright-Banner ausgibt. Alle Hook-Scripts MÜSSEN stdin synchron leeren:
> `if (!process.stdin.isTTY) try { fs.readFileSync(0, 'utf8'); } catch {}`

---

## SECURITY HARNESS — Fünflagige Verteidigung

### Lage 1: PreToolUse — Blocking-Hook (Bash)

Blockiert gefährliche Shell-Muster **bevor** sie ausgeführt werden:

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "cmd /q /c node %USERPROFILE%/.claude/helpers/hook-handler.cjs pre-bash",
        "timeout": 5000
      }]
    }
  ]
}
```

Geblockte Muster: `rm -rf /`, `format c:`, `del /s /q c:\`, Fork-Bomben (`:(){:|:&};:`)

### Lage 2: PreToolUse — Secret-Detection (Write/Edit)

Scannt Datei-Inhalte **bevor** sie geschrieben werden. Exit 2 → Schreiben geblockt.

```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit|MultiEdit",
      "hooks": [{
        "type": "command",
        "command": "cmd /q /c node %USERPROFILE%/.claude/helpers/hook-handler.cjs pre-edit",
        "timeout": 5000
      }]
    }
  ]
}
```

**Erkannte Secret-Patterns:**
- `api_key = "sk-..."` / `access_token = "ghp_..."` / `AKIAXXXXXXXX` (AWS)
- OpenAI-style Keys: `sk-[A-Za-z0-9]{32,}`
- GitHub PATs: `ghp_[A-Za-z0-9]{36}`
- Hardcoded Passwörter: `password = "plaintext..."`

**Safe-Referenz-Ausnahmen** (werden nicht geblockt):
`process.env.`, `os.environ`, `getenv(`, `secrets.`, `vault.`, `config[`, `dotenv`

### Lage 3: PostToolUse — Dependency-Audit-Trigger

Nach jedem `npm install` / `yarn add` / `pip install` wird automatisch ein
Audit-Trigger gesetzt, den der `dep-audit-hook.cjs` asynchron verarbeitet:

```json
{
  "PostToolUse": [
    {
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "cmd /q /c node %USERPROFILE%/.claude/helpers/hook-handler.cjs post-bash",
        "timeout": 5000
      }]
    }
  ]
}
```

Ausgabe: `[SECURITY] Package install detected — dep-audit-hook will scan for vulnerabilities`

### Lage 4: Stop-Hook — Quality & Security Gate (Haiku, 10× günstiger als Sonnet)

Prüft nach **jeder** Session automatisch per LLM ob:

1. Quell-Code geändert → wurden Tests ausgeführt oder explizit verzichtet?
2. Hardcoded Secrets in den Änderungen sichtbar?
3. SQL-Queries → parametrisiert (kein String-Concat)?
4. Shell-Befehle mit User-Input → `execFile`/Array-Args (kein String-Concat)?

```json
{
  "Stop": [
    {
      "hooks": [
        {
          "type": "prompt",
          "model": "claude-haiku-4-5-20251001",
          "prompt": "Quality & Security Gate: Review this session's transcript. Check ALL: (1) IF source files modified: were tests run/passing, OR did user explicitly waive? (2) IF source files modified: any hardcoded API key, token, password, secret, or credential visible in the changes? (3) IF SQL queries written: parameterized queries used — NOT string concat? (4) IF shell commands constructed with user input: execFile/array args — NOT string concat? BLOCK with {\"decision\":\"block\",\"reason\":\"...\"} if: (a) source files changed without tests and user did not waive, OR (b) hardcoded secrets detected, OR (c) SQL injection risk, OR (d) command injection risk. Otherwise {\"decision\":\"approve\"}.",
          "timeout": 30000
        }
      ]
    }
  ]
}
```

### Lage 5: Anthropic Security-Guidance Plugin (empfohlen)

Das offizielle `security-guidance@claude-plugins-official` Plugin blockiert:
- `eval()`, `innerHTML`, `document.write()` (XSS)
- `pickle.loads()`, `yaml.load()` (Deserialization)
- `os.system()`, `subprocess.call(shell=True)` (Command Injection)
- `child_process.exec()`, `execSync()` mit String-Concatenation

Aktivierung in `settings.json`:
```json
{
  "enabledPlugins": {
    "security-guidance@claude-plugins-official": true
  }
}
```

**Wichtig:** Dieses Plugin ist aggressiv — es kann auch bei Dokumentations-Texten
false-positives liefern. Beim Schreiben von Security-Dokumentation ggf. Phrasing anpassen.

---

## SELF-IMPROVING MEMORY SYSTEM — Vierlagiges Gedächtnis

### Lage 1: CLAUDE.md — Permanente Verhaltensdirektiven

Globale `CLAUDE.md` mit:
- Behavioral Rules (immer erzwungen)
- Security Rules
- Dynamic Project Context via `!` Shell-Befehle:

```markdown
## Dynamic Project Context
!`git log --oneline -5 2>/dev/null || echo "(no git)"`
!`node --version 2>/dev/null && npm --version 2>/dev/null || echo "(no node)"`
!`git branch --show-current 2>/dev/null || echo "(no branch)"`
```

Die `!` Befehle werden bei jedem Session-Start ausgeführt — Claude kennt immer den
aktuellen Git-Stand, Node-Version und Branch.

### Lage 2: Auto Memory (MEMORY.md + memory/)

Persistentes, sitzungsübergreifendes Gedächtnis mit vier Typen:
- `user` — Wer ist der User? (Rolle, Expertise, Präferenzen)
- `feedback` — Was hat funktioniert / nicht funktioniert?
- `project` — Aktuelle Projektziele, Deadlines, Entscheidungen
- `reference` — Wo liegen externe Ressourcen?

Struktur:
```
~/.claude/projects/<PROJECT-KEY>/memory/
  MEMORY.md          # Index (wird bei SessionStart geladen)
  user_role.md       # User-Profil
  feedback_*.md      # Lerneffekte
  project_*.md       # Projekt-Kontext
  reference_*.md     # Externe Ressourcen
```

**Auto-Memory-Bridge** (`auto-memory-hook.mjs`): Importiert beim SessionStart alle
Memory-Dateien in den Backend-Store; synct beim Stop zurück zu MEMORY.md.

### Lage 3: Intelligence Graph (PageRank + Trigram-Jaccard)

`intelligence.cjs` implementiert:
- **PageRank** (Damping 0.85): Bewertet Memory-Einträge nach Nutzungsfrequenz
- **Trigram-Jaccard-Ähnlichkeit**: Findet semantisch ähnliche Einträge ohne Embeddings
- **Automatische Konsolidierung** beim Session-End: neue Einträge → Graph rebuild → PageRank

```bash
# Manuell: Intelligence-Stats anzeigen
node ~/.claude/helpers/hook-handler.cjs stats

# Manuell: Konsolidierung anstoßen
node ~/.claude/helpers/hook-handler.cjs session-end
```

### Lage 4: SQLite + HNSW Pattern-Learning (learning-hooks.sh)

Zwei-Tier-Learning-Pipeline:
- **Tier 1**: SQLite — speichert Code-Strategien, Domain, Qualitätswerte
- **Tier 2**: HNSW — Hochdimensionale Vektorsuche für Pattern-Retrieval

```bash
# Pattern speichern
node ~/.claude/helpers/learning-lifecycle-hook.cjs store "tdd-pattern" code 0.9

# Session-Learning starten
node ~/.claude/helpers/learning-lifecycle-hook.cjs session-start

# Session-Learning beenden + persistieren
node ~/.claude/helpers/learning-lifecycle-hook.cjs session-end
```

---

## INTELLIGENCE ROUTER — Lernendes Task-Routing

Der Router lernt mit jeder Session, welche Prompts zu welchen Agenten gehören.

### Funktionsweise:

1. **UserPromptSubmit-Hook** → `hook-handler.cjs route`
2. Stabiler Key aus Prompt extrahiert (Stopwords entfernt, normalisiert)
3. Gelerntes Pattern? → Confidence-gewichtete Agent-Auswahl
4. Kein Pattern? → Keyword-Fallback-Router
5. Routing-Entscheidung in `~/.claude-flow/data/last-routing.json` gespeichert
6. **SubagentStop-Hook** → `post-task` → Routing-Outcome gelernt

### Routing-Output-Format:

```
+------------------- Primary Recommendation -------------------+
| Agent: coder [gelernt]                                       |
| Confidence: 87.3%                                            |
| Reason: TypeScript pattern match                             |
+--------------------------------------------------------------+
```

### Konfiguration:

```json
{
  "UserPromptSubmit": [{
    "hooks": [{
      "type": "command",
      "command": "cmd /q /c node %USERPROFILE%/.claude/helpers/hook-handler.cjs route",
      "timeout": 10000
    }]
  }],
  "SubagentStop": [{
    "hooks": [{
      "type": "command",
      "command": "cmd /q /c node %USERPROFILE%/.claude/helpers/hook-handler.cjs post-task",
      "timeout": 5000
    }]
  }]
}
```

---

## VOLLSTÄNDIGE HOOK-PIPELINE

| Event | Hook | Zweck |
|-------|------|-------|
| `SessionStart` | `session-restore` | Session-Zustand wiederherstellen |
| `SessionStart` | `auto-memory-hook.mjs import` | Memory-Bridge laden |
| `SessionStart` | `auto-git-pull.cjs` | Skill-Repos auf neuesten Stand |
| `SessionStart` | `doctor-hook.cjs` | Health-Check + Diagnose |
| `SessionStart` | `session-env-hook.cjs` | Projekt-Typ erkennen, Env-Vars setzen |
| `SessionStart` | `learning-lifecycle-hook.cjs session-start` | SQLite+HNSW initialisieren |
| `UserPromptSubmit` | `route` | Optimalen Agenten empfehlen |
| `PreToolUse[Bash]` | `pre-bash` | Gefährliche Befehle blockieren |
| `PreToolUse[Write\|Edit]` | `pre-edit` | Secrets vor dem Schreiben scannen |
| `PostToolUse[Write\|Edit]` | `post-edit` | Edit für Intelligence aufzeichnen |
| `PostToolUse[Write\|Edit]` | `learning-lifecycle-hook.cjs store` | Code-Pattern lernen |
| `PostToolUse[Bash]` | `post-bash` | Package-Installs → Audit-Trigger |
| `SubagentStart` | `status` | Subagent-Status tracken |
| `SubagentStop` | `post-task` | Routing-Outcome lernen |
| `Stop` | `auto-memory-hook.mjs sync` | Memory zu MEMORY.md synchen |
| `Stop` | `auto-reflect-hook.cjs` | Session-Reflexion speichern |
| `Stop` | Quality & Security Gate | Haiku-LLM prüft Tests + Secrets + Injections |
| `SessionEnd` | `session-end` | Intelligence konsolidieren |
| `SessionEnd` | `learning-lifecycle-hook.cjs session-end` | Pattern-Learning persistieren |
| `PreCompact[manual]` | `compact-manual` + `session-end` | Vor Kompaktierung sichern |
| `PreCompact[auto]` | `compact-auto` + `session-end` | Vor Auto-Kompaktierung sichern |

**Windows stdin-Drain-Pflicht:** Jeder Hook-Script MUSS stdin synchron leeren,
sonst echot cmd.exe den Hook-JSON-Kontext als Shell-Befehle:

```javascript
if (!process.stdin.isTTY) try { fs.readFileSync(0, 'utf8'); } catch {}
```

---

## PHASE 0 – SELF-UPDATE-CHECK (immer zuerst)

Bevor du irgendetwas anderes tust: prüfe, ob dieser Skill selbst aktuell ist.

```bash
SKILL_DIR="$HOME/.claude/skills/claude-project-doctor"
git -C "$SKILL_DIR" rev-parse --is-inside-work-tree 2>/dev/null || exit 0
git -C "$SKILL_DIR" fetch --quiet 2>/dev/null || exit 0
BEHIND=$(git -C "$SKILL_DIR" rev-list HEAD..origin/master --count 2>/dev/null)
```

**Wenn `BEHIND` > 0:** Informiere den User kurz und frage nach Zustimmung zum Update.
**Wenn `BEHIND` = 0:** Schweige — direkt weiter mit Phase 1.

---

## PHASE 1 – VOLLSTÄNDIGER AUDIT (immer zuerst, keine Änderungen)

**Führe Phase 1 vollständig durch. Danach NUR Bestandsaufnahme liefern und auf Freigabe warten.**

### Prüfpunkte

**Projektstruktur:**
- Projektwurzelstruktur (Top-Level-Dateien und -Ordner)
- `CLAUDE.md` und `.claude/CLAUDE.md`
- `.claude/settings.json`, `.claude/settings.local.json`
- `.claude/rules/`, `.claude/skills/`, `.claude/commands/`, `.claude/agents/`

**Security-Audit:**
- Credential-Dateien im Projektbaum (`.env`, `token.json`, `*.key`, `credentials.json`)
- Secrets in versionierten Dateien
- Fehlende `.gitignore`-Einträge
- Hook-Events konfiguriert? (SessionStart, Stop, UserPromptSubmit, PostToolUse)
- Security-Tools installiert? (Semgrep, Gitleaks)
- OWASP-Skill installiert?

**Integration & Konfiguration:**
- Hook-bezogene Logik, MCP-Konfigurationen, Plugins
- Security-Guidance-Plugin aktiv?
- Quality-Gate (Stop-Hook mit LLM) konfiguriert?
- Memory-System aufgebaut? (MEMORY.md, memory/)
- Router-Learning-Daten vorhanden?

**Dokumentation & Prozesse:**
- README, Changelog, ADR/Decision-Docs
- Build/Test/Lint-Workflows, Git-Status

### Ausgabeformat

Kurze Zusammenfassung (3-5 Sätze: Gesamteindruck, größte Stärke, größtes Risiko).

**A. Was ist schon gut?**
**B. Was ist veraltet, inkonsistent oder problematisch?**
**C. Was fehlt wirklich? (Security-kritisch zuerst)**
**D. Was sollte NICHT angefasst werden?**
**E. Globale RuFlo-Bausteine die nicht zu duplizieren sind** (nur wenn RuFlo vorhanden)
**F. Empfohlene Option: A, B oder C — mit Begründung**

**→ Warte auf Freigabe durch den User.**

---

## ENTSCHEIDUNGSRAHMEN: OPTION A / B / C

### Option A — Bestand behutsam modernisieren
Wenn: Struktur grundsätzlich tragfähig, nur moderate Inkonsistenzen.

### Option B — Isoliert in Git-Worktree arbeiten
Bevorzuge Option B wenn: Git vorhanden, größere strukturelle Änderungen nötig.

### Option C — Parallele Zielstruktur anlegen
Nur wenn: Bestehende Struktur zu inkonsistent für Option A/B.
- Nie stillschweigend → erst nach Audit begründen
- Bestehende Struktur NICHT zerstören
- Neuer Name: `_workspace_optimized`, `_next`, `_target-structure`

---

## PHASEN 2–12: UMSETZUNG NACH FREIGABE

Für Details zu den Umsetzungsphasen lies: `references/phases.md`

| Phase | Inhalt |
|-------|--------|
| **2** | Nicht-destruktive Modernisierung |
| **2b** | Automatische Installation (RuFlo, Skills, Agents, Hooks) |
| **2c** | Intelligente Skill-Erkennung (online suchen, empfehlen, installieren) |
| **3** | Claude- und RuFlo-Zielstruktur |
| **4** | CLAUDE.md behutsam nachrüsten (inkl. Dynamic Context, Security Rules) |
| **5** | Rules statt Monolith |
| **6** | Skills modern und fokussiert |
| **7** | Agents nur mit klarem Mehrwert |
| **8** | Settings sauber trennen (global vs. projektlokal) |
| **9** | Vollständige Hook-Pipeline einrichten (alle 5 Security-Lagen) |
| **10** | MCP / Plugins / RuFlo-Integration |
| **11** | Git, Backups, Snapshots und Debugging |
| **12** | Qualitätssicherung + Abschlussbericht |

### Phase 2b — Automatische Installation (Detail)

Bei Freigabe installierst du folgende Komponenten:

**Global (einmalig, wirkt für alle Projekte):**
```bash
# RuFlo V3 initialisieren (falls nicht vorhanden)
npx @claude-flow/cli@latest init --wizard

# Doctor-Hook in globale settings.json eintragen
# (prüfe zuerst ob schon vorhanden)

# OWASP Top 10:2025 Skill
claude skills install agamm/claude-code-owasp

# Security-Tools
npm install -g semgrep    # oder brew install semgrep
brew install gitleaks     # oder scoop install gitleaks
```

**Projektlokal (für dieses Projekt):**
```bash
# .gitignore absichern
echo ".env" >> .gitignore
echo "token.json" >> .gitignore
echo "credentials.json" >> .gitignore
echo "*.key" >> .gitignore
```

---

## SCHNELL-SETUP: VOLLSTÄNDIGES SYSTEM IN 5 MINUTEN

Führe diesen Block aus um das komplette System aufzusetzen:

```bash
# 1. RuFlo V3 initialisieren
npx @claude-flow/cli@latest init --wizard

# 2. Daemon starten (Memory-Services)
npx @claude-flow/cli@latest daemon start

# 3. Doctor-Check
npx @claude-flow/cli@latest doctor --fix

# 4. Skill-Datenbank updaten
git -C "$HOME/.claude/skills/claude-project-doctor" pull --ff-only

# 5. OWASP Skill installieren
claude skills install agamm/claude-code-owasp
```

Dann in `settings.json` sicherstellen dass alle Hook-Events konfiguriert sind:
- `SessionStart` (6 Hooks: session-restore, auto-memory, auto-git-pull, doctor, session-env, learning)
- `UserPromptSubmit` (route)
- `PreToolUse[Bash]` (pre-bash)
- `PreToolUse[Write|Edit|MultiEdit]` (pre-edit)
- `PostToolUse[Write|Edit|MultiEdit]` (post-edit, learning-store)
- `PostToolUse[Bash]` (post-bash)
- `Stop` (auto-memory sync, auto-reflect, Quality & Security Gate)
- `SessionEnd` (session-end, learning-end)
- `PreCompact[manual|auto]` (compact handlers)

---

## SECURITY RESEARCH: WARUM DAS WICHTIG IST

Studien zeigen:
- **36.82%** der AI-generierten Skills haben Sicherheitslücken (vs. ~22% bei Menschen)
- AI erzeugt im Schnitt **1.7× mehr Sicherheitsprobleme** als menschlicher Code
- **MIT**: 25% weniger Entwicklungszeit → erhöhte Risikobereitschaft
- **ARC Prize**: KI-Agenten können Sicherheitsgates bypassen ohne korrekte Problemlösung

**ABER:** Mit richtigem Harness übertrifft AI-Code die menschliche Baseline:
- PreToolUse-Blocking verhindert die häufigsten Injektionsmuster zuverlässig
- LLM-basiertes Quality Gate erkennt Secrets/SQL-Injection/Command-Injection
- Automatische Dependency-Audits nach jedem Install

Das ist die Kernaufgabe des Claude Project Doctor: Den "Harness" aufzubauen, der
AI-Code sicherer macht als typischen menschlichen Code.

**Relevante CVEs und Risiken:**
- CVE-2025-59536: Malicious `.claude/settings.json` in geklonten Repos → Hooks vor
  User-Approval ausführen. Gegenmaßnahme: `--dangerously-skip-permissions` NIEMALS
  bei unbekannten Repos verwenden.
- OWASP Top 10 für Agentic Applications 2026: "Least Agency" Prinzip — Agenten
  erhalten nur die minimal nötigen Berechtigungen.

---

## GIT UND BACKUPS — GRUNDPRINZIP

**Git** = primäre Versionskontrolle für Code, CLAUDE.md, Skills, Rules, Docs, ADRs.
**Echte Backups** = zusätzlich für Datenbanken, Binärdateien, Generiertes außerhalb Git.
**Claude-Checkpoints** ersetzen kein Git. Git ersetzt keine Backups.

---

## ABSCHLUSSBERICHT — PFLICHTFORMAT

1. Ist-Zustand vor der Anpassung
2. Was bewusst unverändert blieb
3. Welche Dateien neu angelegt / ergänzt / modernisiert wurden
4. Security-Harness: Welche Lagen aktiv?
5. Memory-System: Welche Lagen aktiv?
6. Hook-Pipeline: Vollständig? Fehlende Events?
7. Welche globalen RuFlo-Bausteine bewusst NICHT dupliziert wurden
8. Gewählte Option (A/B/C) mit Begründung
9. Git, Backups und Recovery: aktueller Stand
10. Empfohlene nächste Schritte (priorisiert nach Security-Kritikalität)
