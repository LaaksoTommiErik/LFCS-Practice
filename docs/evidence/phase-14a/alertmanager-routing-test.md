# Phase 14A — Alertmanager Routing Test Evidence

## Purpose

This evidence proves that Prometheus alerts are sent to Alertmanager and routed to a local webhook receiver.

## Test Alert

Alert used for the controlled test:

- LFCSDashboardDown

## Environment

- Prometheus: http://127.0.0.1:9090
- Alertmanager: http://127.0.0.1:9093
- Webhook receiver: http://127.0.0.1:9094
- LFCS Dashboard: http://127.0.0.1:3002

## Initial Compose State

Command: docker compose -f compose.yml ps

NAME                 IMAGE                                          COMMAND                  SERVICE          CREATED          STATUS                    PORTS
lfcs-alert-webhook   node:22-bookworm-slim                          "docker-entrypoint.s…"   alert-webhook    18 seconds ago   Up 15 seconds (healthy)   0.0.0.0:9094->8080/tcp, [::]:9094->8080/tcp
lfcs-alertmanager    prom/alertmanager:v0.32.1                      "/bin/alertmanager -…"   alertmanager     18 seconds ago   Up 1 second               0.0.0.0:9093->9093/tcp, [::]:9093->9093/tcp
lfcs-blackbox        quay.io/prometheus/blackbox-exporter:v0.27.0   "/bin/blackbox_expor…"   blackbox         4 hours ago      Up 4 hours                0.0.0.0:9115->9115/tcp, [::]:9115->9115/tcp
lfcs-dashboard       lfcs-dashboard:local                           "docker-entrypoint.s…"   lfcs-dashboard   18 seconds ago   Up 15 seconds (healthy)   0.0.0.0:3002->3000/tcp, [::]:3002->3000/tcp
lfcs-grafana         grafana/grafana-oss:11.5.2                     "/run.sh"                grafana          4 hours ago      Up 3 hours                0.0.0.0:3001->3000/tcp, [::]:3001->3000/tcp
lfcs-postgres        postgres:16-alpine                             "docker-entrypoint.s…"   postgres         4 hours ago      Up 4 hours (healthy)      5432/tcp
lfcs-prometheus      prom/prometheus:v2.55.1                        "/bin/prometheus --c…"   prometheus       4 hours ago      Up Less than a second     0.0.0.0:9090->9090/tcp, [::]:9090->9090/tcp

## Prometheus Alertmanager Discovery

Command: curl -fsS http://127.0.0.1:9090/api/v1/alertmanagers

{"status":"success","data":{"activeAlertmanagers":[],"droppedAlertmanagers":[]}}
## Alertmanager Readiness

Command: curl -fsS http://127.0.0.1:9093/-/ready

OK
## Webhook Receiver Health

Command: curl -fsS http://127.0.0.1:9094/healthz

{"ok":true,"service":"alert-webhook"}
## Application Readiness Before Failure Injection

Command: curl -fsS http://127.0.0.1:3002/readyz

{"ok":true,"service":"lfcs-study-dashboard","status":"ready","checks":{"database":"ok"}}

## Failure Injection

Command: docker compose -f compose.yml stop lfcs-dashboard

The lfcs-dashboard container was stopped intentionally to trigger LFCSDashboardDown.


## Prometheus Alerts During Failure

Command: curl -fsS http://127.0.0.1:9090/api/v1/alerts

{"status":"success","data":{"alerts":[{"labels":{"alertname":"LFCSDashboardDown","instance":"lfcs-dashboard:3000","job":"lfcs-dashboard","service":"lfcs-dashboard","severity":"critical","slo":"availability"},"annotations":{"description":"Prometheus cannot scrape the LFCS Dashboard /metrics endpoint for 2 minutes.","runbook_url":"docs/runbooks/lfcs-dashboard-alerts.md#lfcsdashboarddown","summary":"LFCS Dashboard is down"},"state":"firing","activeAt":"2026-05-17T18:56:09.539910908Z","value":"0e+00"},{"labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/readyz","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"},"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/readyz for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"state":"firing","activeAt":"2026-05-17T18:56:10.480621692Z","value":"0e+00"},{"labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/login","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"},"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/login for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"state":"firing","activeAt":"2026-05-17T18:56:10.480621692Z","value":"0e+00"},{"labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"},"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/ for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"state":"pending","activeAt":"2026-05-17T18:56:25.480621692Z","value":"0e+00"},{"labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/healthz","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"},"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/healthz for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"state":"firing","activeAt":"2026-05-17T18:56:10.480621692Z","value":"0e+00"}]}}
## Alertmanager Alerts During Failure

Command: curl -fsS http://127.0.0.1:9093/api/v2/alerts

