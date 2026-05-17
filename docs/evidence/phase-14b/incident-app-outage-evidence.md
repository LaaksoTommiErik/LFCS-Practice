# Phase 14B — Incident App Outage Evidence

## Purpose

This file contains raw operational evidence from a controlled LFCS Dashboard outage drill.

## Incident

INCIDENT-001-lfcs-dashboard-outage-drill

## Start time UTC

2026-05-17T21:35:37Z


## Pre-incident Compose State

Command: docker compose -f compose.yml ps

NAME                 IMAGE                                          COMMAND                  SERVICE          CREATED         STATUS                   PORTS
lfcs-alert-webhook   node:22-bookworm-slim                          "docker-entrypoint.s…"   alert-webhook    3 hours ago     Up 9 minutes (healthy)   0.0.0.0:9094->8080/tcp, [::]:9094->8080/tcp
lfcs-alertmanager    prom/alertmanager:v0.32.1                      "/bin/alertmanager -…"   alertmanager     3 hours ago     Up 1 second              0.0.0.0:9093->9093/tcp, [::]:9093->9093/tcp
lfcs-blackbox        quay.io/prometheus/blackbox-exporter:v0.27.0   "/bin/blackbox_expor…"   blackbox         6 hours ago     Up 9 minutes             0.0.0.0:9115->9115/tcp, [::]:9115->9115/tcp
lfcs-dashboard       lfcs-dashboard:local                           "docker-entrypoint.s…"   lfcs-dashboard   9 seconds ago   Up 7 seconds (healthy)   0.0.0.0:3002->3000/tcp, [::]:3002->3000/tcp
lfcs-grafana         grafana/grafana-oss:11.5.2                     "/run.sh"                grafana          6 hours ago     Up 9 minutes             0.0.0.0:3001->3000/tcp, [::]:3001->3000/tcp
lfcs-postgres        postgres:16-alpine                             "docker-entrypoint.s…"   postgres         6 hours ago     Up 9 minutes (healthy)   5432/tcp
lfcs-prometheus      prom/prometheus:v2.55.1                        "/bin/prometheus --c…"   prometheus       6 hours ago     Up Less than a second    0.0.0.0:9090->9090/tcp, [::]:9090->9090/tcp

## Pre-incident Readiness

Command: curl -fsS http://127.0.0.1:3002/readyz

{"ok":true,"service":"lfcs-study-dashboard","status":"ready","checks":{"database":"ok"}}
## Pre-incident Prometheus Alerts

Command: curl -fsS http://127.0.0.1:9090/api/v1/alerts

{"status":"success","data":{"alerts":[]}}

## Failure Injection

Time UTC: 2026-05-17T21:36:05Z

Command: docker compose -f compose.yml stop lfcs-dashboard

Expected impact: /readyz unavailable, Prometheus scrape fails, synthetic probes fail, LFCSDashboardDown fires.

## Detection Evidence

Detection time UTC: 2026-05-17T21:38:31Z

Command: curl -fsS http://127.0.0.1:9090/api/v1/alerts

{"status":"success","data":{"alerts":[{"labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/healthz","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"},"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/healthz for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"state":"firing","activeAt":"2026-05-17T21:36:25.480621692Z","value":"0e+00"},{"labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/readyz","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"},"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/readyz for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"state":"firing","activeAt":"2026-05-17T21:36:25.480621692Z","value":"0e+00"},{"labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/login","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"},"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/login for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"state":"firing","activeAt":"2026-05-17T21:36:25.480621692Z","value":"0e+00"},{"labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"},"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/ for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"state":"firing","activeAt":"2026-05-17T21:36:10.480621692Z","value":"0e+00"},{"labels":{"alertname":"LFCSDashboardDown","instance":"lfcs-dashboard:3000","job":"lfcs-dashboard","service":"lfcs-dashboard","severity":"critical","slo":"availability"},"annotations":{"description":"Prometheus cannot scrape the LFCS Dashboard /metrics endpoint for 2 minutes.","runbook_url":"docs/runbooks/lfcs-dashboard-alerts.md#lfcsdashboarddown","summary":"LFCS Dashboard is down"},"state":"firing","activeAt":"2026-05-17T21:36:24.539910908Z","value":"0e+00"}]}}
Command: curl -fsS http://127.0.0.1:9093/api/v2/alerts

