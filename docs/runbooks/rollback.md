# Rollback Runbook

## Purpose

This runbook documents how to roll back the LFCS Study Dashboard after a bad change.

Rollback has two different meanings:

1. Code rollback
2. Data rollback

A code rollback does not automatically roll back database state.

A database restore can lose changes made after the selected backup.

## Code rollback: local Docker Compose

Use this when the application code or container image is bad, but the database state should remain current.

### 1. Identify a known-good commit or tag

    git fetch --all --tags
    git log --oneline -10

### 2. Check out the known-good version

    git switch main
    git pull origin main
    git checkout <known-good-commit-or-tag>

### 3. Rebuild and restart the app

    LFCS_DASHBOARD_PORT=3002 docker compose -f compose.yml up -d --build lfcs-dashboard

### 4. Verify health, readiness, and metrics

    curl -fsS http://127.0.0.1:3002/healthz
    curl -fsS http://127.0.0.1:3002/readyz
    curl -fsS http://127.0.0.1:3002/metrics | grep lfcs_dashboard_http_requests_total

### 5. Return to normal Git branch after investigation

    git switch main

## Safer GitHub rollback: revert the bad commit

For a repository rollback through normal PR workflow, prefer git revert over force-pushing history.

    git switch main
    git pull origin main
    git switch -c rollback/revert-bad-change
    git revert <bad-commit-sha>
    npm run build
    git status --short
    git add .
    git commit -m "Revert bad change"
    git push -u origin rollback/revert-bad-change

Then open a PR.

## Data rollback: PostgreSQL restore

Use this when the database state is bad or data was deleted/corrupted.

### 1. Choose backup file

    ls -lh backups/postgres/*.sql

### 2. Restore selected backup

    CONFIRM_RESTORE=replace-current-database npm run restore:postgres -- backups/postgres/<backup-file>.sql

### 3. Verify database and app

    docker compose -f compose.yml exec -T postgres psql -U lfcs -d lfcs_dashboard -c "SELECT 'users' AS table_name, count(*) FROM users UNION ALL SELECT 'progress', count(*) FROM progress UNION ALL SELECT 'user_sessions', count(*) FROM user_sessions;"

    curl -fsS http://127.0.0.1:3002/readyz

## Rollback decision table

| Problem | Use code rollback? | Use data rollback? |
|---|---:|---:|
| Bad frontend change | Yes | No |
| Bad Express route change | Yes | Usually no |
| Bad Dockerfile change | Yes | No |
| Bad database migration | Maybe | Maybe |
| Deleted user/progress data | No | Yes |
| Corrupted local PostgreSQL data | No | Yes |
| Bad secret or environment value | No | No, fix environment |

## Evidence to collect

For a rollback test, save:

- bad version or simulated failure
- selected known-good commit/tag
- rollback command output
- /healthz result
- /readyz result
- /metrics result
- database table counts if data rollback was used
- notes on whether data loss occurred
