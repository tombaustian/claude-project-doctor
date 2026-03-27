# Essenzielle Skill-Kategorien & Skill-Datenbank

Diese Datei hat zwei Teile:
- **Teil 1**: Projekt-Audit-Checkliste (wird in Phase 2c automatisch geprueft)
- **Teil 2**: Skill-Datenbank (konkrete Empfehlungen nach Projekttyp)

---

# TEIL 1: PROJEKT-AUDIT-CHECKLISTE

## 1. Security (IMMER pruefen)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| Secret-Scanning | .env, .credentials.json, token.json, *.key | Rule oder Hook: deny fuer Secret-Dateien |
| .gitignore-Audit | Sensible Dateien nicht in .gitignore | .gitignore ergaenzen |
| Dependency-Check | package-lock.json, requirements.txt vorhanden? | `npm audit` / `pip-audit` empfehlen |
| Credentials-Trennung | Secrets in settings.json oder CLAUDE.md? | In .env oder Vault auslagern |
| OWASP-Basics | Web-Projekt? Input-Validierung, XSS, CSRF | Security-Rule oder -Skill empfehlen |

**Empfohlene Skills:** `trailofbits/skills` (static-analysis, insecure-defaults, sharp-edges), `.claude/rules/security-and-secrets.md`, PreToolUse-Hook (blockiert rm -rf, secret-Zugriff)

---

## 2. Versionskontrolle & Backup (IMMER pruefen)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| Git vorhanden? | .git/ Verzeichnis | Git initialisieren |
| .gitignore vorhanden? | Datei im Root | Erstellen |
| Remote konfiguriert? | git remote -v | Remote-Setup empfehlen |
| Auto-Push-Hook? | Stop-Hook fuer auto-commit-push | scripts/auto-commit-push.sh installieren |
| SessionStart-Pull? | Holt lokaler Stand immer aktuellsten Remote? | scripts/auto-git-pull.cjs installieren |

**Empfohlene Skills:** `.claude/rules/backup-and-recovery.md`, `scripts/auto-commit-push.sh` (im Skill mitgeliefert)

---

## 3. Dokumentation & Nachvollziehbarkeit (IMMER pruefen)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| CLAUDE.md vorhanden? | Datei im Root oder .claude/ | Erstellen |
| CLAUDE.md aktuell? | Referenzen auf existierende Pfade? | Bereinigen |
| Rules vorhanden? | .claude/rules/ | Mindestens 2-3 Rules empfehlen |
| Debugging-Doku? | docs/debugging/ oder Known Issues | Struktur anlegen |
| Changelog? | CHANGELOG.md | Empfehlen |

**CLAUDE.md Templates:** `github.com/abhishekray07/claude-md-templates` (Next.js, Python/FastAPI, generisch). Kernregel: unter 80 Zeilen halten.

---

## 4. Code-Qualitaet (pruefen wenn Code-Projekt)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| Linting konfiguriert? | .eslintrc, pylint, prettier, etc. | Linter einrichten |
| Tests vorhanden? | test/, tests/, __tests__/, *.test.* | Test-Framework empfehlen |
| CI/CD Pipeline? | .github/workflows/ | Pipeline empfehlen |

**Empfohlene Skills:** `obra/superpowers` (TDD, systematic-debugging, verification-before-completion)

---

## 5. Projekt-Organisation (IMMER pruefen)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| Klare Ordnerstruktur? | src/, docs/, config/ etc. | Struktur empfehlen |
| README vorhanden? | README.md | Erstellen oder aktualisieren |
| Lose Dateien im Root? | temp-files, debug-output, etc. | Aufraeumen empfehlen |

---

## 6. Claude-Code-Hygiene (IMMER pruefen)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| Settings-Trennung? | settings.json vs settings.local.json | Sauber trennen |
| Keine Secrets in Settings? | API-Keys in settings.json? | In .env auslagern |
| Skills passen zum Projekt? | Installierte Skills vs Projekttyp | Fehlende empfehlen |
| Hooks funktional? | Hooks referenzieren existierende Scripts? | Defekte Hooks fixen |
| MCP sauber? | .mcp.json konsistent? | Pruefen und dokumentieren |