[{"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/login for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"endsAt":"2026-05-17T21:42:25.480Z","fingerprint":"07745d991642dac2","receivers":[{"name":"local-webhook"}],"startsAt":"2026-05-17T21:38:25.480Z","status":{"inhibitedBy":[],"mutedBy":[],"silencedBy":[],"state":"active"},"updatedAt":"2026-05-17T21:38:25.489Z","generatorURL":"http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0\u0026g0.tab=1","labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/login","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"}},{"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/ for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"endsAt":"2026-05-17T21:42:10.480Z","fingerprint":"1ec56ea9ca470a85","receivers":[{"name":"local-webhook"}],"startsAt":"2026-05-17T21:38:10.480Z","status":{"inhibitedBy":[],"mutedBy":[],"silencedBy":[],"state":"active"},"updatedAt":"2026-05-17T21:38:10.483Z","generatorURL":"http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0\u0026g0.tab=1","labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"}},{"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/healthz for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"endsAt":"2026-05-17T21:42:25.480Z","fingerprint":"4e0fc065e158fefb","receivers":[{"name":"local-webhook"}],"startsAt":"2026-05-17T21:38:25.480Z","status":{"inhibitedBy":[],"mutedBy":[],"silencedBy":[],"state":"active"},"updatedAt":"2026-05-17T21:38:25.489Z","generatorURL":"http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0\u0026g0.tab=1","labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/healthz","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"}},{"annotations":{"description":"Prometheus cannot scrape the LFCS Dashboard /metrics endpoint for 2 minutes.","runbook_url":"docs/runbooks/lfcs-dashboard-alerts.md#lfcsdashboarddown","summary":"LFCS Dashboard is down"},"endsAt":"2026-05-17T21:42:24.539Z","fingerprint":"cc03ddd17f978e2e","receivers":[{"name":"local-webhook"}],"startsAt":"2026-05-17T21:38:24.539Z","status":{"inhibitedBy":[],"mutedBy":[],"silencedBy":[],"state":"active"},"updatedAt":"2026-05-17T21:38:24.551Z","generatorURL":"http://70ad3612698e:9090/graph?g0.expr=up%7Bjob%3D%22lfcs-dashboard%22%7D+%3D%3D+0\u0026g0.tab=1","labels":{"alertname":"LFCSDashboardDown","instance":"lfcs-dashboard:3000","job":"lfcs-dashboard","service":"lfcs-dashboard","severity":"critical","slo":"availability"}},{"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/readyz for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"endsAt":"2026-05-17T21:42:25.480Z","fingerprint":"f4f1e58fa21c2cea","receivers":[{"name":"local-webhook"}],"startsAt":"2026-05-17T21:38:25.480Z","status":{"inhibitedBy":[],"mutedBy":[],"silencedBy":[],"state":"active"},"updatedAt":"2026-05-17T21:38:25.489Z","generatorURL":"http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0\u0026g0.tab=1","labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/readyz","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"}}]

Command: curl -fsS http://127.0.0.1:9094/events

[
  {
    "received_at": "2026-05-17T21:38:15.489Z",
    "payload": {
      "receiver": "local-webhook",
      "status": "firing",
      "alerts": [
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/ for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:10.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "1ec56ea9ca470a85"
        }
      ],
      "notification_reason": "first notification",
      "groupLabels": {
        "alertname": "LFCSDashboardSyntheticProbeFailed",
        "service": "lfcs-dashboard",
        "severity": "critical"
      },
      "commonLabels": {
        "alertname": "LFCSDashboardSyntheticProbeFailed",
        "instance": "http://lfcs-dashboard:3000/",
        "job": "lfcs-dashboard-synthetic",
        "service": "lfcs-dashboard",
        "severity": "critical",
        "signal": "synthetic"
      },
      "commonAnnotations": {
        "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/ for at least 2 minutes.",
        "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
        "summary": "LFCS Dashboard synthetic probe failed"
      },
      "externalURL": "http://1e3c27b857c2:9093",
      "version": "4",
      "groupKey": "{}:{alertname=\"LFCSDashboardSyntheticProbeFailed\", service=\"lfcs-dashboard\", severity=\"critical\"}",
      "truncatedAlerts": 0
    }
  },
  {
    "received_at": "2026-05-17T21:38:29.554Z",
    "payload": {
      "receiver": "local-webhook",
      "status": "firing",
      "alerts": [
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardDown",
            "instance": "lfcs-dashboard:3000",
            "job": "lfcs-dashboard",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "slo": "availability"
          },
          "annotations": {
            "description": "Prometheus cannot scrape the LFCS Dashboard /metrics endpoint for 2 minutes.",
            "runbook_url": "docs/runbooks/lfcs-dashboard-alerts.md#lfcsdashboarddown",
            "summary": "LFCS Dashboard is down"
          },
          "startsAt": "2026-05-17T21:38:24.539Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=up%7Bjob%3D%22lfcs-dashboard%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "cc03ddd17f978e2e"
        }
      ],
      "notification_reason": "first notification",
      "groupLabels": {
        "alertname": "LFCSDashboardDown",
        "service": "lfcs-dashboard",
        "severity": "critical"
      },
      "commonLabels": {
        "alertname": "LFCSDashboardDown",
        "instance": "lfcs-dashboard:3000",
        "job": "lfcs-dashboard",
        "service": "lfcs-dashboard",
        "severity": "critical",
        "slo": "availability"
      },
      "commonAnnotations": {
        "description": "Prometheus cannot scrape the LFCS Dashboard /metrics endpoint for 2 minutes.",
        "runbook_url": "docs/runbooks/lfcs-dashboard-alerts.md#lfcsdashboarddown",
        "summary": "LFCS Dashboard is down"
      },
      "externalURL": "http://1e3c27b857c2:9093",
      "version": "4",
      "groupKey": "{}:{alertname=\"LFCSDashboardDown\", service=\"lfcs-dashboard\", severity=\"critical\"}",
      "truncatedAlerts": 0
    }
  },
  {
    "received_at": "2026-05-17T21:38:30.491Z",
    "payload": {
      "receiver": "local-webhook",
      "status": "firing",
      "alerts": [
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/ for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:10.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "1ec56ea9ca470a85"
        },
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/healthz",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/healthz for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:25.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "4e0fc065e158fefb"
        },
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/login",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/login for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:25.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "07745d991642dac2"
        },
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/readyz",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/readyz for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:25.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "f4f1e58fa21c2cea"
        }
      ],
      "notification_reason": "new alerts added",
      "groupLabels": {
        "alertname": "LFCSDashboardSyntheticProbeFailed",
        "service": "lfcs-dashboard",
        "severity": "critical"
      },
      "commonLabels": {
        "alertname": "LFCSDashboardSyntheticProbeFailed",
        "job": "lfcs-dashboard-synthetic",
        "service": "lfcs-dashboard",
        "severity": "critical",
        "signal": "synthetic"
      },
      "commonAnnotations": {
        "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
        "summary": "LFCS Dashboard synthetic probe failed"
      },
      "externalURL": "http://1e3c27b857c2:9093",
      "version": "4",
      "groupKey": "{}:{alertname=\"LFCSDashboardSyntheticProbeFailed\", service=\"lfcs-dashboard\", severity=\"critical\"}",
      "truncatedAlerts": 0
    }
  }
]
## App Logs During Incident

