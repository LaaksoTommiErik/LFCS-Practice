# Security and Secrets Policy

This document describes the current security posture of the LFCS Study Dashboard.

The purpose is not to claim enterprise-grade security. The purpose is to document practical security hygiene for a small self-built DevOps / Observability portfolio project.

## Scope

The current project includes:

- React / Vite frontend
- Express / Node backend
- SQLite persistence
- session-based authentication
- CSRF protection
- Argon2id password hashing
- health and readiness endpoints
- Prometheus metrics
- Docker runtime
- Docker Compose local operations stack
- GitHub Actions CI

## Current security controls

| Area | Current control |
|---|---|
| Password storage | Argon2id password hashing |
| Session handling | Express session middleware |
| CSRF protection | CSRF middleware for state-changing requests |
| HTTP headers | Helmet dependency is present |
| Brute-force reduction | express-rate-limit dependency is present |
| Secrets in Git | `.env` is ignored by `.gitignore` |
| Container runtime | Docker image runs as non-root `node` user |
| Build verification | GitHub Actions runs install, build, smoke tests, Docker build, and container endpoint checks |
| Dependency updates | Dependabot checks npm and GitHub Actions dependencies |
| Image scanning | Trivy scans the Docker image in CI as a non-blocking report |

## Secrets policy

Real secrets must not be committed to Git.

Files that must not contain real secrets:

```text
.env
.env.*
local override files
database files
terminal transcripts containing passwords
screenshots containing passwords
```

The repository includes `.env.example` only as documentation.

## Required local environment variables

```text
PORT
SESSION_SECRET
ADMIN_EMAIL
ADMIN_INITIAL_PASSWORD
GRAFANA_ADMIN_USER
GRAFANA_ADMIN_PASSWORD
```

## Generate a session secret

Use:

```bash
openssl rand -base64 48
```

Example usage:

```bash
cp .env.example .env
nano .env
```

Then replace:

```text
SESSION_SECRET=change-this-session-secret
```

with a generated value.

## Docker Compose credentials

The Compose stack supports local `.env` overrides.

The defaults in `compose.yml` are demo-only fallbacks. They are acceptable for local portfolio development but must not be used for public deployment.

Production-like deployments should inject secrets through a proper mechanism such as:

- GitHub Actions secrets
- AWS SSM Parameter Store
- AWS Secrets Manager
- Docker secrets
- Kubernetes Secrets
- ECS task secrets

## Dependency hygiene

Dependabot is enabled for:

- npm dependencies
- GitHub Actions

GitHub Actions also runs a Trivy image scan after building the Docker image.

The initial Trivy scan is non-blocking. This is intentional. The next step after reviewing findings is to decide which severities should fail CI.

## Known limitations

This project is not yet production-secure.

Known limitations:

```text
No public TLS deployment yet
No cloud secret manager yet
No production identity provider
No external WAF
No backup/restore workflow yet
No formal vulnerability management SLA
No branch protection policy enforced in repository settings yet
Grafana local credentials are demo-grade unless overridden
SQLite is local single-node storage
```

## Production-safe versus demo-grade

Current production-style practices:

```text
non-root Docker runtime
health/readiness endpoints
CI build and smoke checks
dependency update automation
image vulnerability scanning report
documented secrets policy
```

Current demo-grade practices:

```text
local SQLite
local Docker Compose credentials
no TLS
no cloud secret manager
no external incident management integration
no backup/restore proof
```

## Incident and vulnerability response

For this portfolio project:

1. Identify the affected dependency, image, or configuration.
2. Reproduce the finding locally or in CI.
3. Create a small PR with the fix.
4. Confirm CI passes.
5. Document the fix in the PR body.
6. If the issue affected a deployed environment, write an incident note.

## Security review checklist

Before merging infrastructure or runtime changes:

```text
[ ] No real secrets committed
[ ] .env remains ignored
[ ] Docker image still runs as non-root
[ ] /healthz still works
[ ] /readyz still works
[ ] /metrics still works
[ ] CI passes
[ ] Trivy scan reviewed
[ ] README or docs updated if behavior changed
```
