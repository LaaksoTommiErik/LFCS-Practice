# Runbook: Synthetic Monitoring

## Scope

This runbook covers local Prometheus Blackbox Exporter probes for the LFCS Study Dashboard.

## Signals

Primary Prometheus queries:

    probe_success{job="lfcs-dashboard-synthetic"}

    probe_duration_seconds{job="lfcs-dashboard-synthetic"}

## LFCSDashboardSyntheticProbeFailed

### Meaning

A synthetic probe has failed for at least 2 minutes.

This means Blackbox Exporter could not successfully reach one of the configured endpoints.

### First checks

Check running services:

    docker compose ps

Check app endpoints directly from the host:

    curl -fsS http://127.0.0.1:3000/healthz
    curl -fsS http://127.0.0.1:3000/readyz

Check Blackbox directly:

    curl -fsS "http://127.0.0.1:9115/probe?target=http://lfcs-dashboard:3000/healthz&module=http_2xx" | grep probe_success

Check Prometheus query API:

    curl -G -fsS "http://127.0.0.1:9090/api/v1/query" \
      --data-urlencode 'query=probe_success{job="lfcs-dashboard-synthetic"}'

### Likely causes

| Cause | Check | Fix |
|---|---|---|
| App container down | docker compose ps | docker compose up -d --build |
| App unhealthy | docker logs lfcs-dashboard | inspect app logs and readiness output |
| Blackbox container down | docker compose ps blackbox | docker compose up -d blackbox |
| Bad Prometheus relabel config | Prometheus targets page | fix ops/prometheus/prometheus.yml |
| Endpoint returns non-2xx | direct curl | fix route or expected endpoint behavior |

### Recovery

Restart the local stack:

    docker compose up -d --build
    docker compose ps

Then verify synthetic success:

    curl -G -fsS "http://127.0.0.1:9090/api/v1/query" \
      --data-urlencode 'query=probe_success{job="lfcs-dashboard-synthetic"}'

## LFCSDashboardSyntheticProbeSlow

### Meaning

A synthetic probe has taken longer than 1 second for at least 5 minutes.

### First checks

Check probe duration:

    curl -G -fsS "http://127.0.0.1:9090/api/v1/query" \
      --data-urlencode 'query=probe_duration_seconds{job="lfcs-dashboard-synthetic"}'

Check container resource usage:

    docker stats --no-stream

Check recent app logs:

    docker logs lfcs-dashboard --tail 100

### Likely causes

| Cause | Check | Fix |
|---|---|---|
| App slow | request duration metrics | inspect backend route and logs |
| VM overloaded | docker stats --no-stream | stop unnecessary services or increase VM resources |
| SQLite readiness delay | /readyz output | inspect database file and volume |
| Host resource pressure | VM CPU and memory | reduce load or allocate more VM resources |

## Evidence to save

Save screenshots of:

- Docker Compose services running
- Blackbox direct probe showing probe_success 1
- Prometheus targets page showing lfcs-dashboard-synthetic
- Prometheus query for probe_success
- Prometheus query for probe_duration_seconds
- k6 terminal output
