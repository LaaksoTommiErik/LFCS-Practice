# Updated service Level Objectives

This document defines basic Service Level Objectives for the LFCS Study Dashboard.

The purpose of these SLOs is to connect application metrics to reliability expectations. Metrics are not useful only because they appear in Grafana; they are useful because they let the operator answer whether the service is behaving acceptably.

## Scope

These SLOs apply to the LFCS Study Dashboard web application.

The `/metrics` endpoint is excluded from request-based SLOs because it is scraped by Prometheus and does not represent normal user-facing application traffic.

## Availability SLO

**Objective:** 99.0% of non-`/metrics` HTTP requests should return a non-5xx response over a 7-day window.

A 5xx response means the server failed to handle the request correctly. Client-side errors such as 404 or 401 are not counted as availability failures here because the service still responded correctly from the server's perspective.

cat > docs/SLO.md <<'EOF'
# Service Level Objectives

This document defines the initial Service Level Objectives for the LFCS Study Dashboard.

The purpose of these SLOs is to connect application metrics to reliability expectations. Metrics are not useful only because they appear in Grafana; they are useful because they help the operator decide whether the service is behaving acceptably.

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
| Readiness | `/readyz` confirms the application and SQLite are ready | Ready during normal operation |

## Availability SLO

**Objective:** 99.0% of non-`/metrics` HTTP requests should return a non-5xx response over a 7-day window.

A 5xx response means the server failed to handle the request correctly. Client-side responses such as 401 or 404 are not counted as availability failures here because the service still responded correctly from the server's perspective.

### Availability SLI

```promql
1 - (
  sum(rate(lfcs_dashboard_http_requests_total{status_code=~"5..",route!="/metrics"}[5m]))
  /
  sum(rate(lfcs_dashboard_http_requests_total{route!="/metrics"}[5m]))
)
