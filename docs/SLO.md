# LFCS Study Dashboard — Service Level Objectives

This document defines basic Service Level Objectives for the LFCS Study Dashboard.

The purpose of these SLOs is to connect application metrics to reliability expectations. Metrics are useful when they help the operator decide whether the service is behaving acceptably.

## Scope

These SLOs apply to the LFCS Study Dashboard web application.

The `/metrics` endpoint is excluded from request-based SLOs because it is scraped by Prometheus and does not represent normal user-facing application traffic.

## Service Summary

| Field | Value |
|---|---|
| Service | LFCS Study Dashboard |
| Runtime | Express / Node |
| Frontend | Vite / React production build |
| Database | SQLite |
| Deployment | Ubuntu VM, systemd, Nginx reverse proxy |
| Metrics backend | Prometheus |
| Dashboarding | Grafana |

## SLIs and SLOs

| Area | SLI | SLO |
|---|---|---|
| Availability | Ratio of non-5xx responses to total non-`/metrics` requests | 99.0% successful requests over 7 days |
| Error ratio | Ratio of 5xx responses to total non-`/metrics` requests | Less than 5% over 5 minutes |
| Latency | p95 request duration for non-`/metrics` requests | p95 below 300ms over 5 minutes |
| Readiness | `/readyz` confirms application and SQLite readiness | Ready during normal operation |

## Availability SLI

```promql
1 - (
  sum(rate(lfcs_dashboard_http_requests_total{status_code=~"5..",route!="/metrics"}[5m]))
  /
  sum(rate(lfcs_dashboard_http_requests_total{route!="/metrics"}[5m]))
)
```
## Error Ratio SLI

```promql
sum(rate(lfcs_dashboard_http_requests_total{status_code=~"5..",route!="/metrics"}[5m]))
/
sum(rate(lfcs_dashboard_http_requests_total{route!="/metrics"}[5m]))
```

## Latency SLI

```promql
histogram_quantile(
  0.95,
  sum by (le) (
    rate(lfcs_dashboard_http_request_duration_seconds_bucket{route!="/metrics"}[5m])
  )
)
```

## Readiness SLI

```promql
up{job="lfcs-dashboard"} == 1
```
