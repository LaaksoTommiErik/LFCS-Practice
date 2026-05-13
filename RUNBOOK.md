## Ubuntu VM deployment

This section documents how to deploy the LFCS Study Dashboard on an Ubuntu VM.

### 1. Install system dependencies

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl build-essential python3 make g++
2. Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt-get install -y nodejs

Verify:

node -v
npm -v

Expected Node version:

v22.x.x
3. Clone the repository
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/LaaksoTommiErik/LFCS-Practice.git lfcs-dashboard
cd lfcs-dashboard
4. Install application dependencies
npm install
5. Create runtime data directory
mkdir -p data
6. Create local environment file

Create .env:

nano .env

Example contents:

ADMIN_EMAIL=admin@example.com
ADMIN_INITIAL_PASSWORD=change-this-password
SESSION_SECRET=change-this-session-secret
PORT=3000

Generate a stronger session secret:

openssl rand -hex 32

Do not commit .env to Git.

7. Create admin user
node scripts/create-admin-user.js

Inspect database:

npm run db:inspect
8. Build frontend
npm run build
9. Start manually for smoke test
npm start

Test from another terminal:

curl http://localhost:3000/healthz
curl http://localhost:3000/readyz

Expected result:

/healthz returns healthy
/readyz returns ready with database=ok

Stop manual server:

Ctrl + C
10. Create systemd service

Find username:

whoami

Find Node path:

which node

Create service file:

sudo nano /etc/systemd/system/lfcs-dashboard.service

Example service:

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

Replace YOUR_LINUX_USERNAME with the output of:

whoami
11. Enable and start service
sudo systemctl daemon-reload
sudo systemctl start lfcs-dashboard
sudo systemctl enable lfcs-dashboard

Check status:

sudo systemctl status lfcs-dashboard

View logs:

sudo journalctl -u lfcs-dashboard -n 50 --no-pager

Follow live logs:

sudo journalctl -u lfcs-dashboard -f
12. Verify deployed service
curl http://localhost:3000/healthz
curl http://localhost:3000/readyz

The app should be available locally at:

http://localhost:3000
13. Useful service commands

Restart:

sudo systemctl restart lfcs-dashboard

Stop:

sudo systemctl stop lfcs-dashboard

Start:

sudo systemctl start lfcs-dashboard

Status:

sudo systemctl status lfcs-dashboard

Logs:

sudo journalctl -u lfcs-dashboard -n 50 --no-pager

### Verify target health

Classic targets UI:

```text
http://127.0.0.1:9090/classic/targets
