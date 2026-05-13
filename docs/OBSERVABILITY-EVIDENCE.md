docs/clean-slo-and-evidence-docs


# LFCS Study Dashboard — Observability Evidence

This document collects operational evidence for the LFCS Study Dashboard portfolio project.
=======
# LFCS Study Dashboard — Observability Evidence

This document collects the operational evidence for the LFCS Study Dashboard portfolio project.
docs/clean-slo-and-evidence-docs
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
=======
**Project:** LFCS Study Dashboard  
**Purpose:** Personal Linux / LFCS study tracking dashboard  
**Architecture:** Vite + React frontend, Express / Node backend, SQLite persistence  
**Deployment target:** Ubuntu VM, systemd service, Nginx reverse proxy  
**Operational focus:** health checks, readiness checks, structured logs, Prometheus metrics, Grafana dashboards, SLOs, alerting, runbooks, incident notes


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
main
| Production serving | Express serves built React frontend from `dist` | Implemented |
| Linux service management | systemd service on Ubuntu VM | Implemented |
| Reverse proxy | Nginx proxies HTTP traffic to Express | Implemented |
| Structured logging | JSON request logs emitted to stdout / journald | Implemented |

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
