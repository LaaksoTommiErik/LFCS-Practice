# Docker Compose Operations Stack

This document describes the local Docker Compose operations stack for the LFCS Study Dashboard.

## Purpose

The Compose stack runs the application together with Prometheus and Grafana so the service can be observed locally in a reproducible way.

The purpose of this layer is to prove that the application can be operated as a small local platform, not only as a standalone Node process.

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
```

## Files

| File | Purpose |
|---|---|
| compose.yml | Defines the app, Prometheus, Grafana, ports, volumes, and mounts |
| ops/prometheus/prometheus.yml | Prometheus scrape configuration |
| ops/grafana/provisioning/datasources/prometheus.yml | Grafana Prometheus datasource provisioning |
| ops/grafana/provisioning/dashboards/dashboards.yml | Grafana dashboard provider provisioning |
| ops/grafana/dashboards/lfcs-dashboard-overview.json | Grafana dashboard-as-code |

## Start stack

Start the full local operations stack:

```bash
sudo docker compose -f compose.yml up -d --build
```

## Verify Compose config

Validate that Docker Compose can parse the file:

```bash
sudo docker compose -f compose.yml config
```

Expected result: Compose prints the rendered configuration without errors.

A useful quiet check:

```bash
sudo docker compose -f compose.yml config >/tmp/compose-rendered.yml
echo "compose config OK"
```

Expected:

```text
compose config OK
```

## Verify containers

```bash
sudo docker compose -f compose.yml ps
```

Expected:

```text
lfcs-dashboard    Up ... healthy
lfcs-prometheus   Up
lfcs-grafana      Up
```

The app container should become healthy after its `/healthz` check passes.

## Verify app endpoints

```bash
curl -i http://127.0.0.1:3000/healthz
curl -i http://127.0.0.1:3000/readyz
curl -i http://127.0.0.1:3000/metrics
npm run smoke -- http://127.0.0.1:3000
```

Expected:

```text
/healthz -> HTTP 200 and healthy
/readyz  -> HTTP 200 and ready
/metrics -> HTTP 200 and Prometheus metrics
smoke test passes
```

The `/metrics` output should include:

```text
lfcs_dashboard_http_requests_total
```

## Generate test traffic

Run this when Grafana panels show little or no data:

```bash
for i in {1..100}; do
  curl -s http://127.0.0.1:3000/ >/dev/null
  curl -s http://127.0.0.1:3000/healthz >/dev/null
  curl -s http://127.0.0.1:3000/readyz >/dev/null
  curl -s http://127.0.0.1:3000/metrics >/dev/null
done
```

## Verify Prometheus target

Prometheus should scrape the app by Compose service name:

```text
lfcs-dashboard:3000
```

Command-line verification:

```bash
curl -s http://127.0.0.1:9090/api/v1/targets \
  | jq '.data.activeTargets[] | select(.labels.job=="lfcs-dashboard") | {scrapeUrl, health, lastError}'
```

Expected:

```json
{
  "scrapeUrl": "http://lfcs-dashboard:3000/metrics",
  "health": "up",
  "lastError": ""
}
```

Browser verification:

```text
http://127.0.0.1:9090/targets
```

Expected: `lfcs-dashboard` target is `UP`.

## Verify Grafana datasource

Grafana is available at:

```text
http://127.0.0.1:3001
```

Local login:

```text
admin / admin
```

If the password was changed locally, use the current local password.

The local admin password is demo-only and must not be used for public deployment.

Grafana must use this datasource URL inside Compose:

```text
http://prometheus:9090
```

Not:

```text
http://127.0.0.1:9090
```

From inside a container, `127.0.0.1` means the same container, not the host and not another service.

API verification:

```bash
curl -s -u "$GRAFANA_AUTH" http://127.0.0.1:3001/api/datasources \
  | jq '.[] | {name, uid, type, url, access, isDefault}'
```

Expected:

```json
{
  "name": "Prometheus",
  "uid": "prometheus",
  "type": "prometheus",
  "url": "http://prometheus:9090",
  "access": "proxy",
  "isDefault": true
}
```

Datasource proxy verification:

```bash
curl -s -u "$GRAFANA_AUTH" http://127.0.0.1:3001/api/datasources/proxy/uid/prometheus/-/ready
```

Expected:

```text
Prometheus Server is Ready.
```

## Verify dashboard provisioning

Grafana provisioning is stored in Git:

```text
ops/grafana/provisioning/datasources/prometheus.yml
ops/grafana/provisioning/dashboards/dashboards.yml
ops/grafana/dashboards/lfcs-dashboard-overview.json
```

Dashboard JSON files under this repo path:

```text
ops/grafana/dashboards/
```

are mounted into Grafana at:

```text
/var/lib/grafana/dashboards
```

Verify local dashboard files:

```bash
find ops/grafana/dashboards -type f -name "*.json" -print
```

Expected:

```text
ops/grafana/dashboards/lfcs-dashboard-overview.json
```

Verify Grafana loaded dashboards:

```bash
curl -s -u "$GRAFANA_AUTH" "http://127.0.0.1:3001/api/search?type=dash-db" \
  | jq '.[].title'
