# Phase 15A EC2 Docker Compose Deployment Evidence

Date: 2026-05-18T14:02:59+03:00

## Terraform public endpoint outputs
healthz_url = "http://13.50.225.65/healthz"
instance_id = "i-092d3de8032fd1b23"
public_dns = "ec2-13-50-225-65.eu-north-1.compute.amazonaws.com"
public_ip = "13.50.225.65"
readyz_url = "http://13.50.225.65/readyz"
ssh_command = "ssh -i ~/.ssh/lfcs_aws_ed25519 ubuntu@13.50.225.65"

## Public endpoint checks

### /healthz
{"ok":true,"service":"lfcs-study-dashboard","status":"healthy"}
### /readyz
{"ok":true,"service":"lfcs-study-dashboard","status":"ready","checks":{"database":"ok"}}
### / HTTP headers
HTTP/1.1 200 OK
X-Request-Id: e7e0c37b-3e6f-43f1-b93b-d05bf64616b9
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off

## EC2 host-local checks
NAME                 IMAGE                                          COMMAND                  SERVICE          CREATED         STATUS                   PORTS
lfcs-alert-webhook   node:22-bookworm-slim                          "docker-entrypoint.s…"   alert-webhook    8 minutes ago   Up 8 minutes (healthy)   0.0.0.0:9094->8080/tcp, [::]:9094->8080/tcp
lfcs-alertmanager    prom/alertmanager:v0.32.1                      "/bin/alertmanager -…"   alertmanager     8 minutes ago   Up 8 minutes             0.0.0.0:9093->9093/tcp, [::]:9093->9093/tcp
lfcs-blackbox        quay.io/prometheus/blackbox-exporter:v0.27.0   "/bin/blackbox_expor…"   blackbox         8 minutes ago   Up 8 minutes             0.0.0.0:9115->9115/tcp, [::]:9115->9115/tcp
lfcs-dashboard       lfcs-dashboard:local                           "docker-entrypoint.s…"   lfcs-dashboard   8 minutes ago   Up 8 minutes (healthy)   0.0.0.0:80->3000/tcp, [::]:80->3000/tcp
lfcs-grafana         grafana/grafana-oss:11.5.2                     "/run.sh"                grafana          8 minutes ago   Up 8 minutes             0.0.0.0:3001->3000/tcp, [::]:3001->3000/tcp
lfcs-postgres        postgres:16-alpine                             "docker-entrypoint.s…"   postgres         8 minutes ago   Up 8 minutes (healthy)   5432/tcp
lfcs-prometheus      prom/prometheus:v2.55.1                        "/bin/prometheus --c…"   prometheus       8 minutes ago   Up 8 minutes             0.0.0.0:9090->9090/tcp, [::]:9090->9090/tcp

## EC2 /metrics first 20 lines
# HELP lfcs_dashboard_process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE lfcs_dashboard_process_cpu_user_seconds_total counter
lfcs_dashboard_process_cpu_user_seconds_total 2.801346

# HELP lfcs_dashboard_process_cpu_system_seconds_total Total system CPU time spent in seconds.
# TYPE lfcs_dashboard_process_cpu_system_seconds_total counter
lfcs_dashboard_process_cpu_system_seconds_total 0.9125259999999998

# HELP lfcs_dashboard_process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE lfcs_dashboard_process_cpu_seconds_total counter
lfcs_dashboard_process_cpu_seconds_total 3.7138719999999994

# HELP lfcs_dashboard_process_start_time_seconds Start time of the process since unix epoch in seconds.
# TYPE lfcs_dashboard_process_start_time_seconds gauge
lfcs_dashboard_process_start_time_seconds 1779101680

# HELP lfcs_dashboard_process_resident_memory_bytes Resident memory size in bytes.
# TYPE lfcs_dashboard_process_resident_memory_bytes gauge
lfcs_dashboard_process_resident_memory_bytes 60506112


## Observability host-local health
Prometheus Server is Healthy.

HTTP/1.1 200 OK
Cache-Control: no-store
Content-Type: text/html; charset=UTF-8
X-Content-Type-Options: nosniff
X-Frame-Options: deny
OK
