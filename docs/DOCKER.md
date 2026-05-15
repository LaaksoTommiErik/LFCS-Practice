# Docker Runtime

This document describes how to build, run, verify, inspect, and stop the LFCS Study Dashboard using Docker.

## Purpose

The Docker layer packages the application into a reproducible runtime image.

The container runs the production Express / Node service, which serves the built React frontend from `dist/`.

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
```

## Build image

Build the local Docker image from the repository root:

```bash
docker build -t lfcs-dashboard:local .
```

If your user does not have Docker socket permissions, use:

```bash
sudo docker build -t lfcs-dashboard:local .
```

Expected result:

```text
Successfully built ...
Successfully tagged lfcs-dashboard:local
```

With BuildKit, the output may look like:

```text
=> exporting to image
=> naming to docker.io/library/lfcs-dashboard:local
```

## Run with Docker Compose

Start the containerized app:

```bash
docker compose -f compose.yml up -d --build
```

If Docker requires sudo:

```bash
sudo docker compose -f compose.yml up -d --build
```

The Compose runtime:

- builds the local image
- starts the `lfcs-dashboard` container
- publishes host port `3000` to container port `3000`
- mounts the named SQLite volume at `/app/data`
- configures a healthcheck for `/healthz`

## Verify container status

Check container status:

```bash
docker compose -f compose.yml ps
```

Or with sudo:

```bash
sudo docker compose -f compose.yml ps
```

Expected result:

```text
NAME             IMAGE                  STATUS
lfcs-dashboard   lfcs-dashboard:local   Up ... healthy
```

The container may show `starting` for a short time before becoming `healthy`.

Inspect the Docker healthcheck directly:

```bash
docker inspect --format='{{json .State.Health.Status}}' lfcs-dashboard
```

Expected result:

```text
"healthy"
```

## Verify /healthz, /readyz, and /metrics

Check the health endpoint:

```bash
curl -i http://127.0.0.1:3000/healthz
```

Expected result:

```text
HTTP/1.1 200 OK
```

The response body should contain `healthy`.

Check the readiness endpoint:

```bash
curl -i http://127.0.0.1:3000/readyz
```

Expected result:

```text
HTTP/1.1 200 OK
```

The response body should contain `ready`.

Check the metrics endpoint:

```bash
curl -i http://127.0.0.1:3000/metrics
```

Expected result:

```text
HTTP/1.1 200 OK
```

The response should include Prometheus metrics such as:

```text
lfcs_dashboard_http_requests_total
```

## Run npm smoke test against container

Run the existing smoke test against the Docker runtime:

```bash
npm run smoke -- http://127.0.0.1:3000
```

Expected result:

```text
PASS
```

Or the equivalent success output from `scripts/smoke-test.sh`.

This verifies:

- `/`
- `/healthz`
- `/readyz`
- `/metrics`
- required metrics content

## View logs

View recent container logs:

```bash
docker compose -f compose.yml logs --tail=100 lfcs-dashboard
```

Follow logs live:

```bash
docker compose -f compose.yml logs -f lfcs-dashboard
```

If Docker requires sudo:

```bash
sudo docker compose -f compose.yml logs -f lfcs-dashboard
```

Expected result:

- app startup logs
- structured JSON request logs after endpoint traffic
- useful error messages if the app fails to start

## Stop container

Stop and remove the running container while keeping the persistent Docker volume:

```bash
docker compose -f compose.yml down
```

Or with sudo:

```bash
sudo docker compose -f compose.yml down
```

This stops the Docker runtime but keeps the named SQLite data volume.

## Remove volume warning

Warning: this deletes the containerized SQLite data.

Only run this when you intentionally want to remove the persistent Docker volume:

```bash
docker compose -f compose.yml down -v
```

Or with sudo:

```bash
sudo docker compose -f compose.yml down -v
```

The `-v` flag removes named volumes declared in `compose.yml`.

For this project, that means deleting:

```text
lfcs-dashboard-data
```

## SQLite volume strategy

SQLite stores application state as local files.

Containers are disposable. If SQLite files only exist inside the container filesystem, application data can disappear when the container is removed or recreated.

This project mounts a named Docker volume:

```text
lfcs-dashboard-data -> /app/data
```

The app uses SQLite under `./data`, and because the container working directory is `/app`, the database files are stored under:

```text
/app/data
```

This allows SQLite data to survive:

- container restarts
- image rebuilds
- `docker compose down`

It does not survive:

```bash
docker compose -f compose.yml down -v
```

## SQLite limitation

SQLite is acceptable for this project at the current stage because the app is running as a single container with a local persistent volume.

SQLite is not suitable for multi-replica container deployment where several app containers write to the same database file.

Before Kubernetes, ECS scaling, or multi-instance deployment, the app should move to PostgreSQL or another networked database.

Current honest status:

```text
Single container + SQLite volume: acceptable
Multiple app replicas + shared SQLite file: not acceptable
Future cloud/Kubernetes path: migrate to PostgreSQL
```

## Security notes

The Docker runtime includes basic production-style hygiene:

- the container runs as the non-root `node` user
- `.env` files are excluded from the Docker build context
- SQLite data is stored in a mounted volume instead of baked into the image
- the image exposes only the app port
- the healthcheck uses `/healthz`

The current Compose file uses a local development placeholder:

```text
SESSION_SECRET=dev-only-change-me-before-real-deployment
```

That value is not production-safe.

For real deployment, secrets must be injected through a proper mechanism such as:

- environment variables from a secure host configuration
- GitHub Actions secrets for CI/CD
- AWS SSM Parameter Store
- AWS Secrets Manager
- Docker secrets or orchestrator-managed secrets

Do not commit real secrets to Git.

## Common failure modes

### Port 3000 already in use

If the systemd version of the app is already using port `3000`, Docker cannot bind the same host port.

Check:

```bash
ss -ltnp | grep 3000
```

Stop the systemd service during Docker testing:

```bash
sudo systemctl stop lfcs-dashboard
```

Then restart Docker:

```bash
sudo docker compose -f compose.yml up -d --build
```

### Docker socket permission denied

Example:

```text
permission denied while trying to connect to the Docker daemon socket
```

Temporary fix:

```bash
sudo docker ps
```

Long-term fix:

```bash
sudo usermod -aG docker "$USER"
```

Then log out and back in.

Verify:

```bash
groups
docker ps
```

### Container is unhealthy

Inspect health status:

```bash
docker inspect lfcs-dashboard --format='{{range .State.Health.Log}}{{.Output}}{{end}}'
```

Check logs:

```bash
sudo docker compose -f compose.yml logs --tail=100 lfcs-dashboard
```

Test from inside the container:

```bash
sudo docker exec -it lfcs-dashboard sh
curl -i http://127.0.0.1:3000/healthz
```

### Readiness fails

Likely causes:

- `/app/data` is not writable
- SQLite database path is wrong
- app cannot initialize the database
- missing required environment variable

Inspect:

```bash
sudo docker exec -it lfcs-dashboard sh
whoami
ls -la /app
ls -la /app/data
```

Expected:

```text
whoami -> node
/app/data exists and is writable
```

## Portfolio evidence checklist

Save terminal output or screenshots showing:

```text
docker build -t lfcs-dashboard:local . passing
docker compose -f compose.yml up -d --build passing
docker compose -f compose.yml ps showing healthy container
curl http://127.0.0.1:3000/healthz returning healthy
curl http://127.0.0.1:3000/readyz returning ready
curl http://127.0.0.1:3000/metrics showing Prometheus metrics
npm run smoke -- http://127.0.0.1:3000 passing
docker compose logs showing app logs
docs/DOCKER.md committed to Git
PR merged into main
```