---

## 7. Deployment & Release (pruefen wenn relevant)

| Pruefpunkt | Was gesucht wird | Empfohlene Aktion |
|------------|------------------|-------------------|
| Deploy-Prozess dokumentiert? | docs/deploy/ oder DEPLOY.md | Dokumentieren |
| Environment-Variablen dokumentiert? | .env.example | Erstellen |

---

# TEIL 2: SKILL-DATENBANK

## A. Offizielle Anthropic Skills

Quelle: `github.com/anthropics/skills` — Qualitaetsgesichert, breit eingesetzt.

| Skill | Funktion | Wann empfehlen |
|-------|----------|----------------|
| `frontend-design` | Designsystem fuer React/Tailwind, verhindert generische Aesthetik | Jedes Web-Frontend-Projekt |
| `simplify` | 3 parallele Review-Agenten, refaktorisiert Duplikate/Ineffizienzen | Nach groesseren Aenderungen |
| `batch` | Zerlegt Grossprojekte in isolierte Tasks, spawnt Agents in Worktrees | Framework-Migrationen, Massenrefaktoring |
| `mcp-builder` | Erstellt eigene MCP-Server fuer API-Integration | Wenn neue Tool-Integration noetig |
| `webapp-testing` | End-to-End-Tests via Playwright | Web-Apps mit UI |
| `pdf`, `docx`, `xlsx`, `pptx` | Office-Dokumente lesen/erzeugen | Dokumenten-Workflows |
| `skill-creator` | Neue Skills interaktiv erstellen | Wenn projektspezifische Skills noetig |
| `claude-api` | Vollstaendige Claude-API-Referenz im Kontext | Claude-API-Projekte |

Installation: Skills-Verzeichnis `~/.claude/skills/` — global oder projektlokal.

---

## B. Community Skill-Sammlungen (Awesome Lists)

| Repository | Inhalt | URL |
|-----------|--------|-----|
| `hesreallyhim/awesome-claude-code` | **Zentrale Referenz**: 100+ Skills, Hooks, Commands, Orchestratoren | github.com/hesreallyhim/awesome-claude-code |
| `travisvn/awesome-claude-skills` | Skills mit Bewertungsschema | github.com/travisvn/awesome-claude-skills |
| `rohitg00/awesome-claude-code-toolkit` | 135 Agents, 35 Skills, 42 Commands, 150+ Plugins, 19 Hooks | github.com/rohitg00/awesome-claude-code-toolkit |
| `VoltAgent/awesome-agent-skills` | 1000+ Skills, kompatibel mit Codex, Gemini CLI, Cursor | github.com/VoltAgent/awesome-agent-skills |
| `anthropics/claude-plugins-official` | Offizielles Plugin-Verzeichnis (15k+ Sterne) | github.com/anthropics/claude-plugins-official |

---

## C. Erstklassige Einzel-Skill-Sammlungen

### obra/superpowers — Kompletter Entwicklungs-Workflow
`github.com/obra/superpowers` — Meistempfohlene Community-Sammlung, erzwingt professionelle Standards.

| Skill | Funktion |
|-------|----------|
| `test-driven-development` | RED-GREEN-REFACTOR vor jeder Implementierung |
| `systematic-debugging` | 4-Phasen Root-Cause-Analyse |
| `verification-before-completion` | Prueft ob Fix das eigentliche Problem loest |
| `writing-plans` | Zerlegt Designs in 2-5-Minuten-Tasks |
| `executing-plans` | Batch-Ausfuehrung mit Checkpoints |
| `dispatching-parallel-agents` | Koordiniert parallele Subagenten |
| `subagent-driven-development` | Zweistufiger Review: Spec + Code-Qualitaet |
| `using-git-worktrees` | Isolierte Dev-Branches fuer Experimente |

