#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-compose.yml}"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-postgres}"
POSTGRES_USER="${POSTGRES_USER:-lfcs}"
POSTGRES_DB="${POSTGRES_DB:-lfcs_dashboard}"
LFCS_DASHBOARD_PORT="${LFCS_DASHBOARD_PORT:-3002}"
APP_URL="${APP_URL:-http://127.0.0.1:${LFCS_DASHBOARD_PORT}}"
EVIDENCE_FILE="${EVIDENCE_FILE:-docs/evidence/phase-13/restore-test.md}"

if docker compose version >/dev/null 2>&1 && docker ps >/dev/null 2>&1; then
  DC=(docker compose -f "$COMPOSE_FILE")
  DC_ENV=(env LFCS_DASHBOARD_PORT="$LFCS_DASHBOARD_PORT" docker compose -f "$COMPOSE_FILE")
else
  DC=(sudo docker compose -f "$COMPOSE_FILE")
  DC_ENV=(sudo env LFCS_DASHBOARD_PORT="$LFCS_DASHBOARD_PORT" docker compose -f "$COMPOSE_FILE")
fi

mkdir -p "$(dirname "$EVIDENCE_FILE")"

cat > "$EVIDENCE_FILE" <<EOM
# Phase 13 — PostgreSQL Backup and Restore Test Evidence

## Purpose

This evidence proves that the LFCS Study Dashboard PostgreSQL database can be backed up, restored, and verified after restore.

A backup without a tested restore is incomplete.

## Environment

- Runtime: Docker Compose
- Database: PostgreSQL
- Compose service: postgres
- Database name: lfcs_dashboard
- Database user: lfcs
- App URL used for verification: ${APP_URL}

EOM

echo "Starting PostgreSQL and LFCS Dashboard on port ${LFCS_DASHBOARD_PORT}..."
"${DC_ENV[@]}" up -d --build postgres lfcs-dashboard

echo "Waiting for application readiness..."
for i in {1..40}; do
  if curl -fsS "${APP_URL}/readyz" | grep -q '"status":"ready"'; then
    echo "Application is ready."
    break
  fi

  if [[ "$i" -eq 40 ]]; then
    echo "Application did not become ready." >&2
    "${DC[@]}" ps
    "${DC[@]}" logs --tail=100 lfcs-dashboard
    exit 1
  fi

  echo "Waiting for readiness..."
  sleep 3
done

{
  echo "## Initial Compose State"
  echo
  echo "Command: docker compose -f compose.yml ps"
  echo
  "${DC[@]}" ps
  echo
  echo "## Initial Readiness"
  echo
  echo "Command: curl -fsS ${APP_URL}/readyz"
  echo
  curl -fsS "${APP_URL}/readyz"
  echo
} >> "$EVIDENCE_FILE"

