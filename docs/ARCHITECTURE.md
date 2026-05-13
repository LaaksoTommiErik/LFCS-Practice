# LFCS Study Dashboard — Architecture

This document describes the current baseline architecture before Docker, AWS, Kubernetes, Terraform, or expanded observability are added.

## Current Architecture

```mermaid
flowchart TD
    User[Browser / User] --> Nginx[Nginx reverse proxy :80]
    Nginx --> Express[Express / Node server :3000]

    Express --> React[Built React frontend served from dist/]
    Express --> API[Auth + Progress API]
    Express --> SQLite[(SQLite data/app.sqlite)]
    Express --> Sessions[(SQLite data/sessions.sqlite)]

    Express --> Health[/healthz/]
    Express --> Readiness[/readyz/]
    Express --> Metrics[/metrics/]

    Metrics --> Prometheus[Prometheus]
    Prometheus --> Grafana[Grafana dashboards]
    Prometheus --> Alerts[Prometheus alert rules]

    Express --> Journald[stdout JSON logs via systemd / journald]
