## 10.5 2026 added :

Local development startup
Required environment variables
Creating the admin user
Database inspection
Known errors and fixes
Auth/CSRF bug and fix
Persistence verification procedure

## 10.5 2026 added :

added : healthz
added : readyz

## 11.05.2026 added : 
## Structured request logs

The express app writes structured JSON request logs to stdout.

Because the app runs under `systemd`, logs are available thorugh `journalctl`

## View recent apps logs

```bash
sudo journalctl -u lfcs-dashboard -n 50 --no-pager 