echo "Creating restore-test marker data..."
"${DC[@]}" exec -T "$POSTGRES_SERVICE" psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL'
INSERT INTO users (email, password_hash, role)
VALUES ('phase13-restore-test@example.com', 'phase13-test-marker-not-a-real-login-hash', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO progress (user_id, task_id, status, evidence)
SELECT id, 'phase-13-restore-test', 'completed', 'Restore test marker created before backup.'
FROM users
WHERE email = 'phase13-restore-test@example.com'
ON CONFLICT (user_id, task_id)
DO UPDATE SET
  status = EXCLUDED.status,
  evidence = EXCLUDED.evidence,
  updated_at = NOW();
SQL

{
  echo
  echo "## Marker Data Before Backup"
  echo
  echo "Command: SELECT marker row before backup"
  echo
  "${DC[@]}" exec -T "$POSTGRES_SERVICE" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT u.email, p.task_id, p.status, p.evidence FROM users u JOIN progress p ON p.user_id = u.id WHERE u.email = 'phase13-restore-test@example.com';"
  echo
  echo "## Table Counts Before Backup"
  echo
  echo "Command: SELECT table counts before backup"
  echo
  "${DC[@]}" exec -T "$POSTGRES_SERVICE" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 'users' AS table_name, count(*) FROM users UNION ALL SELECT 'progress', count(*) FROM progress UNION ALL SELECT 'user_sessions', count(*) FROM user_sessions;"
  echo
} >> "$EVIDENCE_FILE"

echo "Creating backup..."
bash scripts/backup-postgres.sh

BACKUP_FILE="$(ls -1t backups/postgres/lfcs_dashboard_*.sql | head -n 1)"

if [[ -z "$BACKUP_FILE" || ! -s "$BACKUP_FILE" ]]; then
  echo "Could not find non-empty backup file." >&2
  exit 1
fi

{
  echo
  echo "## Backup File Created"
  echo
  echo "Command: ls -lh ${BACKUP_FILE}"
  echo
  ls -lh "$BACKUP_FILE"
  echo
} >> "$EVIDENCE_FILE"

echo "Deleting marker data to prove restore works..."
"${DC[@]}" exec -T "$POSTGRES_SERVICE" psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL'
DELETE FROM progress
WHERE task_id = 'phase-13-restore-test'
  AND user_id IN (
    SELECT id FROM users WHERE email = 'phase13-restore-test@example.com'
  );

DELETE FROM users
WHERE email = 'phase13-restore-test@example.com';
SQL

{
  echo
  echo "## Marker Data After Deletion Before Restore"
  echo
  echo "Command: SELECT marker row after deletion before restore"
  echo
  "${DC[@]}" exec -T "$POSTGRES_SERVICE" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT u.email, p.task_id, p.status FROM users u JOIN progress p ON p.user_id = u.id WHERE u.email = 'phase13-restore-test@example.com';"
  echo
} >> "$EVIDENCE_FILE"

echo "Restoring backup..."
CONFIRM_RESTORE=replace-current-database bash scripts/restore-postgres.sh "$BACKUP_FILE"

echo "Verifying restore..."
curl -fsS "${APP_URL}/readyz" | grep -q '"status":"ready"'

RESTORED_COUNT="$("${DC[@]}" exec -T "$POSTGRES_SERVICE" psql -At -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT count(*) FROM users u JOIN progress p ON p.user_id = u.id WHERE u.email = 'phase13-restore-test@example.com' AND p.task_id = 'phase-13-restore-test' AND p.status = 'completed';")"

if [[ "$RESTORED_COUNT" != "1" ]]; then
  echo "Restore verification failed: marker row was not restored." >&2
  exit 1
fi

{
  echo
  echo "## Readiness After Restore"
  echo
  echo "Command: curl -fsS ${APP_URL}/readyz"
  echo
  curl -fsS "${APP_URL}/readyz"
  echo
  echo
  echo "## Tables After Restore"
  echo
  echo "Command: psql -c '\\dt'"
  echo
  "${DC[@]}" exec -T "$POSTGRES_SERVICE" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"
  echo
  echo "## Table Counts After Restore"
  echo
  echo "Command: SELECT table counts after restore"
  echo
  "${DC[@]}" exec -T "$POSTGRES_SERVICE" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 'users' AS table_name, count(*) FROM users UNION ALL SELECT 'progress', count(*) FROM progress UNION ALL SELECT 'user_sessions', count(*) FROM user_sessions;"
  echo
  echo "## Marker Data After Restore"
  echo
  echo "Command: SELECT marker row after restore"
  echo
  "${DC[@]}" exec -T "$POSTGRES_SERVICE" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT u.email, p.task_id, p.status, p.evidence FROM users u JOIN progress p ON p.user_id = u.id WHERE u.email = 'phase13-restore-test@example.com';"
  echo
  echo "## Result"
  echo
  echo "PASS: PostgreSQL backup was created, marker data was deleted, restore completed, required tables existed after restore, /readyz returned ready, and marker data was recovered."
} >> "$EVIDENCE_FILE"

echo "Restore test passed."
echo "Evidence written to: $EVIDENCE_FILE"
