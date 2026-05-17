# Incident Response Runbook

## Purpose

This runbook documents the local incident response workflow for the LFCS Study Dashboard.

The goal is to practice production-style incident handling in a controlled local environment.

## Incident response lifecycle

The lifecycle used in this project is:

1. detect
2. triage
3. mitigate
4. recover
5. verify
6. document
7. create follow-up actions

## Severity levels

| Severity | Meaning | Example |
|---|---|---|
| SEV1 | Service unavailable or data loss risk | App down and cannot recover |
| SEV2 | Major degradation | Readiness failing, high 5xx, alert firing |
| SEV3 | Minor degradation | High latency or isolated warning |
| SEV4 | Informational or drill | Controlled local incident simulation |

Controlled local drills should normally be marked SEV4 unless the incident reveals an actual serious defect.

## Standard first checks

Check Compose services:

    docker compose -f compose.yml ps

Check app health:

    curl -fsS http://127.0.0.1:3002/healthz

Check app readiness:

    curl -fsS http://127.0.0.1:3002/readyz

Check Prometheus alerts:

    curl -fsS http://127.0.0.1:9090/api/v1/alerts

Check Alertmanager alerts:

    curl -fsS http://127.0.0.1:9093/api/v2/alerts

Check webhook receiver events:

    curl -fsS http://127.0.0.1:9094/events

Check app logs:

    docker compose -f compose.yml logs --tail=120 lfcs-dashboard

## Common mitigation actions

Restart the app container:

    LFCS_DASHBOARD_PORT=3002 docker compose -f compose.yml up -d lfcs-dashboard

Restart Prometheus and Alertmanager after config changes:

    docker compose -f compose.yml restart prometheus alertmanager

Do not delete Docker volumes during incident response unless the incident is specifically a data-volume recovery test.

Avoid:

    docker compose down -v

unless intentionally testing destructive recovery.

## Postmortem requirements

Each incident note should include:

- incident summary
- severity
- start time
- detection method
- user impact
- root cause
- timeline
- what went well
- what went poorly
- corrective actions
- evidence links or copied command output
- final verification

## Current local limitation

This project uses local incident simulations.

It does not claim real production on-call experience.

The purpose is to demonstrate operational thinking, alert response, recovery verification, and documentation discipline.
