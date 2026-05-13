

# LFCS Study Dashboard — Observability Evidence

This document collects operational evidence for the LFCS Study Dashboard portfolio project.

The purpose is to show that this project is not only a web application, but an operated Linux service with deployment, health checks, structured logs, metrics, dashboards, SLOs, alerts, and incident-response documentation.

## Service Summary

| Field | Value |
|---|---|
| Project | LFCS Study Dashboard |
| Purpose | Personal Linux / LFCS study tracking dashboard |
| Frontend | Vite / React |
| Backend | Express / Node |
| Database | SQLite |
| Runtime deployment | Ubuntu VM, systemd |
| Reverse proxy | Nginx |
| Metrics | Prometheus |
| Dashboarding | Grafana |
| Operational focus | health checks, readiness checks, structured logs, metrics, dashboards, SLOs, alerts, incident notes |

## Current Operational Capabilities

| Area | Evidence | Status |
|---|---|---|
| Frontend | Vite / React application served as production build | Implemented |
| Backend | Express / Node API | Implemented |
| Database | SQLite persistence for users and progress records | Implemented |
| Authentication | Session-based authentication | Implemented |
| CSRF protection | CSRF token protection for state-changing requests | Implemented |
| Password hashing | Argon2id password hashing | Implemented |
| Admin bootstrap | Scripted admin user creation | Implemented |
| Health endpoint | `/healthz` returns process-level health | Implemented |
| Readiness endpoint | `/readyz` verifies SQLite readiness | Implemented |
| Production serving | Express serves built React frontend from `dist` | Implemented |
| Linux service management | systemd service on Ubuntu VM | Implemented |
| Reverse proxy | Nginx proxies HTTP traffic to Express | Implemented |
| Structured logging | JSON request logs emitted to stdout / journald | Implemented |
| Metrics endpoint | Prometheus `/metrics` endpoint | Implemented |
| Prometheus target | Prometheus scrapes the dashboard target | Implemented |
| Recording rules | Prometheus recording rules for request rate, errors, latency, memory, heap, and CPU | Implemented |
| Grafana dashboard | Dashboard JSON exported to repository | Implemented |
| SLOs | Service-level objectives documented | Implemented |
| Alerts | Prometheus alert rules documented | Implemented |
| AWS deployment | Cloud deployment evidence | Planned |
| Terraform | Infrastructure-as-code evidence | Planned |

## Evidence File Locations

| Evidence type | Location |
|---|---|
| Observability overview | `docs/OBSERVABILITY.md` |
| SLO documentation | `docs/SLO.md` |
| Prometheus recording rules | `ops/prometheus/lfcs-dashboard-rules.yml` |
| Prometheus alert rules | `ops/prometheus/lfcs-dashboard-alerts.yml` |
| Grafana dashboard JSON | `ops/grafana/lfcs-dashboard-observability.json` |
| Screenshot evidence | `docs/evidence/screenshots/` |
| Runbook | `RUNBOOK.md` or `runbook.md` |

## Portfolio Screenshot Checklist

The following screenshots should be collected as the project matures. Items should only be checked after the relevant feature has been implemented and verified.

- [x] `/healthz` response
- [x] `/readyz` response
- [x] `systemctl status lfcs-dashboard`
- [x] `journalctl` structured JSON logs
- [x] `sudo nginx -t`
- [x] Prometheus service running
- [x] Prometheus target UP
- [x] Prometheus API target verification
- [x] Grafana dashboard overview
- [x] Prometheus alert rules loaded
- [ ] incident note in `docs/incidents/`
- [ ] AWS deployment evidence
- [ ] Terraform apply evidence

## Health Check Evidence

### Endpoint

```text
GET /healthz
