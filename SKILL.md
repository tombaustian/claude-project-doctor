---
name: "claude-project-doctor"
description: "Auditiert und modernisiert ein bestehendes Claude-Code-Projekt mit RuFlo-Integration konservativ und reversibel. Nutze diesen Skill immer dann, wenn der User sein Arbeitsverzeichnis, seine Claude-Struktur, seine RuFlo-Integration, seine CLAUDE.md, Hooks, Skills, Settings, Rules oder Workflows auf Best-Practice-Stand bringen möchte – auch wenn er nur von 'aufräumen', 'aufhübschen', 'bereinigen', 'sauber machen', 'aktualisieren' oder 'verbessern' spricht. Trigger auch bei: 'Projekt-Audit', 'Claude-Struktur prüfen', 'Ist mein Setup gut?', 'RuFlo-Setup überprüfen', 'Was fehlt in meinem Projekt?', 'mein Projekt modernisieren', 'Claude-Konfiguration checken', 'Setup Health Check'."
---

# Project Audit & Modernize

Du wirst jetzt ein bestehendes Claude-Code-Projekt konservativ auditieren und behutsam auf Best-Practice-Stand bringen. Antworte immer auf Deutsch.

## Leitprinzipien

**Bestehendes hat Vorrang.** Zuerst auditieren, dann minimal-invasiv verbessern. Nichts Wichtiges entfernen oder destabilisieren. Jede Änderung muss begründbar, minimal-invasiv und reversibel sein.

**Prioritäten:**
1. Stabilität und Kompatibilität
2. Nachvollziehbarkeit und Dokumentation
3. Versionssicherheit / Wiederherstellbarkeit
4. Saubere Claude- und RuFlo-Integration (falls RuFlo vorhanden)
5. Wiederverwendbarkeit
6. Risikoarme Automatisierung
7. Optionale Optimierung – kein Overengineering

## RuFlo-Infrastruktur respektieren (falls vorhanden)

Wenn im System eine globale RuFlo-Installation existiert, ist sie als bestehende Systemrealität zu behandeln:

- Nicht vorschnell erneut global initialisieren oder überschreiben
- Keine projektlokalen Duplikate globaler RuFlo-Bausteine anlegen
- Projektlokale Ergänzungen nur dort, wo echter Projektnutzen entsteht
- Dokumentiere klar: was global vorhanden ist vs. was projektlokal ergänzt wird

Falls kein RuFlo vorhanden ist, überspringe alle RuFlo-spezifischen Prüfpunkte und konzentriere dich auf die Claude-Code-Strukturen.

---

## PHASE 1 – VOLLSTÄNDIGER AUDIT (immer zuerst)

**Führe Phase 1 immer vollständig durch, bevor du irgendetwas änderst.**
**Nach Phase 1 lieferst du NUR die Bestandsaufnahme und wartest auf Freigabe.**

### Was du prüfen musst

**Projektstruktur:**
- Projektwurzelstruktur (alle Top-Level-Dateien und -Ordner)
- `CLAUDE.md` im Projektroot und `.claude/CLAUDE.md`
- `.claude/settings.json` und `.claude/settings.local.json`
- `.claude/rules/`, `.claude/skills/`, `.claude/commands/`, `.claude/agents/`, `.claude/scripts/`

**Sicherheit (besonders wichtig):**
- Credential-Dateien im Projektbaum (`.credentials.json`, `token.json`, `*.key`, `.env`)
- Secrets in versionierten Dateien
- Fehlende `.gitignore`-Einträge für sensible Dateien

**Integration & Konfiguration:**
- Hook-bezogene Logik, MCP-Konfigurationen, Plugins
- Sicherheitsrelevante Dateien und Secrets-Strukturen
- Mögliche Kollisionen mit global installierten RuFlo-Bausteinen (falls RuFlo vorhanden)

**Dokumentation & Prozesse:**
- README, Changelog, ADR/Decision-Docs, Debugging-Dokumentation
- Session-Handover-Mechanismen, Backup-/Archiv-/Export-Ordner
- Build-/Test-/Lint-Workflows, Git-Status

### Ausgabeformat

Beginne mit einer kurzen Zusammenfassung (3-5 Sätze: Gesamteindruck, größte Stärke, größtes Risiko, empfohlene Option). Dann liefere die strukturierte Übersicht:

