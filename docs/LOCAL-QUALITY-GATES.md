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
| `npm run smoke:local` | Runs smoke test against `http://127.0.0.1:3000` |
| `scripts/smoke-test.sh <base-url>` | Smoke-tests a running app at a chosen base URL |

## Production-Style Local Verification

Terminal 1:

```bash
npm run build
npm start
```

Terminal 2:

```bash
npm run smoke:local
```

Expected result:

```text
Smoke test result: OK
```

## systemd Verification

When the app is running under systemd:

```bash
sudo systemctl status lfcs-dashboard --no-pager
npm run smoke:local
```

Expected result:

```text
active (running)
Smoke test result: OK
```

## Nginx Verification

When Nginx proxies port 80 to the app:

```bash
npm run smoke -- http://127.0.0.1
```

Expected result:

```text
Smoke test result: OK
```

## What the Smoke Test Checks

| Check | Expected |
|---|---|
| `/` | HTTP 200 |
| `/healthz` | HTTP 200 and response contains `healthy` |
| `/readyz` | HTTP 200 and response contains `ready` |
| `/metrics` | HTTP 200 |
| `/metrics` content | contains `lfcs_dashboard_http_requests_total` |

## Common Failure Modes

### App is not running

Symptom:

```text
HTTP status: 000
Smoke test result: FAILED
```

Fix:

```bash
npm start
```

or:

```bash
sudo systemctl start lfcs-dashboard
```

### Port 3000 is already in use

Symptom:

```text
EADDRINUSE: address already in use :::3000
```

Fix:

```bash
ss -ltnp | grep 3000
sudo systemctl stop lfcs-dashboard
```

Then start the app manually again.

### Build fails

Symptom:

```bash
npm run build
```

exits with an error.

Fix the frontend compile error before deployment.

### Metrics check fails

Symptom:

```text
Metrics content did not contain lfcs_dashboard_http_requests_total
```

Likely causes:

- app is not the expected version
- `/metrics` route is broken
- metrics instrumentation changed

Check:

```bash
curl -s http://127.0.0.1:3000/metrics | head -n 40
```

## Rule

A change is not locally verified until both commands pass:

```bash
npm run build
npm run smoke:local
```
