# LFCS Study Dashboard — Alerting

This document describes the Prometheus alerting rules for the LFCS Study Dashboard.

## Purpose

The alerting layer turns metrics into operational judgment.

Dashboards answer: "What is happening?"

Alerts answer: "Should an operator act now?"

Runbooks answer: "What should the operator do first?"

## Alert Rule Location

Prometheus alert rules are stored in:

```text
ops/prometheus/alerts/lfcs-dashboard-alerts.yml
```

Prometheus loads the rules through:

```text
ops/prometheus/prometheus.yml
```

The Docker Compose stack mounts the alert rules into the Prometheus container at:

```text
/etc/prometheus/alerts
```

## RED Metrics

| RED Area | Metric / Query |
|---|---|
| Rate | `sum(rate(lfcs_dashboard_http_requests_total{route!="/metrics"}[5m]))` |
| Errors | `sum(rate(lfcs_dashboard_http_requests_total{status_code=~"5..",route!="/metrics"}[5m]))` |
| Duration | `histogram_quantile(0.95, sum by (le) (rate(lfcs_dashboard_http_request_duration_seconds_bucket{route!="/metrics"}[5m])))` |

## USE-Style Resource Metrics

Current available resource metrics come from Node.js and process default metrics exposed through `prom-client`.

| USE Area | Example Metric |
|---|---|
| Utilization | `rate(lfcs_dashboard_process_cpu_user_seconds_total[5m])` |
| Saturation | Not fully covered yet without container/host exporter metrics |
| Errors | Application 5xx metrics through `lfcs_dashboard_http_requests_total` |
| Memory | `lfcs_dashboard_process_resident_memory_bytes` |
| Heap | `lfcs_dashboard_nodejs_heap_size_used_bytes` |

This is sufficient for a junior local Compose portfolio stack, but not complete production host monitoring. A later phase should add cAdvisor or node_exporter for stronger container/host USE metrics.

## SLOs

| SLO | Target |
|---|---|
| Availability | 99.0% successful non-`/metrics` requests |
| Error ratio | Less than 5% 5xx responses over 5 minutes |
| Latency | p95 below 300ms over 5 minutes |
| Readiness | `/readyz` remains ready during normal operation |

## Alerts

| Alert | Severity | Why it is actionable |
|---|---|---|
| `LFCSDashboardDown` | critical | The app cannot be scraped, so the service may be down or unreachable. |
| `LFCSDashboardHighErrorRatio` | warning | The app is returning too many server errors. |
| `LFCSDashboardHighLatencyP95` | warning | Users may be experiencing slow responses. |
| `LFCSDashboardAvailabilityFastBurn` | critical | The availability error budget is being consumed rapidly. |
| `LFCSDashboardAvailabilitySlowBurn` | warning | The service has sustained degradation that may otherwise be missed. |

## Verification

Check that Prometheus loaded the rules:

```bash
curl -s http://127.0.0.1:9090/api/v1/rules
```

Check active alerts:

```bash
curl -s http://127.0.0.1:9090/api/v1/alerts
```

Check targets:

```bash
curl -s http://127.0.0.1:9090/api/v1/targets
```

## Limitation

This project currently has Prometheus alert rules but no Alertmanager notification routing. That is acceptable for this phase because the goal is to prove SLO logic and alert definitions first. A later phase can add Alertmanager, contact points, and notification routing.