### Trail of Bits Security Skills — Professionelle Security-Audits
`github.com/trailofbits/skills` — Von renommierter Security-Firma, ersetzt teure manuelle Reviews.

| Skill | Was es prueft |
|-------|--------------|
| `static-analysis` | CodeQL, Semgrep, SARIF-Parsing |
| `insecure-defaults` | Unsichere Configs, eingebettete Secrets |
| `sharp-edges` | Fehleranfaellige APIs und Design-Patterns |
| `differential-review` | Security-Analyse von Code-Diffs |
| `agentic-actions-auditor` | GitHub Actions auf AI-Agent-Sicherheit |
| `supply-chain-risk-auditor` | Dependency-Bedrohungslandschaft |

### Expo Official Skills
`github.com/expo/skills` — Offizielles Expo-Team, bringt Framework-Wissen in Claude. Fuer React Native Projekte.

### shadcn/ui Skills
`ui.shadcn.com/docs/skills` — Pattern-Enforcement fuer shadcn/ui. Fuer Projekte mit shadcn/Tailwind.

---

## D. Content & Creative Pipeline Skills

### KODA Creative Stack — timkoda_ (@timkoda_)
`github.com/timkoda/koda-stack` — 10 Creative Agents, vollstaendige Content-Pipeline.

```bash
git clone https://github.com/timkoda/koda-stack.git ~/.claude/skills/koda-stack
```

| Agent | Rolle | Funktion |
|-------|-------|----------|
| `/brief` | The Planner | Idee → strukturiertes Creative Brief |
| `/trends` | The Scout | Trending-Topics in Nische identifizieren |
| `/concept` | The Creative Director | 3 kreative Konzepte aus Brief |
| `/script` | The Scriptwriter | Packende Video-Skripte |
| `/art-direction` | The Art Director | Palette, Mood, Licht |
| `/storyboard` | The Storyboarder | Shots mit Timing |
| `/generate` | The Producer | KI-Bilder (fal.ai, Midjourney) |
| `/assemble` | The Editor | Shots + Voiceover → fertige Reels |
| `/publish` | The Social Manager | Captions, Hashtags, Distribution |
| `/repurpose` | The Content Multiplier | Threads, Carousels, Stories |

**Pipeline:** `/brief` → `/trends` → `/concept` → `/script` → `/art-direction` → `/storyboard` → `/generate` → `/assemble` → `/publish` → `/repurpose`
**Setup:** CLAUDE.md mit Voice, Visual Style, Tools, Audience, Rules befuellen. Jeden Agent einzeln oder sequenziell nutzbar.

### albert.olgaard Claude Cowork Skills (@albert.olgaard — 314K Follower)
Skills per DM (kommentiere "SKILLS" auf instagram.com/albert.olgaard). Auch auf Skool: skool.com/@albert-olgaard

| Skill | Funktion |
|-------|----------|
| Morning Briefing | Scannt Kalender, E-Mails, News → strukturiertes Tages-Dashboard |
| Research Assistant | Vollstaendige Berichte mit Quellen zu beliebigem Thema |
| Meeting Notes to Action Items | Transkript → Notizen, Entscheidungen, Deadlines |
| Slide Deck Generator | Thema → vollstaendige Praesentation (HTML mit Animationen) |
| Visual Explainer | Interaktive Webseite mit Diagrammen fuer komplexe Konzepte |
| Diagram Generator | Flowcharts im Excalidraw-Format |
| Skill Creator | Eigene Skills fuer spezifische Anforderungen bauen |
| AI Thumbnail Generator | Claude Code generiert Video-Thumbnails (kommentiere "THUMBNAIL") |

### kylewhitrow — Vibe Marketing mit Claude Code (@kylewhitrow — 35.9K Follower)
"Claude Code as a video game for Entrepreneurs." Website: nustimulus.com

| Guide | Funktion | Keyword |
|-------|----------|---------|
| Remotion Video Editing | Claude Code schreibt Remotion-Code, rendert MP4 automatisch | Kommentiere "REMOTION" |
| Claude Code Setup | Einrichtung fuer Unternehmer, Marketing-Automatisierung | Kommentiere "Claude Code" |
| Website Builder | 1-Prompt vollstaendige Website via Claude | (via tenfoldmarc-Kooperation) |

