# Load Test Notes

## Purpose

This document records safe local load-testing results for the LFCS Study Dashboard.

The goal is not to prove high-scale production capacity. The goal is to show that the service can be tested under controlled load and that results are documented honestly.

## Tool

This project uses k6 for smoke load testing.

The script is stored at:

    ops/k6/smoke-load.js

## Current smoke load profile

| Setting | Value |
|---|---|
| Virtual users | 3 |
| Duration | 30 seconds |
| Target endpoints | /, /login, /healthz, /readyz |
| Failure threshold | HTTP failed request rate below 1% |
| Latency threshold | p95 below 500 ms |
| Check threshold | checks above 99% |

## Run command

    docker compose run --rm -T k6 run /scripts/smoke-load.js | tee docs/evidence/phase-12/k6-smoke-load.txt

## Result template

Date:

Environment:

Command:

    docker compose run --rm -T k6 run /scripts/smoke-load.js | tee docs/evidence/phase-12/k6-smoke-load.txt

Summary:

- Checks:
- HTTP request failure rate:
- p95 latency:
- Requests per second:
- Notable errors:

Prometheus observations:

- probe_success{job="lfcs-dashboard-synthetic"}:
- probe_duration_seconds{job="lfcs-dashboard-synthetic"}:
- App request rate:
- App error ratio:
- App p95 latency:
- CPU/memory observation:

Capacity note:

Under the current local smoke-load profile, the service passed or failed the defined thresholds. This does not represent production capacity. It is a local validation that the service can handle low controlled traffic while synthetic probes and Prometheus remain functional.

## Evidence files

Expected evidence path:

    docs/evidence/phase-12/k6-smoke-load.txt
