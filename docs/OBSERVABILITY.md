# Observability

## Prometheus target health

```promql
up{job="lfcs-dashboard"}

## Prometheus data source

http://localhost:9090

## Grafana dashboard

Grafana runs locally on:

```text
http://127.0.0.1:3001

## Dashboard name: LFCS Dashboard Observability

Main panels:

Service up/down
HTTP Request rate by route
Total request rate by route
HTTP 5xx error ratio
p95 latency by route
Process resident memory
Node.js heap usage
Process CPU usage
Node.js event loop lag p90
HTTP Status code rate

The Dashboard primarly uses Prometheus recording rules from:
/etc/prometheus/rules/lfcs-dashboard-rules.yml

A repository copy of the Grafana dashboard JSON is stored at:

ops/grafana/lfcs-dashboard-observability.json

## Prometheus Alert Rules

The project includes a small set of Prometheys alert rules in:

```text
ops/promehtheus/lfcs-dashboard-alers.yml
