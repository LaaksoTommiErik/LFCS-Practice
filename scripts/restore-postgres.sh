#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-compose.yml}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
POSTGRES_USER="${POSTGRES_USER:-lfcs}"
POSTGRES_DB="${POSTGRES_DB:-lfcs_dashboard}"

if [[ $# -ne 1 ]]; then
  echo "Usage: CONFIRM_RESTORE=replace-current-database $0 backups/postgres/<backup-file>.sql" >&2
  exit 1
fi

BACKUP_FILE="$1"

if [[ "${CONFIRM_RESTORE:-}" != "replace-current-database" ]]; then
  echo "Refusing to restore without explicit confirmation." >&2
  echo "Run with:" >&2
  echo "  CONFIRM_RESTORE=replace-current-database $0 $BACKUP_FILE" >&2
  exit 1
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

if [[ ! -s "$BACKUP_FILE" ]]; then
  echo "Backup file is empty: $BACKUP_FILE" >&2
  exit 1
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  DC=(docker compose -f "$COMPOSE_FILE")
else
  DC=(sudo docker compose -f "$COMPOSE_FILE")
fi

echo "Checking PostgreSQL readiness..."
"${DC[@]}" exec -T "$POSTGRES_SERVICE" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null

echo "Resetting public schema in database: $POSTGRES_DB"
"${DC[@]}" exec -T "$POSTGRES_SERVICE" \
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL'
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
SQL

echo "Restoring backup file: $BACKUP_FILE"
cat "$BACKUP_FILE" | "${DC[@]}" exec -T "$POSTGRES_SERVICE" \
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"

echo "Verifying required tables..."
"${DC[@]}" exec -T "$POSTGRES_SERVICE" \
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL'
DO $$
DECLARE
  missing_tables text[];
BEGIN
  SELECT array_agg(expected.table_name)
  INTO missing_tables
  FROM (
    VALUES ('users'), ('user_sessions'), ('progress')
  ) AS expected(table_name)
  WHERE NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = expected.table_name
  );

  IF missing_tables IS NOT NULL THEN
    RAISE EXCEPTION 'Missing required tables after restore: %', missing_tables;
  END IF;
END $$;
SQL

echo "Restore completed and required tables verified."
