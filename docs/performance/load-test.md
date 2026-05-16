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

## Observed result: Phase 12A local smoke load test

| Metric | Result |
|---|---|
| Total checks | 360 |
| Checks succeeded | 360 out of 360 |
| Checks failed | 0 out of 360 |
| Check success rate | 100.00% |
| HTTP request failure rate | 0.00% |
| HTTP requests | 360 |
| Request rate | 11.764415 requests/second |
| Average request duration | 2.02 ms |
| p95 request duration | 4.28 ms |
| Max request duration | 11.57 ms |
| Completed iterations | 90 |
| Interrupted iterations | 0 |

Endpoint checks:

| Endpoint | Result |
|---|---|
| / | Returned 2xx |
| /login | Returned 2xx |
| /healthz | Returned 2xx |
| /readyz | Returned 2xx |

Threshold result:

| Threshold | Result |
|---|---|
| checks rate greater than 0.99 | Passed |
| http_req_failed rate less than 0.01 | Passed |
| http_req_duration p95 less than 500 ms | Passed |

## Interpretation

The LFCS Study Dashboard passed the local smoke-load test under a deliberately small controlled load.

This is not a production capacity claim. It only proves that the service can handle low local traffic while the synthetic monitoring and Prometheus stack remain functional.

The result is useful as portfolio evidence because it shows a basic operational loop:

    deploy service
    probe service
    generate traffic
    observe success and latency
    save evidence
    document result

## Evidence files

Raw k6 output:

    docs/evidence/phase-12/k6-smoke-load.txt

Synthetic monitoring dashboard:

    ops/grafana/dashboards/lfcs-synthetic-monitoring.json

Recommended screenshots:

    docs/evidence/screenshots/phase-12b-grafana-synthetic-dashboard.png
    docs/evidence/screenshots/phase-12b-prometheus-probe-success.png
    docs/evidence/screenshots/phase-12b-prometheus-probe-duration.png
