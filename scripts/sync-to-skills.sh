#!/usr/bin/env bash
# sync-to-skills.sh
# Synchronisiert das Repo in den installierten Skill-Pfad.
# Aufruf: bash scripts/sync-to-skills.sh

SKILL_PATH="$HOME/.claude/skills/claude-project-doctor-master"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Sync: $REPO_DIR → $SKILL_PATH"

# Sicherheits-Backup
BACKUP="$SKILL_PATH.backup-$(date +%Y%m%d-%H%M%S)"
cp -r "$SKILL_PATH" "$BACKUP" 2>/dev/null && echo "Backup erstellt: $BACKUP"

# Sync (ohne .git, ohne CLAUDE.md, ohne sync-script selbst)
rsync -av --exclude='.git' --exclude='CLAUDE.md' --exclude='CHANGELOG.md' \
  --exclude='.gitignore' --exclude='scripts/sync-to-skills.sh' \
  "$REPO_DIR/" "$SKILL_PATH/"

echo "✓ Sync abgeschlossen. Skill aktualisiert."
