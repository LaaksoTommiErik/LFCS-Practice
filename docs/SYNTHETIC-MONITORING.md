# Synthetic Monitoring

## Purpose

Synthetic monitoring checks the LFCS Study Dashboard from outside the application process.

Application metrics from /metrics show what the app reports about itself. Synthetic probes answer a different question:

Can an external client reach important user-visible and operational endpoints successfully?

## Tool

This project uses Prometheus Blackbox Exporter for local synthetic checks.

Blackbox Exporter probes HTTP endpoints and exposes probe metrics to Prometheus.

## Local probe targets

The local Docker Compose stack probes these endpoints:

| Endpoint | Purpose |
|---|---|
| / | Frontend root route |
| /login | User-visible login page |
| /healthz | Process health |
| /readyz | Application readiness including SQLite check |

## Prometheus job

The Prometheus scrape job is:

    lfcs-dashboard-synthetic

Primary success query:

    probe_success{job="lfcs-dashboard-synthetic"}

Primary latency query:

    probe_duration_seconds{job="lfcs-dashboard-synthetic"}

## Alerts

Synthetic alert rules are stored in:

    ops/prometheus/alerts/lfcs-dashboard-synthetic-alerts.yml

Current alerts:

| Alert | Meaning |
|---|---|
| LFCSDashboardSyntheticProbeFailed | One or more synthetic checks failed for at least 2 minutes |
| LFCSDashboardSyntheticProbeSlow | One or more synthetic checks exceeded 1 second for at least 5 minutes |

## Verification

Start the stack:

    docker compose up -d --build

Check Blackbox directly:

    curl -fsS "http://127.0.0.1:9115/probe?target=http://lfcs-dashboard:3000/healthz&module=http_2xx" | grep "probe_success 1"

Check Prometheus query API:

    curl -G -fsS "http://127.0.0.1:9090/api/v1/query" \
      --data-urlencode 'query=probe_success{job="lfcs-dashboard-synthetic"}'

Expected result:

    probe_success should be 1 for all configured synthetic targets.

## Current limitation

These are local synthetic checks inside the Docker Compose network.

They do not prove public internet reachability yet.

Public URL synthetic monitoring belongs after AWS, DNS, and TLS are implemented.