**Remotion-Workflow:** VSCode → Claude Extension → Remotion Skill installieren → Videos per Chat beschreiben → Remotion Studio zeigt Preview im Browser

### byjoeym — Claude Code fuer Product Visuals (@byjoeym)
Setup-Guide per DM (kommentiere "claude" auf instagram.com/byjoeym).
Brief: Brand-URL + Style-Beispiele eingeben → Claude generiert Produkt-Visuals automatisch konsistent zur Brand.

### Jens Heitmann (@jens.heitmann) — Claude Code fuer Business & Content
Mehrere Claude Code Anwendungsfaelle:
- **Obsidian + Claude Code** = "Second Brain Cheat Code" (DVv5bClkeqb) — Notizen → automatische Wissensbasis
- **Social Media Manager** — Claude Code analysiert eigene Kanaele, auditiert Posts, verbessert Content (DVmw74XEbk7)
- **Remotion + Claude Code** — Sprachgesteuerte Video-Schnitt-Automatisierung (DVeMX3EiaNO)
- **3 neue SaaS-Features** von Claude Code (DVmPZh0EuCq) — kritische Updates fuer SaaS-Entwicklung

### kylewhitrow — Weitere Guides (@kylewhitrow)
- **Meta Ads mit Claude Code** — Automatisiertes Aufsetzen neuer Meta-Kampagnen (DVwOqipEc17, kommentiere "Meta")
- **Remotion Editing** — Kostenloser Setup-Guide (DVtWNvEjT8_, kommentiere "Remotion")

### Tobias Schreiber (@tobiasschreiber_) — Claude Code Setup (DE)
Deutschsprachiger Guide: "Die meisten richten Claude Code ein wie eine leere App — und wundern sich, warum es nicht funktioniert." (DU5neioDo3K, kommentiere "SETUP")

### The AI Impact (@theaiimpact) — Marketing Skills Library
"Turn Claude Code into your marketing team. A full marketing skills library for Claude Code — These aren't just prompts." (DVawy16Ed9t)

### Chase AI (@chase.h.ai) — Claude Code Guides
"Comment 'agent' to get my Claude code guides" (DVpFr4xDTpE) — Sammlung von Claude Code Agent-Guides.

### Brooke | AI Education (@brookeaimarketing)
"Did Claude in Chrome just make Manychat obsolete?" — Claude in Chrome automatisch antwortet auf TikTok-Kommentare mit passenden Lead Magnets (DVNPtr7idB8).

### Brock Mesarich (@aifornontechies) — Claude Cowork Plugins
"Anthropic just released plugins for Claude Cowork that turn it into a [powerful tool]" — Liste: kommentiere "PLUGINS" (DVYx71hiYU2).

### Lucas Krawczak — Claude API Kostenoptimierung (@lucaskrawczak)
"Underoptimized providers are cooking your wallet" — Tipps zu kostenguenstigem Claude API-Routing (DVNiKU0DqQq).

---

## E. MCP Server — Top-Empfehlungen nach Kategorie

Offizielle Server: `github.com/modelcontextprotocol/servers`
Kuratierte Listen: `github.com/wong2/awesome-mcp-servers`, `mcpcat.io`

### Versionskontrolle & Code
| Server | URL | Wert |
|--------|-----|------|
| GitHub MCP | github.com/github/github-mcp-server | Issues, PRs, CI/CD direkt aus Claude |
| Git MCP (offiziell) | modelcontextprotocol/servers/src/git | Lokale Git-History analysieren |

### Browser-Automatisierung
| Server | URL | Wert |
|--------|-----|------|
| Playwright MCP | github.com/microsoft/playwright-mcp | E2E-Tests schreiben + ausfuehren |
| Puppeteer MCP (offiziell) | modelcontextprotocol/servers/src/puppeteer | Browser-Automatisierung, Screenshots |
| Firecrawl MCP | github.com/mendableai/firecrawl-mcp-server | Web-Scraping per natuerlicher Sprache |

