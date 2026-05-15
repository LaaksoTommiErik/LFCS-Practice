# Docker Runtime

This document describes how to build, run, verify, inspect, and stop the LFCS Study Dashboard using Docker.

## Purpose

The Docker layer packages the application into a reproducible runtime image.

The container runs the production Express/Node service, which serves the built React frontend from `dist/`.

## Runtime architecture

```text
Browser
  |
  v
Docker published port 3000
  |
  v
lfcs-dashboard container
  |
  v
Express / Node
  |
  +--> serves React production build from dist/
  +--> exposes /healthz
  +--> exposes /readyz
  +--> exposes /metrics
  +--> reads/writes SQLite data under /app/data
