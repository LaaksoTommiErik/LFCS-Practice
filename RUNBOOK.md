# LFCS Study Dashboard — Runbook

This runbook documents common operational procedures for the LFCS Study Dashboard.

## Service Summary

| Field | Value |
|---|---|
| Service | LFCS Study Dashboard |
| Runtime | Node.js / Express |
| Frontend | React / Vite production build |
| Database | SQLite |
| Process manager | systemd |
| Reverse proxy | Nginx |
| Metrics | Prometheus |
| Logs | stdout captured by journald |

## Local Development Startup

```bash
cp .env.example .env
npm install
npm run create-admin-user
npm run dev
```

## Production-Style Local Startup

```bash
npm install
npm run build
npm start
```

## Required Environment Variables

| Variable | Purpose |
|---|---|
| `ADMIN_EMAIL` | Email address for initial admin user creation |
| `ADMIN_INITIAL_PASSWORD` | Initial admin password |
| `SESSION_SECRET` | Secret used to sign session cookies |
| `PORT` | Express listen port, usually `3000` |
| `APP_ORIGIN` | Allowed frontend origin for CORS |
| `COOKIE_SECURE` | Set to `true` when using HTTPS |

Generate a stronger session secret:

```bash
openssl rand -hex 32
```

Do not commit `.env`.

## Ubuntu VM Deployment

### 1. Install system dependencies

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl build-essential python3 make g++
```

### 2. Install Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt-get install -y nodejs
```

Verify:

```bash
node -v
npm -v
```

Expected Node version:

```text
v22.x.x
```

### 3. Clone the repository

```bash
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/LaaksoTommiErik/LFCS-Practice.git lfcs-dashboard
cd lfcs-dashboard
```

### 4. Install application dependencies

```bash
npm install
```

### 5. Create runtime data directory

```bash
mkdir -p data
```

### 6. Create local environment file

```bash
nano .env
```

Example contents:

```text
ADMIN_EMAIL=admin@example.com
ADMIN_INITIAL_PASSWORD=change-this-password
SESSION_SECRET=change-this-session-secret
PORT=3000
```

### 7. Create admin user

```bash
npm run create-admin-user
```

Inspect database:

```bash
npm run db:inspect
```

### 8. Build frontend

```bash
npm run build
```

### 9. Start manually for smoke test

```bash
npm start
```

Test from another terminal:

```bash
curl http://localhost:3000/healthz
curl http://localhost:3000/readyz
```

Expected result:

```text
/healthz returns healthy
/readyz returns ready with database=ok
```

Stop manual server with `Ctrl + C`.

## systemd Service

### 1. Find username and Node path

```bash
whoami
which node
```

### 2. Create service file

```bash
sudo nano /etc/systemd/system/lfcs-dashboard.service
```

Example service:

```ini
[Unit]
Description=LFCS Study Dashboard
After=network.target

[Service]
Type=simple
User=YOUR_LINUX_USERNAME
WorkingDirectory=/home/YOUR_LINUX_USERNAME/apps/lfcs-dashboard
EnvironmentFile=/home/YOUR_LINUX_USERNAME/apps/lfcs-dashboard/.env
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Replace `YOUR_LINUX_USERNAME` with the output of:

```bash
whoami
```

### 3. Enable and start service

```bash
sudo systemctl daemon-reload
sudo systemctl start lfcs-dashboard
sudo systemctl enable lfcs-dashboard
```

### 4. Check service status

```bash
sudo systemctl status lfcs-dashboard
```

Expected result:

```text
active (running)
```

## Logs

View recent logs:

```bash
sudo journalctl -u lfcs-dashboard -n 50 --no-pager
```

Follow live logs:

```bash
sudo journalctl -u lfcs-dashboard -f
```

Filter structured HTTP request logs:

```bash
sudo journalctl -u lfcs-dashboard -n 100 --no-pager | grep '"event":"http_request"'
```

## Health and Readiness Checks

Direct Express checks:

```bash
curl http://localhost:3000/healthz
curl http://localhost:3000/readyz
```

Nginx-proxied checks:

```bash
curl http://localhost/healthz
curl http://localhost/readyz
```

Expected `/healthz` result:

```json
{
  "ok": true,
  "service": "lfcs-study-dashboard",
  "status": "healthy"
}
```

Expected `/readyz` result:

```json
{
  "ok": true,
  "service": "lfcs-study-dashboard",
  "status": "ready",
  "checks": {
    "database": "ok"
  }
}
```

## Useful Service Commands

Restart:

```bash
sudo systemctl restart lfcs-dashboard
```

Stop:

```bash
sudo systemctl stop lfcs-dashboard
```

Start:

```bash
sudo systemctl start lfcs-dashboard
```

Status:

```bash
sudo systemctl status lfcs-dashboard
```

Logs:

```bash
sudo journalctl -u lfcs-dashboard -n 50 --no-pager
```

## Nginx Verification

Test Nginx configuration:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

Check Nginx status:

```bash
sudo systemctl status nginx
```

## Prometheus Verification

Classic targets UI:

```text
http://127.0.0.1:9090/classic/targets
```

API target check:

```bash
curl -s http://127.0.0.1:9090/api/v1/targets | grep -A20 lfcs-dashboard
```

Expected result:

```text
lfcs-dashboard target is UP
```

## Common Failure Modes

### Express port already in use

Symptom:

```text
EADDRINUSE: address already in use :::3000
```

Fix:

```bash
ss -ltnp | grep 3000
sudo systemctl stop lfcs-dashboard
```

### Missing dependencies

Symptom:

```text
Cannot find package 'express'
```

Fix:

```bash
npm install
```

### Missing environment variables during admin bootstrap

Symptom:

```text
Missing ADMIN_EMAIL or ADMIN_INITIAL_PASSWORD
```

Fix:

```bash
nano .env
```

Then add the required values.

### Broken shell script line endings

Symptom:

```text
/usr/bin/env: bash\r: No such file or directory
```

Fix:

```bash
sed -i 's/\r$//' scripts/check-health.sh
```

The repository also includes `.gitattributes` to enforce LF line endings for shell scripts.

