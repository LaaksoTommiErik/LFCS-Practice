#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-compose.yml}"
LFCS_DASHBOARD_PORT="${LFCS_DASHBOARD_PORT:-3002}"
APP_URL="${APP_URL:-http://127.0.0.1:${LFCS_DASHBOARD_PORT}}"
PROMETHEUS_URL="${PROMETHEUS_URL:-http://127.0.0.1:9090}"
ALERTMANAGER_URL="${ALERTMANAGER_URL:-http://127.0.0.1:9093}"
WEBHOOK_URL="${WEBHOOK_URL:-http://127.0.0.1:9094}"
EVIDENCE_FILE="${EVIDENCE_FILE:-docs/evidence/phase-14b/incident-app-outage-evidence.md}"
INCIDENT_FILE="${INCIDENT_FILE:-docs/incidents/INCIDENT-001-lfcs-dashboard-outage-drill.md}"

if docker compose version >/dev/null 2>&1 && docker ps >/dev/null 2>&1; then
  DC=(docker compose -f "$COMPOSE_FILE")
  DC_ENV=(env LFCS_DASHBOARD_PORT="$LFCS_DASHBOARD_PORT" docker compose -f "$COMPOSE_FILE")
else
  DC=(sudo docker compose -f "$COMPOSE_FILE")
  DC_ENV=(sudo env LFCS_DASHBOARD_PORT="$LFCS_DASHBOARD_PORT" docker compose -f "$COMPOSE_FILE")
fi

START_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

cleanup() {
  echo "Cleanup: ensuring lfcs-dashboard is running..."
  "${DC_ENV[@]}" up -d lfcs-dashboard >/dev/null 2>&1 || true
}
trap cleanup EXIT

mkdir -p "$(dirname "$EVIDENCE_FILE")"
mkdir -p "$(dirname "$INCIDENT_FILE")"

cat > "$EVIDENCE_FILE" <<EOM
# Phase 14B — Incident App Outage Evidence

## Purpose

This file contains raw operational evidence from a controlled LFCS Dashboard outage drill.

## Incident

INCIDENT-001-lfcs-dashboard-outage-drill

## Start time UTC

${START_TIME}

EOM

echo "Starting full Compose stack..."
"${DC_ENV[@]}" up -d --build

echo "Restarting Prometheus and Alertmanager to ensure current config is loaded..."
"${DC[@]}" restart prometheus alertmanager >/dev/null

echo "Waiting for app readiness before incident..."
for i in {1..40}; do
  if curl -fsS "${APP_URL}/readyz" | grep -q '"status":"ready"'; then
    echo "Application is ready."
    break
  fi

  if [[ "$i" -eq 40 ]]; then
    echo "Application did not become ready before incident." >&2
    "${DC[@]}" ps
    "${DC[@]}" logs --tail=120 lfcs-dashboard
    exit 1
  fi

  echo "Waiting for app readiness..."
  sleep 3
done

echo "Waiting for Alertmanager and webhook readiness..."
for i in {1..30}; do
  if curl -fsS "${ALERTMANAGER_URL}/-/ready" >/dev/null && curl -fsS "${WEBHOOK_URL}/healthz" | grep -q '"ok":true'; then
    echo "Alertmanager and webhook receiver are ready."
    break
  fi

  if [[ "$i" -eq 30 ]]; then
    echo "Alertmanager or webhook receiver did not become ready." >&2
    "${DC[@]}" ps
    "${DC[@]}" logs --tail=120 alertmanager
    "${DC[@]}" logs --tail=120 alert-webhook
    exit 1
  fi

  echo "Waiting for Alertmanager/webhook..."
  sleep 2
done

echo "Clearing old webhook events..."
"${DC[@]}" exec -T alert-webhook sh -lc 'rm -f /data/alertmanager-webhook-events.jsonl'

{
  echo
  echo "## Pre-incident Compose State"
  echo
  echo "Command: docker compose -f compose.yml ps"
  echo
  "${DC[@]}" ps
  echo
  echo "## Pre-incident Readiness"
  echo
  echo "Command: curl -fsS ${APP_URL}/readyz"
  echo
  curl -fsS "${APP_URL}/readyz"
  echo
  echo "## Pre-incident Prometheus Alerts"
  echo
  echo "Command: curl -fsS ${PROMETHEUS_URL}/api/v1/alerts"
  echo
  curl -fsS "${PROMETHEUS_URL}/api/v1/alerts"
  echo
} >> "$EVIDENCE_FILE"

