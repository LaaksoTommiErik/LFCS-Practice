# LFCS Study Dashboard

A Linux / SRE / DevOps portfolio project for tracking LFCS study progress while practicing real operational engineering: authentication, persistence, health checks, readiness checks, structured logs, metrics, dashboards, SLOs, alerting, and Linux service deployment.

## Project Purpose

This project is both:

1. A personal LFCS study dashboard.
2. A portfolio artifact showing practical DevOps / Observability / SRE skills.

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

## Technology Stack

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: SQLite, better-sqlite3
- Authentication: express-session, SQLite session store, CSRF protection
- Security: Helmet, rate limiting, Argon2id password hashing
- Operations: Ubuntu, systemd, Nginx
- Observability: structured logs, Prometheus, Grafana, SLOs, alert rules

## Local Development

bash
cp .env.example .env
npm install
npm run create-admin-user
npm run dev
```
```
### Production-Style Local Run

npm install
npm run build
npm start

### Operational Endpoints

Endpoint	        Purpose
/healthz	        Process-level health check
/readyz	            Readiness check including SQLite
/metrics	        Prometheus metrics
/api/csrf-token	    CSRF token
/api/login	        Login
/api/logout	        Logout
/api/current-user	Current authenticated user
/api/progress	    User progress persistence
