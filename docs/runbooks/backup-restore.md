# Backup and Restore Runbook

## Purpose

This runbook documents how to back up and restore the LFCS Study Dashboard PostgreSQL database in the local Docker Compose environment.

A backup is not complete until a restore has been tested.

## Scope

This runbook applies to the local Docker Compose PostgreSQL service.

Current database service:

- Compose service: postgres
- Database: lfcs_dashboard
- User: lfcs
- Persistent volume: postgres-data

## Data protected by the backup

| Table | Purpose | Criticality |
|---|---|---|
| users | User accounts, email addresses, password hashes, roles | High |
| progress | LFCS task progress and evidence text | High |
| user_sessions | Active login sessions | Low / operational |

Losing user_sessions usually forces users to log in again.

Losing users or progress is real data loss.

## Data not protected by this backup

This database backup does not protect:

- source code
- .env secrets
- Docker images
- Prometheus time-series data
- Grafana local state
- screenshots or evidence files
- host-level systemd or Nginx configuration

Those require separate backup or recreation procedures.

## Security warning

PostgreSQL dump files may contain:

- user emails
- password hashes
- session payloads
- progress/evidence text

Do not commit backup dump files to Git.

The repository intentionally ignores:

    backups/postgres/*
    !backups/postgres/.gitkeep

## Create a backup

Start the local stack:

    LFCS_DASHBOARD_PORT=3002 docker compose -f compose.yml up -d --build postgres lfcs-dashboard

Create a backup:

    npm run backup:postgres

The script writes a timestamped SQL dump under:

    backups/postgres/

## Restore from backup

Restore is destructive to the current local database schema.

Use explicit confirmation:

    CONFIRM_RESTORE=replace-current-database npm run restore:postgres -- backups/postgres/<backup-file>.sql

The restore script:

1. checks PostgreSQL readiness
2. drops the current public schema
3. recreates the public schema
4. restores the SQL dump
5. verifies required tables exist

## Automated restore test

Run:

    npm run test:postgres-restore

This test:

1. starts PostgreSQL and the app
2. creates marker data
3. creates a backup
4. deletes marker data
5. restores from backup
6. verifies /readyz
7. verifies required tables
8. verifies marker data returned
9. writes evidence to docs/evidence/phase-13/restore-test.md

## Verify after restore

Check app readiness:

    curl -fsS http://127.0.0.1:3002/readyz

Check required tables:

    docker compose -f compose.yml exec -T postgres psql -U lfcs -d lfcs_dashboard -c "\dt"

Check table counts:

    docker compose -f compose.yml exec -T postgres psql -U lfcs -d lfcs_dashboard -c "SELECT 'users' AS table_name, count(*) FROM users UNION ALL SELECT 'progress', count(*) FROM progress UNION ALL SELECT 'user_sessions', count(*) FROM user_sessions;"

## RPO and RTO

Current local RPO:

Data can be lost back to the time of the last successful PostgreSQL backup.

Current local RTO:

A local restore should be achievable in roughly 10-20 minutes if Docker, the repository, and a valid backup file are available.

These are local portfolio targets, not production guarantees.

## Current limitations

Current limitations:

- backups are manual
- backups are local files
- no automated schedule
- no off-host storage
- no encryption-at-rest policy for backup files beyond the local machine
- no S3 or managed database backup yet
- no point-in-time recovery

## Future AWS improvement

When AWS deployment exists, improve this with:

- encrypted S3 backup bucket
- least-privilege IAM role for backup upload
- lifecycle policy for old backups
- restore test from S3
- RDS snapshot or managed PostgreSQL backup strategy if using RDS
- documented production RPO/RTO target
