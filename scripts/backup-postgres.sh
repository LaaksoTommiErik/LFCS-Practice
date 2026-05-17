#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-compose.yml}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
POSTGRES_USER="${POSTGRES_USER:-lfcs}"
POSTGRES_DB="${POSTGRES_DB:-lfcs_dashboard}"
BACKUP_DIR="${BACKUP_DIR:-backups/postgres}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_FILE="${BACKUP_DIR}/${POSTGRES_DB}_${TIMESTAMP}.sql"

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  DC=(docker compose -f "$COMPOSE_FILE")
else
  DC=(sudo docker compose -f "$COMPOSE_FILE")
fi

mkdir -p "$BACKUP_DIR"

echo "Checking PostgreSQL readiness..."
"${DC[@]}" exec -T "$POSTGRES_SERVICE" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null

echo "Creating PostgreSQL backup..."
"${DC[@]}" exec -T "$POSTGRES_SERVICE" \
  pg_dump \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --format=plain \
    --no-owner \
    --no-privileges \
  > "$BACKUP_FILE"

if [[ ! -s "$BACKUP_FILE" ]]; then
  echo "Backup failed: backup file is missing or empty: $BACKUP_FILE" >&2
  exit 1
fi

echo "Backup created:"
echo "$BACKUP_FILE"
ls -lh "$BACKUP_FILE"