Command: docker compose -f compose.yml logs --tail=120 lfcs-dashboard

lfcs-dashboard  | 
lfcs-dashboard  | > lfcs-study-dashboard@0.0.0 start
lfcs-dashboard  | > node server.js
lfcs-dashboard  | 
lfcs-dashboard  | ◇ injected env (0) from .env // tip: ⌘ override existing { override: true }
lfcs-dashboard  | {"ts":"2026-05-17T21:35:59.067Z","level":"info","event":"server_started","service":"lfcs-study-dashboard","port":3000}
lfcs-dashboard  | {"ts":"2026-05-17T21:36:02.333Z","level":"info","event":"http_request","request_id":"d0ce6147-2288-4ec3-9504-81321d146543","method":"GET","path":"/login","status":200,"duration_ms":8.95,"ip":"::ffff:172.18.0.3","user_agent":"Blackbox Exporter/0.27.0"}
lfcs-dashboard  | {"ts":"2026-05-17T21:36:03.535Z","level":"info","event":"http_request","request_id":"fcce2c66-6c5f-44b5-988b-2ffde4f71285","method":"GET","path":"/healthz","status":200,"duration_ms":1.56,"ip":"::ffff:127.0.0.1","user_agent":"curl/7.88.1"}
lfcs-dashboard  | {"ts":"2026-05-17T21:36:05.141Z","level":"info","event":"http_request","request_id":"8ec08ee4-a5a0-44ec-8519-b96debbc09f0","method":"GET","path":"/readyz","status":200,"duration_ms":2.71,"ip":"::ffff:172.18.0.1","user_agent":"curl/8.5.0"}
lfcs-dashboard  | {"ts":"2026-05-17T21:36:05.750Z","level":"info","event":"http_request","request_id":"504c05a7-cacf-4421-b378-252a242318cf","method":"GET","path":"/readyz","status":200,"duration_ms":1.32,"ip":"::ffff:172.18.0.1","user_agent":"curl/8.5.0"}
lfcs-dashboard  | npm error path /app
lfcs-dashboard  | npm error command failed
lfcs-dashboard  | npm error signal SIGTERM
lfcs-dashboard  | npm error command sh -c node server.js
lfcs-dashboard  | npm notice
lfcs-dashboard  | npm notice New major version of npm available! 10.9.8 -> 11.14.1
lfcs-dashboard  | npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.14.1
lfcs-dashboard  | npm notice To update run: npm install -g npm@11.14.1
lfcs-dashboard  | npm notice
lfcs-dashboard  | npm error A complete log of this run can be found in: /home/node/.npm/_logs/2026-05-17T21_35_58_557Z-debug-0.log


