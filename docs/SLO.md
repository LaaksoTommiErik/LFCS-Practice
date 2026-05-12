# Service Level Objectives

This document defines basic Service Level Objectives for the LFCS Study Dashboard.

The purpose of these SLOs is to connect application metrics to reliability expectations. Metrics are not useful only because they appear in Grafana; they are useful because they let the operator answer whether the service is behaving acceptably.

## Scope

These SLOs apply to the LFCS Study Dashboard web application.

The `/metrics` endpoint is excluded from request-based SLOs because it is scraped by Prometheus and does not represent normal user-facing application traffic.

## Availability SLO

**Objective:** 99.0% of non-`/metrics` HTTP requests should return a non-5xx response over a 7-day window.

A 5xx response means the server failed to handle the request correctly. Client-side errors such as 404 or 401 are not counted as availability failures here because the service still responded correctly from the server's perspective.

### Availability SLI

The availability SLI is the ratio of successful non-5xx requests to total non-`/metrics` requests.

```promql
1 - (
  sum(rate(lfcs_dashboard_http_requests_total{status_code=~"5..",route!="/metrics"}[5m]))
  /
  sum(rate(lfcs_dashboard_http_requests_total{route!="/metrics"}[5m]))
)