### Datenbanken
| Server | URL | Wert |
|--------|-----|------|
| PostgreSQL (offiziell) | modelcontextprotocol/servers/src/postgres | SQL per Sprache: "Top 5 Kunden nach Umsatz" |
| Supabase MCP | github.com/supabase-community/supabase-mcp | Vollstaendiges Supabase-Backend |
| MotherDuck/DuckDB | github.com/motherduckdb/mcp-server-motherduck | Analytische SQL auf lokalen Dateien |

### Projekt- & Wissensmanagement
| Server | URL | Wert |
|--------|-----|------|
| Notion MCP (offiziell) | github.com/makenotion/notion-mcp-server | Docs lesen, Notizen erstellen |
| Linear MCP | linear.app/docs/mcp | Issue-Tracking direkt im Workflow |
| Atlassian MCP | github.com/atlassian/atlassian-mcp-server | Jira + Confluence fuer Enterprise |

### Design & Frontend
| Server | URL | Wert |
|--------|-----|------|
| Figma MCP | developers.figma.com/docs/figma-mcp-server | Design → Produktionscode ohne Gap |

### Kommunikation
| Server | URL | Wert |
|--------|-----|------|
| Slack MCP (offiziell) | modelcontextprotocol/servers/src/slack | Kanal-History, Thread-Zusammenfassungen |
| Google Drive MCP | modelcontextprotocol/servers/src/gdrive | Team-Drive-Dokumente lesen |

### Observability & Cloud
| Server | URL | Wert |
|--------|-----|------|
| Sentry MCP | mcp.sentry.dev | Production-Crashes mit Stack Trace debuggen |
| PostHog MCP | github.com/PostHog/mcp | Product Analytics, Feature Flags |
| Vercel MCP | vercel.com/docs/agent-resources/vercel-mcp | Deployments, Build-Logs, Env-Vars |
| Cloudflare MCP | github.com/cloudflare/mcp-server-cloudflare | Workers, DNS, KV-Storage |

### KI-Hilfsmittel & Meta
| Server | URL | Wert |
|--------|-----|------|
| Context7 MCP | github.com/upstash/context7 | Aktuelle versionsspezifische Doku jeder Library |
| Sequential Thinking (offiziell) | modelcontextprotocol/servers/src/sequentialthinking | Besseres Reasoning bei komplexen Aufgaben |
| Memory MCP (offiziell) | modelcontextprotocol/servers/src/memory | Persistentes Gedaechtnis via Knowledge-Graph |
| Brave Search MCP | modelcontextprotocol/servers/src/brave-search | Echtzeit-Websuche ohne Knowledge-Cutoff |
| E2B MCP | github.com/e2b-dev/mcp-server | Code in isolierten Cloud-Sandboxes ausfuehren |
| Composio MCP | composio.dev | 250+ Platform-Integrationen (GitHub, Slack, Jira, Salesforce...) |

---

## F. Hooks-Sammlungen

| Repository | Inhalt |
|-----------|--------|
| `disler/claude-code-hooks-mastery` | Vollstaendigste Referenz, alle Hooks als Python-Skripte |
| `karanb192/claude-code-hooks` | Copy-Paste-fertig, gut dokumentiert |
| `disler/claude-code-hooks-multi-agent-observability` | Echtzeit-Monitoring paralleler Claude-Agents |

**Wichtigste Hook-Typen:**
- `UserPromptSubmit` — Prompt-Validierung, Logging, Security-Filterung
- `PreToolUse` — Gefaehrliche Commands blockieren (rm -rf, secret-Pfade)
- `PostToolUse` — Tool-Abschluesse loggen
- `SessionStart` — Git-Status + Pull beim Start, Kontext laden
- `Stop` — Auto-Commit-Push, Abschlussmeldungen

---

## G. Multi-Agent Orchestratoren