[{"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/login for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"endsAt":"2026-05-17T19:02:10.480Z","fingerprint":"07745d991642dac2","receivers":[{"name":"local-webhook"}],"startsAt":"2026-05-17T18:58:10.480Z","status":{"inhibitedBy":[],"mutedBy":[],"silencedBy":[],"state":"active"},"updatedAt":"2026-05-17T18:58:10.484Z","generatorURL":"http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0\u0026g0.tab=1","labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/login","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"}},{"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/healthz for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"endsAt":"2026-05-17T19:02:10.480Z","fingerprint":"4e0fc065e158fefb","receivers":[{"name":"local-webhook"}],"startsAt":"2026-05-17T18:58:10.480Z","status":{"inhibitedBy":[],"mutedBy":[],"silencedBy":[],"state":"active"},"updatedAt":"2026-05-17T18:58:10.484Z","generatorURL":"http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0\u0026g0.tab=1","labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/healthz","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"}},{"annotations":{"description":"Prometheus cannot scrape the LFCS Dashboard /metrics endpoint for 2 minutes.","runbook_url":"docs/runbooks/lfcs-dashboard-alerts.md#lfcsdashboarddown","summary":"LFCS Dashboard is down"},"endsAt":"2026-05-17T19:02:09.539Z","fingerprint":"cc03ddd17f978e2e","receivers":[{"name":"local-webhook"}],"startsAt":"2026-05-17T18:58:09.539Z","status":{"inhibitedBy":[],"mutedBy":[],"silencedBy":[],"state":"active"},"updatedAt":"2026-05-17T18:58:09.601Z","generatorURL":"http://70ad3612698e:9090/graph?g0.expr=up%7Bjob%3D%22lfcs-dashboard%22%7D+%3D%3D+0\u0026g0.tab=1","labels":{"alertname":"LFCSDashboardDown","instance":"lfcs-dashboard:3000","job":"lfcs-dashboard","service":"lfcs-dashboard","severity":"critical","slo":"availability"}},{"annotations":{"description":"Blackbox synthetic probe failed for http://lfcs-dashboard:3000/readyz for at least 2 minutes.","runbook_url":"docs/runbooks/synthetic-monitoring.md#lfcsdashboardsyntheticprobefailed","summary":"LFCS Dashboard synthetic probe failed"},"endsAt":"2026-05-17T19:02:10.480Z","fingerprint":"f4f1e58fa21c2cea","receivers":[{"name":"local-webhook"}],"startsAt":"2026-05-17T18:58:10.480Z","status":{"inhibitedBy":[],"mutedBy":[],"silencedBy":[],"state":"active"},"updatedAt":"2026-05-17T18:58:10.484Z","generatorURL":"http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0\u0026g0.tab=1","labels":{"alertname":"LFCSDashboardSyntheticProbeFailed","instance":"http://lfcs-dashboard:3000/readyz","job":"lfcs-dashboard-synthetic","service":"lfcs-dashboard","severity":"critical","signal":"synthetic"}}]

## Webhook Events After Alert Delivery

Command: curl -fsS http://127.0.0.1:9094/events

[
  {
    "received_at": "2026-05-17T18:58:14.608Z",
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
          "startsAt": "2026-05-17T18:58:09.539Z",
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
    "received_at": "2026-05-17T18:58:15.485Z",
    "payload": {
      "receiver": "local-webhook",
      "status": "firing",
      "alerts": [
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
          "startsAt": "2026-05-17T18:58:10.48Z",
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
          "startsAt": "2026-05-17T18:58:10.48Z",
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
          "startsAt": "2026-05-17T18:58:10.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "f4f1e58fa21c2cea"
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

## Application Readiness After Recovery

Command: curl -fsS http://127.0.0.1:3002/readyz

{"ok":true,"service":"lfcs-study-dashboard","status":"ready","checks":{"database":"ok"}}
## Webhook Events After Recovery

Command: curl -fsS http://127.0.0.1:9094/events

[
  {
    "received_at": "2026-05-17T18:58:14.608Z",
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
          "startsAt": "2026-05-17T18:58:09.539Z",
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
    "received_at": "2026-05-17T18:58:15.485Z",
    "payload": {
      "receiver": "local-webhook",
      "status": "firing",
      "alerts": [
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
          "startsAt": "2026-05-17T18:58:10.48Z",
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
          "startsAt": "2026-05-17T18:58:10.48Z",
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
          "startsAt": "2026-05-17T18:58:10.48Z",
          "endsAt": "0001-01-01T00:00:00Z",
          "generatorURL": "http://70ad3612698e:9090/graph?g0.expr=probe_success%7Bjob%3D%22lfcs-dashboard-synthetic%22%7D+%3D%3D+0&g0.tab=1",
          "fingerprint": "f4f1e58fa21c2cea"
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
    "received_at": "2026-05-17T18:58:29.605Z",
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
          "startsAt": "2026-05-17T18:58:09.539Z",
          "endsAt": "2026-05-17T18:58:24.539Z",
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
    "received_at": "2026-05-17T18:58:30.487Z",
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
          "startsAt": "2026-05-17T18:58:25.48Z",
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
          "startsAt": "2026-05-17T18:58:10.48Z",
          "endsAt": "2026-05-17T18:58:25.48Z",
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
          "startsAt": "2026-05-17T18:58:10.48Z",
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
          "startsAt": "2026-05-17T18:58:10.48Z",
          "endsAt": "2026-05-17T18:58:25.48Z",
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
    "received_at": "2026-05-17T18:58:45.488Z",
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
          "startsAt": "2026-05-17T18:58:25.48Z",
          "endsAt": "2026-05-17T18:58:40.48Z",
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
          "startsAt": "2026-05-17T18:58:10.48Z",
          "endsAt": "2026-05-17T18:58:40.48Z",
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
## Resolved Notification Status

Resolved notification observed: false

## Result

PASS: Prometheus sent LFCSDashboardDown to Alertmanager, Alertmanager routed it to the local webhook receiver, the webhook receiver recorded the alert, and the LFCS Dashboard recovered after restart.
