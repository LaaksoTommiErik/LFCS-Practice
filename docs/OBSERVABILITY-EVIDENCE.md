# LFCS Study Dashboard — Observability Evidence

This document collects the operational evidence for the LFCS Study Dashboard portfolio project.

The purpose is to show that this project is not only a web application, but an operated Linux service with deployment, health checks, structured logs, metrics, dashboards, SLOs, alerts, and incident-response documentation.

## Service Summary

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
| Readiness endpoint | `/readyz` verifies database readiness | Implemented |
| Production serving | Express serves built React frontend from `dist` | Implemented |
| Linux service management | systemd service on Ubuntu VM | Implemented |
| Reverse proxy | Nginx proxies HTTP traffic to Express | Implemented |
| Structured logging | JSON request logs emitted to stdout / journald | Implemented |
| Metrics | Prometheus `/metrics` endpoint | Implemented |
| Dashboards | Grafana dashboard work started | In progress |
| SLOs | SLO documentation started | In progress |
| Alerts | Alerting documentation started | In progress |

## Portfolio Screenshot Checklist

The following screenshots should be collected as the project matures. Items marked as pending should not be treated as complete until the relevant feature has been implemented and verified.

- [X] `/healthz` response
- [X] `/readyz` response
- [X] `systemctl status lfcs-dashboard`
- [X] `journalctl` structured JSON logs
- [X] `sudo nginx -t`
- [X] Prometheus target UP
- [X] Grafana dashboard overview
- [X] Prometheus alert rules loaded
- [ ] AWS deployment evidence
- [ ] Terraform apply evidence

## Health Check Evidence

### Endpoint

```text
GET /healthz
