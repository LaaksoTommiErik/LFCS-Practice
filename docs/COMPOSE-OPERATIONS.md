# Docker Compose Operations Stack

This document describes the local Docker Compose operations stack for the LFCS Study Dashboard.

## Purpose

The Compose stack runs the application together with Prometheus and Grafana so the service can be observed locally in a reproducible way.

## Services

| Service | Container | Host Port | Purpose |
|---|---|---:|---|
| LFCS Dashboard | lfcs-dashboard | 3000 | App runtime |
| Prometheus | lfcs-prometheus | 9090 | Metrics scraping |
| Grafana | lfcs-grafana | 3001 | Metrics visualization |

## Architecture

```text
Browser
  |
  +--> http://127.0.0.1:3000  -> LFCS Dashboard
  +--> http://127.0.0.1:9090  -> Prometheus
  +--> http://127.0.0.1:3001  -> Grafana

Prometheus scrape path:
  prometheus -> http://lfcs-dashboard:3000/metrics

Grafana data source:
  grafana -> http://prometheus:9090
