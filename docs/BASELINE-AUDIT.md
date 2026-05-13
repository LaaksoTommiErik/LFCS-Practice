# LFCS Study Dashboard — Baseline Audit

This document records the current project state before adding Docker, AWS, Terraform, Kubernetes, or expanded observability.

## Baseline Date

2026-05-13

## Current Capabilities

| Area | Status | Evidence |
|---|---|---|
| Frontend | Implemented | Vite / React application |
| Backend | Implemented | Express / Node server |
| Database | Implemented | SQLite persistence |
| Authentication | Implemented | Session-based auth |
| CSRF protection | Implemented | CSRF token flow for state-changing requests |
| Password hashing | Implemented | Argon2id |
| Admin bootstrap | Implemented | Admin creation script |
| Health endpoint | Implemented | `/healthz` |
| Readiness endpoint | Implemented | `/readyz` checks SQLite |
| Production serving | Implemented | Express serves built frontend from `dist/` |
| Linux service | Implemented | systemd service |
| Reverse proxy | Implemented | Nginx proxies to Express |
| Structured logs | Implemented | JSON logs to stdout / journald |
| Metrics | Implemented | Prometheus `/metrics` endpoint |
| Dashboards | Started | Grafana dashboard work |
| SLOs | Started | SLO documentation |
| Alerts | Started | Prometheus alert rules |

## Current Weaknesses

| Weakness | Impact | Fix |
|---|---|---|
| Documentation quality needs review | Employers may miss the operational value | Keep README, architecture, runbook, SLOs, and evidence docs clean |
| Incident documentation is not yet complete | Less SRE-like evidence | Add incident notes under `docs/incidents/` |
| Docker is not yet added | Future packaging gap | Add after baseline is clean |
| AWS is not yet added | Future cloud deployment gap | Add after Docker or direct VM deployment plan |
| Terraform is not yet added | Future infrastructure-as-code gap | Add after AWS baseline |
| Kubernetes is not yet added | Future orchestration gap | Add after Docker and AWS fundamentals |

## Phase 1 Exit Criteria

This phase is complete when:

- README explains the project as an operated Linux service.
- Architecture diagram is present.
- Runbook is canonical and readable.
- Observability evidence document is clean and complete.
- SLO document has no pasted shell commands or broken Markdown.
- GitHub `main` branch renders documentation cleanly.
