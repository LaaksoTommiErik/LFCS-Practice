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
| README does not fully explain operational value | Employers may miss DevOps/SRE relevance | Rewrite README around architecture, operations, and evidence |
| Duplicate runbook files | Confusing documentation structure | Consolidate into `RUNBOOK.md` |
| Evidence documentation needs cleanup | Portfolio evidence looks unfinished | Rewrite `docs/OBSERVABILITY-EVIDENCE.md` cleanly |
| SLO documentation needs cleanup | SLOs look pasted rather than authored | Rewrite `docs/SLO.md` cleanly |
| Missing architecture document | Hard to understand system quickly | Add `docs/ARCHITECTURE.md` |
| Missing incident notes | Less SRE-like portfolio | Add incident notes after real bugs/outages |
| No Docker/AWS/Terraform/Kubernetes yet | Acceptable for current phase | Add only after baseline is clean |

## Phase 1 Exit Criteria

This phase is complete when:

- README explains the project as an operated Linux service.
- Architecture diagram is present.
- Runbook is canonical and not duplicated.
- Observability evidence document is clean and complete.
- SLO document has no pasted shell commands or broken Markdown.
- GitHub `main` branch renders documentation cleanly.