| Tool | URL | Funktion |
|------|-----|----------|
| claude-flow (RuFlo) | github.com/ruvnet/claude-flow | #1 Agent-Framework, 60 Agents parallel, 75% API-Kostenersparnis |
| claude-task-master | github.com/eyaltoledano/claude-task-master | Task-Management fuer KI-gesteuerte Entwicklung |
| claude-squad | github.com/smtg-ai/claude-squad | Terminal-App fuer mehrere parallele Claude-Instanzen |
| claude-swarm | github.com/parruda/claude-swarm | Verbundene Agent-Schwaerme |
| claudekit | github.com/carlrannaberg/claudekit | Auto-Save-Checkpointing, 20+ Subagenten |
| SuperClaude | github.com/SuperClaude-Org/SuperClaude_Framework | Konfigurations-Framework, spezialisierte Commands und Personas |
| container-use | github.com/dagger/container-use | Sichere isolierte Umgebungen fuer parallele Agents |

---

## H. Produktivitaets-Tools

| Tool | URL | Funktion |
|------|-----|----------|
| recall | github.com/zippoxer/recall | Volltext-Suche ueber alle Claude-Code-Sessions |
| ccusage | github.com/ryoppippi/ccusage | Token-Verbrauch-Dashboard mit Kostenanalyse |
| rulesync | github.com/dyoshikawa/rulesync | CLAUDE.md-Configs zwischen Claude, Cursor, Codex konvertieren |
| VoiceMode MCP | github.com/mbailey/voicemode | Push-to-Talk-Sprachsteuerung fuer Claude Code |
| claude-hub | github.com/claude-did-this/claude-hub | Webhook: Claude Code mit GitHub-Repos verbinden |

---

## I. Weiterbildung & Zertifizierung

### Claude Certified Architect (CCA) — Foundations
Anthropic-Zertifizierung seit 12. Maerz 2026.
- **Pruefung:** 60 Fragen, 120 Min, $99/Versuch (kostenlos fuer Claude Partner Network-Mitglieder)
- **Mindestpunktzahl:** 720/1000
- **5 Bereiche:** Agentic Architecture (27%), Claude Code Config (20%), Prompt Engineering (20%), Tool Design & MCP (18%), Context Management (15%)

### 13 Kostenlose Kurse (Anthropic Academy)
Alle auf `anthropic.skilljar.com` — kostenlos, mit Abschlusszertifikat.

**Developer-Fokus:**
1. Claude Code in Action (21 Lektionen)
2. Building with the Claude API (16 Lektionen)
3. Introduction to Agent Skills
4. Introduction to MCP (8 Lektionen)
5. Model Context Protocol: Advanced Topics (8 Lektionen)
6. Claude with Amazon Bedrock (16 Lektionen)
7. Claude with Google Cloud Vertex AI (16 Lektionen)

**Grundlagen:** Claude 101, AI Fluency Framework

**GitHub-Kurse (Jupyter Notebooks):** `github.com/anthropics/courses`

---

## Wie der Skill diese Datenbank nutzt

### Phase 2c — Intelligente Skill-Erkennung

1. **Projekttyp ermitteln** (Web-App, CLI, Content, Mobile, API...)
2. **Passende Skills aus Datenbank empfehlen:**
   - Web-Frontend → `frontend-design`, Playwright MCP, Figma MCP
   - Security-Projekt → `trailofbits/skills`, PreToolUse-Hooks
   - Content/Marketing → KODA Creative Stack, albert.olgaard Skills
   - Multi-Agent → claude-flow/RuFlo, obra/superpowers
   - Datenbank-Projekt → Supabase/PostgreSQL MCP, DuckDB MCP
3. **Installation vorschlagen** mit konkretem Befehl
4. **Bereits vorhandene Skills** aus Liste streichen

### Ausgabe im Audit-Bericht (Section F)