```

Expected:

```text
"LFCS Dashboard Overview"
```

Browser verification:

```text
http://127.0.0.1:3001
Dashboards -> LFCS -> LFCS Dashboard Overview
```

Expected panels include:

```text
LFCS Dashboard Service Up
Total Request Rate
HTTP Request Rate by route
HTTP 5xx Error Ratio
p95 HTTP Latency by route
Process Resident Memory
Node.js Heap Used
Process CPU Usage
```

## Logs

All service logs:

```bash
sudo docker compose -f compose.yml logs --tail=100
```

Follow app logs:

```bash
sudo docker compose -f compose.yml logs -f lfcs-dashboard
```

Follow Prometheus logs:

```bash
sudo docker compose -f compose.yml logs -f prometheus
```

Follow Grafana logs:

```bash
sudo docker compose -f compose.yml logs -f grafana
```

## Stop stack

Stop containers while keeping data volumes:

```bash
sudo docker compose -f compose.yml down
```

Delete containers and volumes:

```bash
sudo docker compose -f compose.yml down -v
```

Warning: `down -v` deletes the local SQLite app data, Prometheus data, and Grafana local state.

## Volumes

| Volume | Purpose |
|---|---|
| lfcs-dashboard-data | SQLite app data |
| prometheus-data | Prometheus time-series data |
| grafana-data | Grafana local state |

## Common failure modes

### Port 3000 already in use

The systemd version of the app may already be running.

Check:

```bash
sudo ss -ltnp | grep 3000
```

Stop the systemd app during Compose testing:

```bash
sudo systemctl stop lfcs-dashboard
```

### Port 9090 already in use

Host Prometheus may already be running.

Check:

```bash
sudo ss -ltnp | grep 9090
```

Stop host Prometheus during Compose testing:

```bash
sudo systemctl stop prometheus
```

### Port 3001 already in use

Host Grafana may already be running.

Check:

```bash
sudo ss -ltnp | grep 3001
```

Stop host Grafana during Compose testing:

```bash
sudo systemctl stop grafana-server
```

### Prometheus target is DOWN

Check containers:

```bash
sudo docker compose -f compose.yml ps
```

Check Prometheus config inside the container:

```bash
sudo docker compose -f compose.yml exec prometheus cat /etc/prometheus/prometheus.yml
```

The target must be:

```text
lfcs-dashboard:3000
```

Not:

```text
127.0.0.1:3000
```

### Grafana datasource fails

Check the datasource provisioning file:

```bash
cat ops/grafana/provisioning/datasources/prometheus.yml
```

Correct URL:

```text
http://prometheus:9090
```

Wrong URL:

```text
http://localhost:9090
```

Verify Grafana can reach Prometheus internally:

```bash
sudo docker compose -f compose.yml exec grafana sh -lc 'wget -qO- http://prometheus:9090/-/ready'
```

Expected:

```text
Prometheus Server is Ready.
```

### Dashboard does not appear

Check dashboard files:

```bash
find ops/grafana/dashboards -type f -name "*.json" -print
```

Validate dashboard JSON:

```bash
find ops/grafana/dashboards -type f -name "*.json" -print0 \
  | xargs -0 -I{} sh -c 'echo "Checking {}"; jq empty "{}"'
```

Check Grafana provisioning logs:

```bash
sudo docker compose -f compose.yml logs --tail=200 grafana | grep -iE "provision|dashboard|datasource|error"
```

## Portfolio evidence checklist

Save evidence showing:

```text
docker compose ps with app, Prometheus, and Grafana running
app container healthy
/metrics exposing lfcs_dashboard_http_requests_total
Prometheus /targets showing lfcs-dashboard UP
Grafana datasource using http://prometheus:9090
Grafana dashboard loaded from repository JSON
Grafana dashboard panels with data
docs/COMPOSE-OPERATIONS.md committed
PR merged
```

## Operational note

This local stack is suitable for portfolio and local operations practice.

It is not a production deployment because:

```text
Grafana admin password is demo-only
SQLite is local single-node storage
No TLS is configured
No external secret manager is used
No backup/restore workflow is implemented yet
```

## Troubleshooting: Host port already in use

Docker Compose may fail if another host process or old container is already using a required port.

Common errors:

    failed to bind host port 0.0.0.0:9090/tcp: address already in use
    failed to bind host port 0.0.0.0:3001/tcp: address already in use

Common LFCS Dashboard ports:

| Port | Service |
|---|---|
| 3000 | LFCS Dashboard app |
| 3001 | Grafana |
| 9090 | Prometheus |
| 9115 | Blackbox Exporter |
| 5432 | PostgreSQL |

Find the process using a port:

    sudo ss -ltnp 'sport = :9090'
    sudo ss -ltnp 'sport = :3001'

Check Docker containers using a port:

    docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}" | grep 9090 || true
    docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}" | grep 3001 || true

If the conflict is a systemd service:

    sudo systemctl stop prometheus
    sudo systemctl disable prometheus

    sudo systemctl stop grafana-server
    sudo systemctl disable grafana-server

If the conflict is an old Docker container:

    docker rm -f <container-name-or-id>

Clean the failed Compose attempt:

    docker compose down

Restart the stack:

    docker compose up -d --build
    docker compose ps

Verify expected endpoints:

    curl -fsS http://127.0.0.1:3000/healthz
    curl -fsS http://127.0.0.1:3000/readyz
    curl -fsS http://127.0.0.1:9090/-/ready
    curl -fsS http://127.0.0.1:3001/api/health

Important note:

Inside Docker Compose, services communicate through service names such as `postgres`, `prometheus`, and `grafana`. Host port conflicts only affect access from the host machine into containers. They do not mean the application code is broken.