**A. Was ist schon gut?**
**B. Was ist veraltet, inkonsistent oder unnötig kompliziert?**
**C. Was fehlt wirklich?**
**D. Was sollte bewusst NICHT angefasst werden?**
**E. Globale RuFlo-Bausteine, die nicht zu duplizieren sind** (nur wenn RuFlo vorhanden)
**F. Projektlokale Ergänzungen, die sinnvoll wären?**
**G. Git, Backups und Wiederherstellung: Aktueller Stand und Empfehlung?**
**H. Empfohlene Vorgehensoption: A, B oder C – mit Begründung und Risikoeinschätzung**

Dann: **Warte auf Freigabe durch den User, bevor du irgendetwas umsetzt.**

---

## Entscheidungsrahmen: Option A / B / C

### Option A – Bestand behutsam modernisieren
Wähle Option A, wenn:
- Die bestehende Struktur grundsätzlich tragfähig ist
- Nur moderate Inkonsistenzen bestehen
- Risiken durch additive Verbesserungen gut kontrollierbar sind

### Option B – Isoliert in einem Git-Worktree arbeiten
Bevorzuge Option B, wenn:
- Git vorhanden und gesund ist
- Größere Änderungen oder strukturelle Experimente nötig sind
- Das Hauptprojekt nicht direkt belastet werden soll
- Prüfe Option B vor Option C, wenn Git vorhanden ist

### Option C – Parallele Zielstruktur anlegen
Wähle Option C nur, wenn:
- Die bestehende Struktur zu inkonsistent oder zu riskant ist
- Option B das Grundproblem nicht löst

**Wichtig bei Option C:**
- Nie stillschweigend zu Option C wechseln – erst nach Audit explizit begründen
- Bestehende Struktur NICHT zerstören, umbenennen oder wegräumen
- Neue Struktur mit klarem, nicht kollidierendem Namen: `_workspace_optimized`, `_next`, `_target-structure`
- Dokumentiere: warum angelegt, was übernommen/nicht übernommen, wie späterer Übergang

---

## Phasen 2–12: Umsetzung nach Freigabe

Für die detaillierten Anweisungen zu den Umsetzungsphasen lies: `references/phases.md`

Die Phasen im Überblick:
- **Phase 2**: Nicht-destruktive Modernisierung (erlaubt / nicht erlaubt)
- **Phase 2b**: Automatische Installation (RuFlo, Skills, Agents, Hooks – nach Freigabe)
- **Phase 2c**: Intelligente Skill-Erkennung (online suchen, inhaltsbasiert empfehlen, installieren)
- **Phase 3**: Claude- und RuFlo-Zielstruktur
- **Phase 4**: CLAUDE.md behutsam nachrüsten
- **Phase 5**: Rules statt Monolith
- **Phase 6**: Skills modern und fokussiert
- **Phase 7**: Agents nur mit klarem Mehrwert
- **Phase 8**: Settings sauber trennen
- **Phase 9**: Hooks mit Augenmaß
- **Phase 10**: MCP / Plugins / RuFlo-Integration
- **Phase 11**: Git, Backups, Snapshots und Debugging
- **Phase 12**: Qualitätssicherung + Abschlussbericht

---

## Git und Backups – Grundprinzip

**Git** ist die primäre Versionskontrolle für: Code, Konfiguration, CLAUDE.md, Skills, Rules, Docs, ADRs.

**Echte Backups** sind zusätzlich nötig für: Datenbanken, Uploads, Binärdateien, generierte Artefakte, Dinge außerhalb des normalen Git-Flows.

**Claude-Checkpoints ersetzen kein Git. Git ersetzt keine Backups.**

---

## Abschlussbericht – Pflichtformat

Nach Abschluss aller genehmigten Phasen liefere einen kompakten Bericht:

1. Ist-Zustand vor der Anpassung
2. Was bewusst unverändert blieb
3. Welche Dateien neu angelegt / ergänzt / modernisiert wurden
4. Welche alten Strukturen bewusst erhalten wurden
5. Welche neuen Rules / Skills / Agents / Hooks hinzugekommen sind
6. Welche globalen RuFlo-Bausteine bewusst NICHT dupliziert wurden
7. Gewählte Option (A/B/C) mit Begründung
8. Bei Option C: Name, Zweck, Übernahmen, Übergangslogik
9. Wie Git, Backups und Recovery nun organisiert sind
10. Empfohlene optionale nächste Schritte
