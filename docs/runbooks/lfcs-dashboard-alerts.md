# LFCS Dashboard Alert Runbook

This runbook explains how to investigate Prometheus alerts for the LFCS Study Dashboard.

The goal is not to silence alerts quickly. The goal is to identify whether the service is unavailable, degraded, overloaded, or misconfigured, then recover safely and document what happened.

## LFCSDashboardDown

### Meaning

Prometheus cannot scrape the `lfcs-dashboard` target.

Likely causes:

- application container is stopped
- app is unhealthy
- Docker networking is broken
- Prometheus has the wrong scrape target
- port 3000 is not reachable inside the Compose network

### First commands

```bash
docker compose ps
docker compose logs --tail=100 lfcs-dashboard
docker compose logs --tail=100 prometheus
curl -s http://127.0.0.1:3000/healthz
curl -s http://127.0.0.1:3000/readyz
```

### Expected healthy result

- `lfcs-dashboard` is running and healthy
- `/healthz` returns `healthy`
- `/readyz` returns `ready`
- Prometheus target `lfcs-dashboard:3000` is `UP`

### Recovery

```bash
docker compose up -d lfcs-dashboard
docker compose restart prometheus
```

### Verification

```bash
curl -s http://127.0.0.1:9090/api/v1/targets | grep -A20 lfcs-dashboard
```

---

## LFCSDashboardHighErrorRatio

### Meaning

More than 5% of non-`/metrics` HTTP requests are returning 5xx responses.

This is application-level failure, not just a Prometheus scrape issue.

### First commands

```bash
docker compose logs --tail=200 lfcs-dashboard
curl -s http://127.0.0.1:3000/healthz
curl -s http://127.0.0.1:3000/readyz
curl -s http://127.0.0.1:9090/api/v1/query --data-urlencode 'query=sum(rate(lfcs_dashboard_http_requests_total{status_code=~"5..",route!="/metrics"}[5m]))'
```

### Common causes

- database readiness failure
- unhandled backend exception
- bad environment variable
- broken session/auth path
- recent deployment regression

### Recovery

If the app is unhealthy:

```bash
docker compose restart lfcs-dashboard
```

If the database readiness check fails, inspect the data volume and application logs before deleting anything.

Do not run `docker compose down -v` unless intentionally deleting local persistent data.

---

## LFCSDashboardHighLatencyP95

### Meaning

The 95th percentile request duration is above 300ms for 10 minutes.

This means users may be seeing slow responses, even if the service is not fully down.

### First commands

```bash
docker compose ps
docker stats --no-stream
docker compose logs --tail=200 lfcs-dashboard
curl -s http://127.0.0.1:9090/api/v1/query --data-urlencode 'query=histogram_quantile(0.95, sum by (le) (rate(lfcs_dashboard_http_request_duration_seconds_bucket{route!="/metrics"}[5m])))'
```

### Common causes

- CPU pressure
- memory pressure
- slow SQLite operations
- excessive logging
- frontend/API route regression

### Recovery

Restart only if there is a clear stuck process or resource leak:

```bash
docker compose restart lfcs-dashboard
```

Otherwise, preserve logs and metrics for analysis.

---

## LFCSDashboardAvailabilityFastBurn

### Meaning

The service is consuming availability error budget quickly.

This is more serious than a normal warning because the current failure rate would violate the SLO quickly if sustained.

### First commands

```bash
docker compose ps
docker compose logs --tail=300 lfcs-dashboard
curl -s http://127.0.0.1:3000/readyz
curl -s http://127.0.0.1:9090/api/v1/alerts
```

### Recovery priority

1. Restore service health.
2. Confirm 5xx rate is falling.
3. Preserve evidence.
4. Write an incident note if this was caused by a real change.

---

## LFCSDashboardAvailabilitySlowBurn

### Meaning

The service has a lower but sustained error rate.

This is useful because slow degradation can be missed by short-window alerts.

### First commands

```bash
docker compose logs --tail=300 lfcs-dashboard
curl -s http://127.0.0.1:9090/api/v1/query --data-urlencode 'query=sum(rate(lfcs_dashboard_http_requests_total{status_code=~"5..",route!="/metrics"}[30m])) / clamp_min(sum(rate(lfcs_dashboard_http_requests_total{route!="/metrics"}[30m])), 0.001)'
```

### Recovery priority

Investigate recent changes, recurring request paths, and resource usage. Do not treat this as an immediate outage unless user-facing symptoms confirm it.