FAILURE_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "Injecting controlled failure: stopping lfcs-dashboard..."
"${DC[@]}" stop lfcs-dashboard

{
  echo
  echo "## Failure Injection"
  echo
  echo "Time UTC: ${FAILURE_TIME}"
  echo
  echo "Command: docker compose -f compose.yml stop lfcs-dashboard"
  echo
  echo "Expected impact: /readyz unavailable, Prometheus scrape fails, synthetic probes fail, LFCSDashboardDown fires."
} >> "$EVIDENCE_FILE"

echo "Waiting for LFCSDashboardDown to reach webhook receiver..."
ALERT_DELIVERED="false"

for i in {1..120}; do
  if curl -fsS "${WEBHOOK_URL}/events" 2>/dev/null | grep -q "LFCSDashboardDown"; then
    ALERT_DELIVERED="true"
    echo "LFCSDashboardDown notification reached webhook receiver."
    break
  fi

  if (( i % 10 == 0 )); then
    echo "Still waiting for alert delivery... ${i}/120"
  fi

  sleep 3
done

DETECTION_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [[ "$ALERT_DELIVERED" != "true" ]]; then
  echo "Incident drill failed: LFCSDashboardDown did not reach webhook receiver." >&2

  {
    echo
    echo "## Failure: Alert Did Not Reach Webhook"
    echo
    echo "Command: curl -fsS ${PROMETHEUS_URL}/api/v1/alerts"
    echo
    curl -fsS "${PROMETHEUS_URL}/api/v1/alerts" || true
    echo
    echo "Command: curl -fsS ${ALERTMANAGER_URL}/api/v2/alerts"
    echo
    curl -fsS "${ALERTMANAGER_URL}/api/v2/alerts" || true
    echo
    echo "Command: curl -fsS ${WEBHOOK_URL}/events"
    echo
    curl -fsS "${WEBHOOK_URL}/events" || true
    echo
  } >> "$EVIDENCE_FILE"

  exit 1
fi

{
  echo
  echo "## Detection Evidence"
  echo
  echo "Detection time UTC: ${DETECTION_TIME}"
  echo
  echo "Command: curl -fsS ${PROMETHEUS_URL}/api/v1/alerts"
  echo
  curl -fsS "${PROMETHEUS_URL}/api/v1/alerts"
  echo
  echo "Command: curl -fsS ${ALERTMANAGER_URL}/api/v2/alerts"
  echo
  curl -fsS "${ALERTMANAGER_URL}/api/v2/alerts"
  echo
  echo "Command: curl -fsS ${WEBHOOK_URL}/events"
  echo
  curl -fsS "${WEBHOOK_URL}/events"
  echo
  echo "## App Logs During Incident"
  echo
  echo "Command: docker compose -f compose.yml logs --tail=120 lfcs-dashboard"
  echo
  "${DC[@]}" logs --tail=120 lfcs-dashboard || true
  echo
} >> "$EVIDENCE_FILE"

MITIGATION_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "Mitigating incident: starting lfcs-dashboard..."
"${DC_ENV[@]}" up -d lfcs-dashboard

echo "Waiting for service recovery..."
RECOVERED="false"

for i in {1..40}; do
  if curl -fsS "${APP_URL}/readyz" | grep -q '"status":"ready"'; then
    RECOVERED="true"
    echo "Application recovered."
    break
  fi

  if (( i % 5 == 0 )); then
    echo "Still waiting for recovery... ${i}/40"
  fi

  sleep 3
done

RECOVERY_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [[ "$RECOVERED" != "true" ]]; then
  echo "Incident drill failed: application did not recover." >&2
  "${DC[@]}" logs --tail=120 lfcs-dashboard
  exit 1
fi

echo "Waiting briefly for resolved notifications..."
sleep 45

RESOLVED_OBSERVED="false"
if curl -fsS "${WEBHOOK_URL}/events" 2>/dev/null | grep -Eq '"status"[[:space:]]*:[[:space:]]*"resolved"'; then
  RESOLVED_OBSERVED="true"
fi

END_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

