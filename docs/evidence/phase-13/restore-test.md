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
- App URL used for verification: http://127.0.0.1:3002

## Initial Compose State

Command: docker compose -f compose.yml ps

NAME              IMAGE                                          COMMAND                  SERVICE          CREATED         STATUS                            PORTS
lfcs-blackbox     quay.io/prometheus/blackbox-exporter:v0.27.0   "/bin/blackbox_expor…"   blackbox         2 hours ago     Up 2 hours                        0.0.0.0:9115->9115/tcp, [::]:9115->9115/tcp
lfcs-dashboard    lfcs-dashboard:local                           "docker-entrypoint.s…"   lfcs-dashboard   5 seconds ago   Up 3 seconds (health: starting)   0.0.0.0:3002->3000/tcp, [::]:3002->3000/tcp
lfcs-grafana      grafana/grafana-oss:11.5.2                     "/run.sh"                grafana          2 hours ago     Up 2 hours                        0.0.0.0:3001->3000/tcp, [::]:3001->3000/tcp
lfcs-postgres     postgres:16-alpine                             "docker-entrypoint.s…"   postgres         2 hours ago     Up 2 hours (healthy)              5432/tcp
lfcs-prometheus   prom/prometheus:v2.55.1                        "/bin/prometheus --c…"   prometheus       2 hours ago     Up 2 hours                        0.0.0.0:9090->9090/tcp, [::]:9090->9090/tcp

## Initial Readiness

Command: curl -fsS http://127.0.0.1:3002/readyz

{"ok":true,"service":"lfcs-study-dashboard","status":"ready","checks":{"database":"ok"}}

## Marker Data Before Backup

Command: SELECT marker row before backup

              email               |        task_id        |  status   |                  evidence                  
----------------------------------+-----------------------+-----------+--------------------------------------------
 phase13-restore-test@example.com | phase-13-restore-test | completed | Restore test marker created before backup.
(1 row)


## Table Counts Before Backup

Command: SELECT table counts before backup

  table_name   | count 
---------------+-------
 users         |     2
 progress      |     2
 user_sessions |     1
(3 rows)



## Backup File Created

Command: ls -lh backups/postgres/lfcs_dashboard_20260517T173435Z.sql

-rw-r--r-- 1 root root 4.2K May 17 20:34 backups/postgres/lfcs_dashboard_20260517T173435Z.sql


## Marker Data After Deletion Before Restore

Command: SELECT marker row after deletion before restore

 email | task_id | status 
-------+---------+--------
(0 rows)



## Readiness After Restore

Command: curl -fsS http://127.0.0.1:3002/readyz

{"ok":true,"service":"lfcs-study-dashboard","status":"ready","checks":{"database":"ok"}}

## Tables After Restore

Command: psql -c '\dt'

           List of relations
 Schema |     Name      | Type  | Owner 
--------+---------------+-------+-------
 public | progress      | table | lfcs
 public | user_sessions | table | lfcs
 public | users         | table | lfcs
(3 rows)


## Table Counts After Restore

Command: SELECT table counts after restore

  table_name   | count 
---------------+-------
 users         |     2
 progress      |     2
 user_sessions |     1
(3 rows)


## Marker Data After Restore

Command: SELECT marker row after restore

              email               |        task_id        |  status   |                  evidence                  
----------------------------------+-----------------------+-----------+--------------------------------------------
 phase13-restore-test@example.com | phase-13-restore-test | completed | Restore test marker created before backup.
(1 row)


## Result

PASS: PostgreSQL backup was created, marker data was deleted, restore completed, required tables existed after restore, /readyz returned ready, and marker data was recovered.