## Recovery Evidence

Mitigation time UTC: 2026-05-17T21:38:31Z

Recovery time UTC: 2026-05-17T21:38:36Z

End time UTC: 2026-05-17T21:39:21Z

Command: curl -fsS http://127.0.0.1:3002/readyz

{"ok":true,"service":"lfcs-study-dashboard","status":"ready","checks":{"database":"ok"}}
Command: docker compose -f compose.yml ps

NAME                 IMAGE                                          COMMAND                  SERVICE          CREATED         STATUS                    PORTS
lfcs-alert-webhook   node:22-bookworm-slim                          "docker-entrypoint.s…"   alert-webhook    3 hours ago     Up 12 minutes (healthy)   0.0.0.0:9094->8080/tcp, [::]:9094->8080/tcp
lfcs-alertmanager    prom/alertmanager:v0.32.1                      "/bin/alertmanager -…"   alertmanager     3 hours ago     Up 3 minutes              0.0.0.0:9093->9093/tcp, [::]:9093->9093/tcp
lfcs-blackbox        quay.io/prometheus/blackbox-exporter:v0.27.0   "/bin/blackbox_expor…"   blackbox         6 hours ago     Up 12 minutes             0.0.0.0:9115->9115/tcp, [::]:9115->9115/tcp
lfcs-dashboard       lfcs-dashboard:local                           "docker-entrypoint.s…"   lfcs-dashboard   3 minutes ago   Up 48 seconds (healthy)   0.0.0.0:3002->3000/tcp, [::]:3002->3000/tcp
lfcs-grafana         grafana/grafana-oss:11.5.2                     "/run.sh"                grafana          6 hours ago     Up 12 minutes             0.0.0.0:3001->3000/tcp, [::]:3001->3000/tcp
lfcs-postgres        postgres:16-alpine                             "docker-entrypoint.s…"   postgres         6 hours ago     Up 12 minutes (healthy)   5432/tcp
lfcs-prometheus      prom/prometheus:v2.55.1                        "/bin/prometheus --c…"   prometheus       6 hours ago     Up 3 minutes              0.0.0.0:9090->9090/tcp, [::]:9090->9090/tcp

Command: curl -fsS http://127.0.0.1:9094/events