{
  echo
  echo "## Recovery Evidence"
  echo
  echo "Mitigation time UTC: ${MITIGATION_TIME}"
  echo
  echo "Recovery time UTC: ${RECOVERY_TIME}"
  echo
  echo "End time UTC: ${END_TIME}"
  echo
  echo "Command: curl -fsS ${APP_URL}/readyz"
  echo
  curl -fsS "${APP_URL}/readyz"
  echo
  echo "Command: docker compose -f compose.yml ps"
  echo
  "${DC[@]}" ps
  echo
  echo "Command: curl -fsS ${WEBHOOK_URL}/events"
  echo
  curl -fsS "${WEBHOOK_URL}/events"
  echo
  echo "Resolved notification observed: ${RESOLVED_OBSERVED}"
  echo
  echo "## Result"
  echo
  echo "PASS: Controlled outage was detected through Prometheus, delivered through Alertmanager, recorded by the webhook receiver, mitigated by restarting lfcs-dashboard, and verified with /readyz."
} >> "$EVIDENCE_FILE"

cat > "$INCIDENT_FILE" <<EOM
# INCIDENT-001 — LFCS Dashboard Controlled Outage Drill

## Summary

A controlled local incident drill was performed by stopping the lfcs-dashboard container. The outage was detected by Prometheus, routed through Alertmanager, recorded by the local webhook receiver, and mitigated by restarting the service.

## Severity

SEV4 — controlled local drill.

## Status

Resolved.

## Start time

${START_TIME}

## End time

${END_TIME}

## Detection time

${DETECTION_TIME}

## Mitigation time

${MITIGATION_TIME}

## Recovery time

${RECOVERY_TIME}

## Impact

The LFCS Dashboard was intentionally unavailable in the local Docker Compose environment.

No real users were impacted.

Expected local impact:

- /readyz became unavailable
- Prometheus scrape target for lfcs-dashboard failed
- LFCSDashboardDown fired
- synthetic probes failed while the app was stopped

## Detection

The incident was detected through the existing observability path:

Prometheus alert rule -> Alertmanager -> local webhook receiver.

The key alert was:

- LFCSDashboardDown

Synthetic probe alerts also fired because the application endpoints were unavailable during the controlled outage.

## Root cause

The direct cause was intentional operator action:

- docker compose -f compose.yml stop lfcs-dashboard

This was a controlled failure injection, not an accidental production outage.

## Timeline

| Time UTC | Event |
|---|---|
| ${START_TIME} | Incident drill started |
| ${FAILURE_TIME} | lfcs-dashboard was stopped intentionally |
| ${DETECTION_TIME} | LFCSDashboardDown reached the webhook receiver |
| ${MITIGATION_TIME} | Mitigation started by restarting lfcs-dashboard |
| ${RECOVERY_TIME} | /readyz returned ready |
| ${END_TIME} | Evidence collection completed |

## Response

The operator checked:

- Docker Compose service state
- /readyz
- Prometheus alert state
- Alertmanager alert state
- webhook receiver events
- application logs

## Recovery

The service was recovered with:

    LFCS_DASHBOARD_PORT=3002 docker compose -f compose.yml up -d lfcs-dashboard

## Verification

Recovery was verified by:

- /readyz returned ready
- lfcs-dashboard container was running again
- webhook receiver recorded the alert event
- evidence was written to docs/evidence/phase-14b/incident-app-outage-evidence.md

Resolved notification observed: ${RESOLVED_OBSERVED}

## What went well

- Existing Prometheus alert rule detected the outage
- Alertmanager routed the alert to the receiver
- Webhook receiver recorded the alert payload
- The service was recovered with a simple restart
- Evidence and postmortem were generated from the test procedure

## What went poorly

- This was a local drill, not real production traffic
- No external paging system was used
- No user-facing status page was updated
- No real stakeholder communication was required

## Follow-up actions

| Action | Owner | Status |
|---|---|---|
| Add a second incident drill for database unavailability | Tommi | Open |
| Add a postmortem index file | Tommi | Open |
| Add screenshots from Prometheus and Alertmanager UI | Tommi | Optional |
| Add external notification integration later | Tommi | Future |

## Evidence

Evidence file:

    docs/evidence/phase-14b/incident-app-outage-evidence.md
EOM

echo "Incident drill passed."
echo "Evidence written to: $EVIDENCE_FILE"
echo "Postmortem written to: $INCIDENT_FILE"
