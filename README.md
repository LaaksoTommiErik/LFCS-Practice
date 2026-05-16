# LFCS Study Dashboard

![CI](https://github.com/LaaksoTommiErik/LFCS-Practice/actions/workflows/ci.yml/badge.svg)

A Linux / SRE / DevOps portfolio project for tracking LFCS study progress while practicing real operational engineering: authentication, persistence, health checks, readiness checks, structured logs, metrics, dashboards, SLOs, alerting, and Linux service deployment.

## Project Purpose

This project is both:

1. A personal LFCS study dashboard.
2. A portfolio artifact showing practical DevOps / Observability / SRE skills.

The goal is to demonstrate that the application is not only built, but also operated, verified, monitored, documented, and prepared for future cloud deployment.

## Current Architecture

See: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Current Capabilities

| Area | Status |
|---|---|
| React / Vite frontend | Implemented |
| Express / Node backend | Implemented |
| SQLite persistence | Implemented |
| Session authentication | Implemented |
| CSRF protection | Implemented |
| Argon2id password hashing | Implemented |
| Admin bootstrap script | Implemented |
| `/healthz` health endpoint | Implemented |
| `/readyz` readiness endpoint | Implemented |
| Production frontend serving from Express | Implemented |
| Ubuntu systemd deployment | Implemented |
| Nginx reverse proxy | Implemented |
| Structured JSON logs | Implemented |
| Prometheus `/metrics` endpoint | Implemented |
| Grafana dashboarding | Started |
| SLO documentation | Started |
| Prometheus alert rules | Started |
| Local quality gates | Started |

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Database | SQLite, better-sqlite3 |
| Authentication | express-session, SQLite session store, CSRF protection |
| Security | Helmet, rate limiting, Argon2id password hashing |
| Linux operations | Ubuntu, systemd, Nginx |
| Observability | structured logs, Prometheus, Grafana, SLOs, alert rules |

## Local Development

```bash
cp .env.example .env
npm install
npm run create-admin-user
npm run dev
```

## Production-Style Local Run

```bash
npm install
npm run build
npm start
```

## Operational Endpoints

| Endpoint | Purpose |
|---|---|
| `/healthz` | Process-level health check |
| `/readyz` | Readiness check including SQLite |
| `/metrics` | Prometheus metrics |
| `/api/csrf-token` | CSRF token |
| `/api/login` | Login |
| `/api/logout` | Logout |
| `/api/current-user` | Current authenticated user |
| `/api/progress` | User progress persistence |

## Verification

When running directly on Express:

```bash
curl http://127.0.0.1:3000/healthz
curl http://127.0.0.1:3000/readyz
curl http://127.0.0.1:3000/metrics | head
```

When running behind Nginx:

```bash
curl http://127.0.0.1/healthz
curl http://127.0.0.1/readyz
```

Expected `/healthz` result:

```json
{
  "ok": true,
  "service": "lfcs-study-dashboard",
  "status": "healthy"
}
```

Expected `/readyz` result:

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


## Local Quality Gates

Before deployment or containerization, verify the service locally with:

```bash
npm run build
npm run smoke:local
```

The smoke test expects the app to be running and checks the frontend root, `/healthz`, `/readyz`, and `/metrics`.

## Frontend Polish

The frontend includes:
- top navigation
- dashboard summary with progress score
- status badges and operational links
- task detail panels with evidence capture
- strict grading prompt copy/preview workflow
- responsive layout for dashboard and detail views

## Docker runtime

The LFCS Study Dashboard includes a Docker production-style runtime.

The Docker image:

- builds the React frontend
- runs the Express/Node backend
- serves the production frontend from `dist/`
- exposes `/healthz`, `/readyz`, and `/metrics`
- runs as a non-root user
- persists SQLite data through a Docker volume
- includes a container healthcheck

Build and run:

```bash
docker compose up -d --build
```

## Documentation

| Document | Purpose |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | Current system architecture |
| [Baseline Audit](docs/BASELINE-AUDIT.md) | Current project state before Docker, AWS, Terraform, and Kubernetes |
| [Runbook](RUNBOOK.md) | Operational commands and deployment notes |
| [SLOs](docs/SLO.md) | Service Level Objectives and SLIs |
| [Observability Evidence](docs/OBSERVABILITY-EVIDENCE.md) | Portfolio evidence checklist |
| [Local Quality Gates](docs/LOCAL-QUALITY-GATES.md) | Local build and smoke-test verification |
| [Docker Runtime](docs/DOCKER.md) | Docker build, run, logs, healthcheck, SQLite volume, and container verification |
| [Compose Operations Stack](docs/COMPOSE-OPERATIONS.md) | Local app, Prometheus, Grafana, datasource provisioning, and dashboard-as-code |
| [Security and Secrets Policy](docs/SECURITY.md) | Security posture, secrets policy, dependency hygiene, and known limitations |
| [Release and Change Management](docs/RELEASE.md) | PR workflow, release tags, rollback notes, and branch protection policy |

## Portfolio Evidence

See: [docs/OBSERVABILITY-EVIDENCE.md](docs/OBSERVABILITY-EVIDENCE.md)

Evidence currently focuses on:

- health checks
- readiness checks
- systemd service status
- Nginx reverse proxy
- structured JSON logs
- Prometheus metrics
- Grafana dashboards
- SLO and alert documentation

## Roadmap

Current phase:

- clean baseline documentation
- make current architecture explainable
- repair observability and SLO documentation
- consolidate runbook documentation

Future phases:

- Docker
- AWS deployment
- Terraform
- Kubernetes
- expanded observability
- incident response documentation