```
### Empfohlene Skills & Tools basierend auf Projekt-Analyse

**Fehlend und dringend empfohlen:**
- [ ] .gitignore — Sensible Dateien ungeschuetzt
- [ ] auto-commit-push Hook — Kein automatisches Backup
- [ ] rules/security-and-secrets.md — Kein Security-Regelwerk

**Empfohlen fuer diesen Projekttyp:**
- [ ] GitHub MCP Server — Direkte Issue/PR-Integration
- [ ] obra/superpowers — TDD und systematisches Debugging
- [ ] Context7 MCP — Aktuelle Library-Dokumentation

**Bereits abgedeckt:**
- [x] CLAUDE.md vorhanden
- [x] Git und GitHub konfiguriert
- [x] RuFlo/claude-flow installiert
```

---

## J. Website-Erstellung mit Claude Code (Transkript-Erkenntnisse)

### Vollstaendige kostenloses Website-Pipeline
*(Quelle: Instagram Reel @tenfoldmarc / DWCPx0PkQzA — Whisper-Transkript)*

**4-Schritte-Setup fuer professionelle Websites:**
1. Claude Code installieren (`claude` CLI)
2. Framer Motion installieren (Website-Animationen)
3. **UI UX Pro Max Skill** herunterladen (Claude Code Skill fuer UI-Design)
4. **21st.dev** einbinden — komponentenbasierte UI-Bibliothek

**21st.dev** (`21st.dev`) — Magic UI-Komponentenbibliothek fuer Claude Code. Pasted one line in Claude Code → generates beautiful animated websites. Alternative zu shadcn/ui mit besserem Animationssupport.

```bash
# Typical one-liner setup (from the GitHub repo)
# Creator has a repo: comment "website" on post for link
claude "Create a website using UI UX Pro Max skill + 21st.dev components + Framer Motion"
```

---

## K. RuFlo / claude-flow — Vollstaendige Erkenntnisse
*(Quelle: @nicksadler.io / DWNB0t9iMhv — Whisper-Transkript)*

**Vollstaendiges Zitat:**
> "Someone just built the most powerful cloud tool on the planet. 60 agents working together simultaneously all getting smarter every single run. It's called Rooflow, formerly Claude Flow and this thing is insane. One agent handles planning, another writes code, another runs tests, another checks security. All running in parallel, all sharing memory, all improving from each other after every single run. But here's the part that blew my mind. It slashes your Claude API costs by 75%. Basic tasks route to a free tier automatically, advanced tasks route to the optimal model. Your Claude subscription just became 2.5 times more powerful. Ranked number one in agent frameworks on GitHub. Over 14,000 stars, 100% open source free, zero additional subscriptions, maximum intelligence."

**Key Facts:**
- Name: **RuFlo** (ehem. claude-flow) — `github.com/ruvnet/claude-flow`
- 60 Agents parallel mit geteiltem Memory
- 75% API-Kosteneinsparung durch automatisches Model-Routing
- #1 Agent Framework auf GitHub, 14.000+ Stars
- Selbstlernend: Agents verbessern sich nach jeder Run

---

## L. Freie Transkriptions-Pipeline (lokal, kein Account noetig)

Fuer zukuenftige Video-Analysen — vollstaendig kostenlos:

```bash
# 1. yt-dlp installieren
pip install yt-dlp

# 2. ffmpeg installieren (Windows)
winget install ffmpeg

# 3. Whisper installieren
pip install openai-whisper

# 4. Video herunterladen (oeffentliche Posts ohne Login!)
python -m yt_dlp -f "mp4/best" "https://www.instagram.com/p/POST_ID/" -o "reel.mp4"

# 5. Transkribieren
python -c "import whisper; m=whisper.load_model('tiny'); print(m.transcribe('reel.mp4')['text'])"
```

**Hinweise:**
- `tiny` Modell: schnell, ~72MB, gut fuer kurze Reels (unter 3 Min)
- `base` oder `small` fuer bessere Qualitaet bei laengeren Videos
- Funktioniert fuer alle oeffentlichen Instagram, TikTok, YouTube Videos
- Chrome muss geschlossen sein wenn `--cookies-from-browser chrome` benoetigt wird
