#!/bin/bash
# auto-commit-push.sh
# Stop Hook — Committed und pusht alle Aenderungen am Session-Ende
# Wird vom project-audit-modernize Skill in Phase 11 installiert

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0

# Pruefen ob es ueberhaupt Aenderungen gibt
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo ""
  echo "  [Auto-Push] Keine Aenderungen — nichts zu committen."
  echo ""
  exit 0
fi

# Alle geaenderten und neuen Dateien stagen
git add -A

# Commit mit Zeitstempel
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
git commit -m "Auto-Commit: Session-Ende $TIMESTAMP" 2>/dev/null

# Push zum Remote
if git remote | grep -q origin; then
  git push origin 2>/dev/null
  if [ $? -eq 0 ]; then
    echo ""
    echo "  [Auto-Push] Aenderungen committed und nach GitHub gepusht."
    echo ""
  else
    echo ""
    echo "  [Auto-Push] Commit erstellt, aber Push fehlgeschlagen (offline?)."
    echo "  Beim naechsten 'git push' wird nachgeholt."
    echo ""
  fi
else
  echo ""
  echo "  [Auto-Push] Commit erstellt (kein Remote konfiguriert)."
  echo ""
fi

exit 0
