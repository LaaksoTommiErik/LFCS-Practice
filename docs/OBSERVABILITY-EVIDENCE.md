# LFCS Study Dashboard — Observability Evidence

This document collects operational evidence for the LFCS Study Dashboard portfolio project.

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
