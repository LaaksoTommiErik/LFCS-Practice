# LFCS Study Dashboard — Local Quality Gates

This document defines the local verification checks that should pass before deployment, Docker work, CI/CD, or cloud deployment.

## Purpose

The goal is to catch obvious breakage before changes are deployed.

These checks are intentionally simple and maintainable:

- frontend production build
- backend starts cleanly
- frontend root responds
- `/healthz` responds
- `/readyz` responds
- `/metrics` responds
- Prometheus metrics include the expected application request counter

## Scripts

| Script | Purpose |
|---|---|
| `npm run verify:build` | Runs the production frontend build |
| `npm run smoke` | Runs smoke test against default URL `http://127.0.0.1:3000` |
| `npm run smoke:local` | Same as smoke, explicit local URL |
| `scripts/smoke-test.sh <base-url>` | Smoke-tests a running app at a chosen base URL |

## Production-Style Local Verification

Terminal 1:

```bash
npm run build
npm start