[
  {
    "received_at": "2026-05-17T21:38:15.489Z",
    "payload": {
      "receiver": "local-webhook",
      "status": "firing",
      "alerts": [
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/ for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:10.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "1ec56ea9ca470a85"
        }
      ],
      "notification_reason": "first notification",
      "groupLabels": {
        "alertname": "LFCSDashboardSyntheticProbeFailed",
        "service": "lfcs-dashboard",
        "severity": "critical"
      },
      "commonLabels": {
        "alertname": "LFCSDashboardSyntheticProbeFailed",
        "instance": "http://lfcs-dashboard:3000/",
        "job": "lfcs-dashboard-synthetic",
        "service": "lfcs-dashboard",
        "severity": "critical",
        "signal": "synthetic"
      },
      "commonAnnotations": {
        "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/ for at least 2 minutes.",
        "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
        "summary": "LFCS Dashboard synthetic probe failed"
      },
      "externalURL": "http://1e3c27b857c2:9093",
      "version": "4",
      "groupKey": "{}:{alertname=\"LFCSDashboardSyntheticProbeFailed\", service=\"lfcs-dashboard\", severity=\"critical\"}",
      "truncatedAlerts": 0
    }
  },
  {
    "received_at": "2026-05-17T21:38:29.554Z",
    "payload": {
      "receiver": "local-webhook",
      "status": "firing",
      "alerts": [
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardDown",
            "instance": "lfcs-dashboard:3000",
            "job": "lfcs-dashboard",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "slo": "availability"
          },
          "annotations": {
            "description": "Prometheus cannot scrape the LFCS Dashboard /metrics endpoint for 2 minutes.",
            "runbook_url": "docs/runbooks/lfcs-dashboard-alerts.md#lfcsdashboarddown",
            "summary": "LFCS Dashboard is down"
          },
          "startsAt": "2026-05-17T21:38:24.539Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=up%7Bjob%3D%22lfcs-dashboard%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "cc03ddd17f978e2e"
        }
      ],
      "notification_reason": "first notification",
      "groupLabels": {
        "alertname": "LFCSDashboardDown",
        "service": "lfcs-dashboard",
        "severity": "critical"
      },
      "commonLabels": {
        "alertname": "LFCSDashboardDown",
        "instance": "lfcs-dashboard:3000",
        "job": "lfcs-dashboard",
        "service": "lfcs-dashboard",
        "severity": "critical",
        "slo": "availability"
      },
      "commonAnnotations": {
        "description": "Prometheus cannot scrape the LFCS Dashboard /metrics endpoint for 2 minutes.",
        "runbook_url": "docs/runbooks/lfcs-dashboard-alerts.md#lfcsdashboarddown",
        "summary": "LFCS Dashboard is down"
      },
      "externalURL": "http://1e3c27b857c2:9093",
      "version": "4",
      "groupKey": "{}:{alertname=\"LFCSDashboardDown\", service=\"lfcs-dashboard\", severity=\"critical\"}",
      "truncatedAlerts": 0
    }
  },
  {
    "received_at": "2026-05-17T21:38:30.491Z",
    "payload": {
      "receiver": "local-webhook",
      "status": "firing",
      "alerts": [
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/ for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:10.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "1ec56ea9ca470a85"
        },
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/healthz",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/healthz for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:25.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "4e0fc065e158fefb"
        },
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/login",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/login for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:25.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "07745d991642dac2"
        },
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/readyz",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/readyz for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:25.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "f4f1e58fa21c2cea"
        }
      ],
      "notification_reason": "new alerts added",
      "groupLabels": {
        "alertname": "LFCSDashboardSyntheticProbeFailed",
        "service": "lfcs-dashboard",
        "severity": "critical"
      },
      "commonLabels": {
        "alertname": "LFCSDashboardSyntheticProbeFailed",
        "job": "lfcs-dashboard-synthetic",
        "service": "lfcs-dashboard",
        "severity": "critical",
        "signal": "synthetic"
      },
      "commonAnnotations": {
        "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
        "summary": "LFCS Dashboard synthetic probe failed"
      },
      "externalURL": "http://1e3c27b857c2:9093",
      "version": "4",
      "groupKey": "{}:{alertname=\"LFCSDashboardSyntheticProbeFailed\", service=\"lfcs-dashboard\", severity=\"critical\"}",
      "truncatedAlerts": 0
    }
  },
  {
    "received_at": "2026-05-17T21:38:44.553Z",
    "payload": {
      "receiver": "local-webhook",
      "status": "resolved",
      "alerts": [
        {
          "status": "resolved",
          "labels": {
            "alertname": "LFCSDashboardDown",
            "instance": "lfcs-dashboard:3000",
            "job": "lfcs-dashboard",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "slo": "availability"
          },
          "annotations": {
            "description": "Prometheus cannot scrape the LFCS Dashboard /metrics endpoint for 2 minutes.",
            "runbook_url": "docs/runbooks/lfcs-dashboard-alerts.md#lfcsdashboarddown",
            "summary": "LFCS Dashboard is down"
          },
          "startsAt": "2026-05-17T21:38:24.539Z",
          "endsAt": "2026-05-17T21:38:39.539Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=up%7Bjob%3D%22lfcs-dashboard%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "cc03ddd17f978e2e"
        }
      ],
      "notification_reason": "all alerts resolved",
      "groupLabels": {
        "alertname": "LFCSDashboardDown",
        "service": "lfcs-dashboard",
        "severity": "critical"
      },
      "commonLabels": {
        "alertname": "LFCSDashboardDown",
        "instance": "lfcs-dashboard:3000",
        "job": "lfcs-dashboard",
        "service": "lfcs-dashboard",
        "severity": "critical",
        "slo": "availability"
      },
      "commonAnnotations": {
        "description": "Prometheus cannot scrape the LFCS Dashboard /metrics endpoint for 2 minutes.",
        "runbook_url": "docs/runbooks/lfcs-dashboard-alerts.md#lfcsdashboarddown",
        "summary": "LFCS Dashboard is down"
      },
      "externalURL": "http://1e3c27b857c2:9093",
      "version": "4",
      "groupKey": "{}:{alertname=\"LFCSDashboardDown\", service=\"lfcs-dashboard\", severity=\"critical\"}",
      "truncatedAlerts": 0
    }
  },
  {
    "received_at": "2026-05-17T21:38:45.492Z",
    "payload": {
      "receiver": "local-webhook",
      "status": "firing",
      "alerts": [
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/ for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:10.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "1ec56ea9ca470a85"
        },
        {
          "status": "resolved",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/healthz",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/healthz for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:25.48Z",
          "endsAt": "2026-05-17T21:38:40.48Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "4e0fc065e158fefb"
        },
        {
          "status": "firing",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/login",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/login for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:25.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "07745d991642dac2"
        },
        {
          "status": "resolved",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/readyz",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/readyz for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:25.48Z",
          "endsAt": "2026-05-17T21:38:40.48Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "f4f1e58fa21c2cea"
        }
      ],
      "notification_reason": "some alerts resolved",
      "groupLabels": {
        "alertname": "LFCSDashboardSyntheticProbeFailed",
        "service": "lfcs-dashboard",
        "severity": "critical"
      },
      "commonLabels": {
        "alertname": "LFCSDashboardSyntheticProbeFailed",
        "job": "lfcs-dashboard-synthetic",
        "service": "lfcs-dashboard",
        "severity": "critical",
        "signal": "synthetic"
      },
      "commonAnnotations": {
        "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
        "summary": "LFCS Dashboard synthetic probe failed"
      },
      "externalURL": "http://1e3c27b857c2:9093",
      "version": "4",
      "groupKey": "{}:{alertname=\"LFCSDashboardSyntheticProbeFailed\", service=\"lfcs-dashboard\", severity=\"critical\"}",
      "truncatedAlerts": 0
    }
  },
  {
    "received_at": "2026-05-17T21:39:00.493Z",
    "payload": {
      "receiver": "local-webhook",
      "status": "resolved",
      "alerts": [
        {
          "status": "resolved",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/ for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:10.48Z",
          "endsAt": "2026-05-17T21:38:55.48Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "1ec56ea9ca470a85"
        },
        {
          "status": "resolved",
          "labels": {
            "alertname": "LFCSDashboardSyntheticProbeFailed",
            "instance": "http://lfcs-dashboard:3000/login",
            "job": "lfcs-dashboard-synthetic",
            "service": "lfcs-dashboard",
            "severity": "critical",
            "signal": "synthetic"
          },
          "annotations": {
            "description": "Blackbox synthetic probe failed for http://lfcs-dashboard:3000/login for at least 2 minutes.",
            "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
            "summary": "LFCS Dashboard synthetic probe failed"
          },
          "startsAt": "2026-05-17T21:38:25.48Z",
          "endsAt": "2026-05-17T21:38:55.48Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "07745d991642dac2"
        }
      ],
      "notification_reason": "all alerts resolved",
      "groupLabels": {
        "alertname": "LFCSDashboardSyntheticProbeFailed",
        "service": "lfcs-dashboard",
        "severity": "critical"
      },
      "commonLabels": {
        "alertname": "LFCSDashboardSyntheticProbeFailed",
        "job": "lfcs-dashboard-synthetic",
        "service": "lfcs-dashboard",
        "severity": "critical",
        "signal": "synthetic"
      },
      "commonAnnotations": {
        "runbook_url": "docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed",
        "summary": "LFCS Dashboard synthetic probe failed"
      },
      "externalURL": "http://1e3c27b857c2:9093",
      "version": "4",
      "groupKey": "{}:{alertname=\"LFCSDashboardSyntheticProbeFailed\", service=\"lfcs-dashboard\", severity=\"critical\"}",
      "truncatedAlerts": 0
    }
  }
]
Resolved notification observed: true

## Result

PASS: Controlled outage was detected through Prometheus, delivered through Alertmanager, recorded by the webhook receiver, mitigated by restarting lfcs-dashboard, and verified with /readyz.
