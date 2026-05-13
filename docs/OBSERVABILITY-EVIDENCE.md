# LFCS Study Dashboard — Observability Evidence

This document collects operational evidence for the LFCS Study Dashboard portfolio project.

The goal is to show that this is not only a web application, but an operated Linux service with health checks, readiness checks, structured logs, metrics, dashboards, SLOs, alerting, and runbook documentation.

## Service Summary

| Field | Value |
|---|---|
| Project | LFCS Study Dashboard |
| Purpose | Personal Linux / LFCS study tracking dashboard |
| Frontend | Vite / React |
| Backend | Express / Node |
| Database | SQLite |
| Runtime | Ubuntu VM, systemd |
| Reverse proxy | Nginx |
| Metrics | Prometheus |
| Dashboarding | Grafana |
| Logging | Structured JSON logs to stdout / journald |

## Evidence Checklist

| Evidence | Status |
|---|---|
| `/healthz` response | Captured |
| `/readyz` response | Captured |
| `systemctl status lfcs-dashboard` | Captured |
| structured `journalctl` logs | Captured |
| `sudo nginx -t` | Captured |
| Prometheus service running | Captured |
| Prometheus target UP | Captured |
| Prometheus API target verification | Captured |
| Grafana dashboard overview | Captured |
| Prometheus alert rules loaded | Captured |
| incident note in `docs/incidents/` | Pending |
| AWS deployment evidence | Future phase |
| Terraform evidence | Future phase |
| Kubernetes evidence | Future phase |

## Health Check Evidence

Endpoint:

```text
GET /healthz
```

Expected result:

```json
{
  "ok": true,
  "service": "lfcs-study-dashboard",
  "status": "healthy"
}
```

## Readiness Check Evidence

Endpoint:

```text
GET /readyz
```

Expected result:

```json
{
  "ok": true,
  "service": "lfcs-study-dashboard",
  "status": "ready",
  "checks": {
    "database": "ok"
  }
}
```

## Structured Logging Evidence

The application emits structured JSON request logs to stdout. Because the app runs under systemd, logs are available through `journalctl`.

Useful command:

```bash
sudo journalctl -u lfcs-dashboard -n 50 --no-pager
```

More focused command:

```bash
sudo journalctl -u lfcs-dashboard -n 100 --no-pager | grep '"event":"http_request"'
```

Expected fields:

```text
ts
level
event
request_id
method
path
status
duration_ms
ip
user_agent
```

## Metrics Evidence

Endpoint:

```text
GET /metrics
```

The application exports Prometheus metrics, including HTTP request counters and request-duration histograms.

Important metric names:

```text
lfcs_dashboard_http_requests_total
lfcs_dashboard_http_request_duration_seconds
```

## Prometheus Evidence

Prometheus should show the LFCS Dashboard target as UP.

Useful browser URL:

```text
http://127.0.0.1:9090/classic/targets
```

Useful API verification:

```bash
curl -s http://127.0.0.1:9090/api/v1/targets | grep -A20 lfcs-dashboard
```

## Grafana Evidence

Grafana dashboard evidence should show at minimum:

- request rate
- error ratio
- p95 latency
- service health/readiness
- Prometheus target status if available

## Alerting Evidence

Current alert rule file:

```text
ops/prometheus/lfcs-dashboard-alerts.yml
```

Current intended alerts:

```text
LFCSDashboardDown
LFCSDashboardHighErrorRatio
LFCSDashboardHighLatencyP95
```

## Pending Evidence

The next documentation improvement after this baseline phase is to add incident notes under:

```text
docs/incidents/
```
