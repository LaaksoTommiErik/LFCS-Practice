# LFCS Study Dashboard

![CI](https://github.com/LaaksoTommiErik/LFCS-Practice/actions/workflows/ci.yml/badge.svg)

## Overview

LFCS Study Dashboard is an observability-focused DevOps portfolio project.

It started as a personal Linux Foundation Certified System Administrator study tracker, but has been expanded into a production-style service operations case study.

The purpose is to demonstrate that a service can be:

- built
- containerized
- instrumented
- monitored
- alerted on
- backed up
- restored
- broken intentionally
- recovered
- documented through runbooks and incident notes

This is a portfolio environment with local and AWS baseline deployment evidence, not a claim of real production on-call experience.

## Project Highlights

- Full-stack web service built with React, Vite, Express, Node.js, and PostgreSQL.
- Session-based authentication with CSRF protection and Argon2id password hashing.
- PostgreSQL-backed persistence for users, sessions, and LFCS progress records.
- Docker production-style runtime and Docker Compose operations stack.
- Prometheus metrics, Grafana dashboards, SLO-oriented alert rules, and Blackbox synthetic monitoring.
- Alertmanager notification routing to a local webhook receiver with generated alert-delivery evidence.
- Tested PostgreSQL backup and restore workflow with destructive restore verification.
- Controlled incident simulation with Prometheus detection, Alertmanager delivery, service recovery, and postmortem documentation.
- GitHub Actions CI for build, smoke testing, PostgreSQL-backed verification, Docker validation, and security scanning.
- Terraform-managed AWS EC2 baseline deployment with Docker Compose, public health/readiness verification, EC2-local observability checks, and documented teardown.
- Operational documentation including runbooks, SLOs, release notes, evidence files, and incident reports.

## Why This Project Exists

Most beginner projects stop at application functionality.

This project focuses on the operational layer around the application:

- Can the service start reliably?
- Can the service expose health and readiness?
- Can Prometheus scrape useful metrics?
- Can dashboards show service behavior?
- Can alerts detect failure?
- Can Alertmanager route notifications?
- Can data be backed up and restored?
- Can an incident be detected, mitigated, verified, and documented?

The goal is to build evidence for junior Observability Engineer, DevOps Engineer, Cloud Operations, and SRE-adjacent roles.

## Current Architecture

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Database | PostgreSQL, pg |
| Authentication | express-session, PostgreSQL session store, CSRF protection |
| Password security | Argon2id |
| Container runtime | Docker |
| Local operations stack | Docker Compose |
| Metrics | Prometheus, prom-client |
| Dashboards | Grafana |
| Synthetic monitoring | Prometheus Blackbox Exporter |
| Alert routing | Alertmanager |
| Alert evidence receiver | Local Node.js webhook receiver |
| Load testing | k6 smoke-load test |
| CI/CD evidence | GitHub Actions |
| Cloud baseline | AWS EC2 |
| Infrastructure as Code | Terraform |
| Linux deployment evidence | Ubuntu, systemd, Nginx |
| Documentation | Runbooks, SLOs, incident notes, evidence files |

See the full architecture document:

    docs/ARCHITECTURE.md

## Operations Stack

The local Docker Compose stack includes:

| Service | Purpose |
|---|---|
| lfcs-dashboard | Express/Node application serving the React production build |
| postgres | PostgreSQL database for users, sessions, and progress |
| prometheus | Metrics scraping and alert rule evaluation |
| grafana | Dashboards and visualization |
| blackbox | Synthetic endpoint checks |
| alertmanager | Alert grouping, routing, and notification dispatch |
| alert-webhook | Local webhook receiver for Alertmanager evidence |
| k6 | Local smoke-load testing |

Start the stack:

    docker compose up -d --build

Use an alternate app host port when local port 3000 is already in use:

    LFCS_DASHBOARD_PORT=3002 docker compose up -d --build

## AWS / Terraform Baseline Deployment

Phase 15A added a reproducible AWS baseline deployment.

The AWS baseline provisions one Ubuntu EC2 host with Terraform, installs Docker through `user_data`, deploys the existing Docker Compose stack, exposes the app through public HTTP on port 80, and verifies the observability stack from the EC2 host-local network.

This is intentionally a baseline cloud deployment, not a production-grade multi-AZ AWS architecture.

### What the AWS deployment proves

- Terraform can provision the EC2 baseline.
- SSH ingress is restricted to the operator public IP `/32`.
- Public ingress is limited to HTTP port 80 for the dashboard.
- The EC2 instance requires IMDSv2.
- The root EBS volume is encrypted.
- Docker is installed automatically through EC2 `user_data`.
- The Docker Compose stack runs on the EC2 host.
- Public `/healthz` works.
- Public `/readyz` works and verifies PostgreSQL readiness.
- `/metrics` works from the EC2-local path.
- Prometheus, Grafana, Alertmanager, Blackbox Exporter, and the local alert webhook are reachable from the EC2 host.
- Terraform teardown was executed after evidence collection.

### AWS documentation and evidence

| Document | Purpose |
|---|---|
| `infra/aws/README.md` | Terraform baseline documentation |
| `docs/runbooks/aws-ec2-deployment.md` | AWS EC2 deployment and teardown runbook |
| `docs/evidence/phase-15a/aws-ec2-deployment-evidence.md` | Public endpoint, Compose, metrics, observability, and security group evidence |
| `docs/evidence/phase-15a/aws-ec2-teardown-evidence.md` | Terraform destroy evidence |

### AWS scope limitations

The current AWS deployment does not include DNS, TLS, ALB, RDS, ECS, EKS, S3 backups, Secrets Manager, Terraform remote state, or multi-AZ architecture. Those are intentionally left for later phases.

## Operational Endpoints

| Endpoint | Purpose |
|---|---|
| /healthz | Process-level health check |
| /readyz | Readiness check including PostgreSQL query |
| /metrics | Prometheus metrics |
| /api/csrf-token | CSRF token |
| /api/login | Login |
| /api/logout | Logout |
| /api/current-user | Current authenticated user |
| /api/progress | User progress persistence |

Example checks:

    curl -fsS http://127.0.0.1:3002/healthz
    curl -fsS http://127.0.0.1:3002/readyz
    curl -fsS http://127.0.0.1:3002/metrics | head

## Observability Capabilities

| Capability | Status | Evidence |
|---|---|---|
| Structured JSON request logs | Implemented | RUNBOOK.md |
| Prometheus /metrics endpoint | Implemented | docs/OBSERVABILITY-EVIDENCE.md |
| Grafana dashboarding | Implemented | ops/grafana/ |
| SLO documentation | Implemented | docs/SLO.md |
| Prometheus alert rules | Implemented | ops/prometheus/alerts/ |
| Synthetic monitoring | Implemented | docs/SYNTHETIC-MONITORING.md |
| Alertmanager routing | Implemented | docs/evidence/phase-14a/alertmanager-routing-test.md |
| Incident simulation | Implemented | docs/incidents/INCIDENT-001-lfcs-dashboard-outage-drill.md |
| Backup and restore testing | Implemented | docs/evidence/phase-13/restore-test.md |

## Reliability and Recovery

The project includes a tested PostgreSQL recovery workflow.

Backup script:

    scripts/backup-postgres.sh

Restore script:

    scripts/restore-postgres.sh

Automated restore test:

    npm run test:postgres-restore

The restore test proves:

- marker data exists before backup
- backup file is created
- marker data is deleted
- restore is executed
- required PostgreSQL tables exist after restore
- /readyz returns ready after restore
- deleted marker data returns after restore

Recovery documentation:

    docs/runbooks/backup-restore.md
    docs/runbooks/rollback.md
    docs/evidence/phase-13/restore-test.md

## Alerting and Incident Response

The project includes local Alertmanager routing.

Alert path:

    Prometheus alert rule
    -> Alertmanager
    -> local webhook receiver
    -> evidence file

Alertmanager verification:

    npm run test:alertmanager-routing

Incident drill:

    npm run test:incident-app-outage

The incident drill proves:

- controlled service outage
- Prometheus detects LFCSDashboardDown
- Alertmanager routes the alert
- webhook receiver records the alert
- service is restarted
- /readyz returns ready after recovery
- postmortem is generated

Incident documentation:

    docs/runbooks/incident-response.md
    docs/incidents/README.md
    docs/incidents/INCIDENT-001-lfcs-dashboard-outage-drill.md
    docs/evidence/phase-14b/incident-app-outage-evidence.md

## Verification Commands

Core local checks:

    npm run build
    npm run smoke:local

Operational drills:

    npm run test:postgres-restore
    npm run test:alertmanager-routing
    npm run test:incident-app-outage

Docker Compose validation:

    docker compose -f compose.yml config

Prometheus and Alertmanager checks:

    curl -fsS http://127.0.0.1:9090/api/v1/alerts
    curl -fsS http://127.0.0.1:9090/api/v1/alertmanagers
    curl -fsS http://127.0.0.1:9093/-/ready
    curl -fsS http://127.0.0.1:9094/healthz
    curl -fsS http://127.0.0.1:9094/events

## Documentation Index

| Document | Purpose |
|---|---|
| docs/ARCHITECTURE.md | Current architecture |
| RUNBOOK.md | General operational runbook |
| docs/COMPOSE-OPERATIONS.md | Docker Compose operations stack |
| docs/DOCKER.md | Docker runtime documentation |
| docs/SLO.md | Service Level Objectives and SLIs |
| docs/SYNTHETIC-MONITORING.md | Blackbox synthetic monitoring |
| docs/runbooks/alertmanager-routing.md | Alertmanager routing runbook |
| docs/runbooks/incident-response.md | Incident response workflow |
| docs/runbooks/backup-restore.md | PostgreSQL backup and restore |
| docs/runbooks/rollback.md | Code and data rollback |
| docs/incidents/README.md | Incident index |
| docs/incidents/INCIDENT-001-lfcs-dashboard-outage-drill.md | Controlled outage postmortem |
| docs/OBSERVABILITY-EVIDENCE.md | Observability evidence index |
| docs/LOCAL-QUALITY-GATES.md | Local quality gates |
| docs/SECURITY.md | Security and secrets policy |
| docs/RELEASE.md | Release and change management |
| docs/PHASE-15B-AWS-PORTFOLIO-SUMMARY.md | Employer-facing AWS deployment summary |

## Evidence Highlights

| Evidence | File |
|---|---|
| PostgreSQL backup and restore test | docs/evidence/phase-13/restore-test.md |
| Alertmanager routing test | docs/evidence/phase-14a/alertmanager-routing-test.md |
| Incident outage drill evidence | docs/evidence/phase-14b/incident-app-outage-evidence.md |
| Load-test evidence | docs/evidence/phase-12/ |
| Observability evidence checklist | docs/OBSERVABILITY-EVIDENCE.md |
| AWS EC2 Terraform deployment evidence | docs/evidence/phase-15a/aws-ec2-deployment-evidence.md |
| AWS EC2 Terraform teardown evidence | docs/evidence/phase-15a/aws-ec2-teardown-evidence.md |

## Local Admin User

The app does not include a hardcoded default admin account.

For Docker Compose, create an admin user inside the running app container:

    docker compose exec \
      -e ADMIN_EMAIL="admin@example.com" \
      -e ADMIN_INITIAL_PASSWORD="change-this-local-password" \
      lfcs-dashboard npm run create-admin-user

If the email already exists, the script will not reset the password. Use a different email or add a proper password reset/admin maintenance script later.

## PostgreSQL Connection Note

Host local development should typically use a localhost DATABASE_URL:

    postgresql://USER:PASS@127.0.0.1:5432/DBNAME

Docker Compose app containers should use the Compose service hostname:

    postgresql://lfcs:lfcs@postgres:5432/lfcs_dashboard

Inside a container, 127.0.0.1 points to that same container, not the PostgreSQL service.

## Current Limitations

This is a portfolio environment, not a production service with real users or on-call obligations.

Current limitations:

- no real production users
- no real production on-call rotation
- no Kubernetes deployment yet
- no DNS/TLS-backed public production URL yet
- no production-grade AWS architecture yet
- no distributed tracing pipeline yet
- no centralized log backend such as Loki or Elasticsearch yet
- no external notification integration such as Slack, PagerDuty, Opsgenie, or incident.io yet
- local secrets and example credentials are for development only

These are known gaps, not hidden claims.

## Roadmap

High-value next improvements:

1. Add a database-readiness incident drill where /healthz stays healthy but /readyz fails.
2. Add Loki or another log aggregation path.
3. Add basic OpenTelemetry tracing.
4. Add Kubernetes monitoring basics.
5. Add DNS/TLS and a more production-like AWS edge layer.
6. Add external notification routing later, such as Slack or PagerDuty-style integration.

## Portfolio Framing

This repository is best understood as a practical operations case study.

It demonstrates preparation for junior roles involving:

- observability
- DevOps
- cloud operations
- platform engineering
- SRE-adjacent work

It does not claim professional production experience. It shows structured, reproducible, hands-on preparation for that environment.
