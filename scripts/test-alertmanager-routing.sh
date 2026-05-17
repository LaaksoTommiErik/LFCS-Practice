#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-compose.yml}"
LFCS_DASHBOARD_PORT="${LFCS_DASHBOARD_PORT:-3002}"
APP_URL="${APP_URL:-http://127.0.0.1:${LFCS_DASHBOARD_PORT}}"
PROMETHEUS_URL="${PROMETHEUS_URL:-http://127.0.0.1:9090}"
ALERTMANAGER_URL="${ALERTMANAGER_URL:-http://127.0.0.1:9093}"
WEBHOOK_URL="${WEBHOOK_URL:-http://127.0.0.1:9094}"
EVIDENCE_FILE="${EVIDENCE_FILE:-docs/evidence/phase-14a/alertmanager-routing-test.md}"

if docker compose version >/dev/null 2>&1 && docker ps >/dev/null 2>&1; then
  DC=(docker compose -f "$COMPOSE_FILE")
  DC_ENV=(env LFCS_DASHBOARD_PORT="$LFCS_DASHBOARD_PORT" docker compose -f "$COMPOSE_FILE")
else
  DC=(sudo docker compose -f "$COMPOSE_FILE")
  DC_ENV=(sudo env LFCS_DASHBOARD_PORT="$LFCS_DASHBOARD_PORT" docker compose -f "$COMPOSE_FILE")
fi

cleanup() {
  echo "Cleanup: ensuring lfcs-dashboard is running again..."
  "${DC_ENV[@]}" up -d lfcs-dashboard >/dev/null 2>&1 || true
}
trap cleanup EXIT

mkdir -p "$(dirname "$EVIDENCE_FILE")"

cat > "$EVIDENCE_FILE" <<EOM
# Phase 14A — Alertmanager Routing Test Evidence

## Purpose

This evidence proves that Prometheus alerts are sent to Alertmanager and routed to a local webhook receiver.

## Test Alert

Alert used for the controlled test:

- LFCSDashboardDown

## Environment

- Prometheus: ${PROMETHEUS_URL}
- Alertmanager: ${ALERTMANAGER_URL}
- Webhook receiver: ${WEBHOOK_URL}
- LFCS Dashboard: ${APP_URL}

EOM

echo "Starting full Compose stack..."
"${DC_ENV[@]}" up -d --build

echo "Restarting Prometheus and Alertmanager so mounted config is loaded..."
"${DC[@]}" restart alertmanager prometheus >/dev/null

echo "Waiting for app readiness..."
for i in {1..40}; do
  if curl -fsS "${APP_URL}/readyz" | grep -q '"status":"ready"'; then
    echo "Application is ready."
    break
  fi

  if [[ "$i" -eq 40 ]]; then
    echo "Application did not become ready." >&2
    "${DC[@]}" ps
    "${DC[@]}" logs --tail=120 lfcs-dashboard
    exit 1
  fi

  echo "Waiting for app readiness..."
  sleep 3
done

echo "Waiting for Alertmanager readiness..."
for i in {1..30}; do
  if curl -fsS "${ALERTMANAGER_URL}/-/ready" >/dev/null; then
    echo "Alertmanager is ready."
    break
  fi

  if [[ "$i" -eq 30 ]]; then
    echo "Alertmanager did not become ready." >&2
    "${DC[@]}" logs --tail=120 alertmanager
    exit 1
  fi

  echo "Waiting for Alertmanager..."
  sleep 2
done

echo "Waiting for webhook receiver readiness..."
for i in {1..30}; do
  if curl -fsS "${WEBHOOK_URL}/healthz" | grep -q '"ok":true'; then
    echo "Webhook receiver is ready."
    break
  fi

  if [[ "$i" -eq 30 ]]; then
    echo "Webhook receiver did not become ready." >&2
    "${DC[@]}" logs --tail=120 alert-webhook
    exit 1
  fi

  echo "Waiting for webhook receiver..."
  sleep 2
done

echo "Clearing old webhook events..."
"${DC[@]}" exec -T alert-webhook sh -lc 'rm -f /data/alertmanager-webhook-events.jsonl'

{
  echo "## Initial Compose State"
  echo
  echo "Command: docker compose -f compose.yml ps"
  echo
  "${DC[@]}" ps
  echo
  echo "## Prometheus Alertmanager Discovery"
  echo
  echo "Command: curl -fsS ${PROMETHEUS_URL}/api/v1/alertmanagers"
  echo
  curl -fsS "${PROMETHEUS_URL}/api/v1/alertmanagers"
  echo
  echo "## Alertmanager Readiness"
  echo
  echo "Command: curl -fsS ${ALERTMANAGER_URL}/-/ready"
  echo
  curl -fsS "${ALERTMANAGER_URL}/-/ready"
  echo
  echo "## Webhook Receiver Health"
  echo
  echo "Command: curl -fsS ${WEBHOOK_URL}/healthz"
  echo
  curl -fsS "${WEBHOOK_URL}/healthz"
  echo
  echo "## Application Readiness Before Failure Injection"
  echo
  echo "Command: curl -fsS ${APP_URL}/readyz"
  echo
  curl -fsS "${APP_URL}/readyz"
  echo
} >> "$EVIDENCE_FILE"

echo "Injecting failure: stopping lfcs-dashboard..."
"${DC[@]}" stop lfcs-dashboard

{
  echo
  echo "## Failure Injection"
  echo
  echo "Command: docker compose -f compose.yml stop lfcs-dashboard"
  echo
  echo "The lfcs-dashboard container was stopped intentionally to trigger LFCSDashboardDown."
  echo
} >> "$EVIDENCE_FILE"

echo "Waiting for LFCSDashboardDown notification to reach webhook receiver..."
ALERT_DELIVERED="false"

for i in {1..120}; do
  if curl -fsS "${WEBHOOK_URL}/events" 2>/dev/null | grep -q "LFCSDashboardDown"; then
    ALERT_DELIVERED="true"
    echo "Alertmanager webhook notification received."
    break
  fi

  if (( i % 10 == 0 )); then
    echo "Still waiting for alert delivery... ${i}/120"
  fi

  sleep 3
done

if [[ "$ALERT_DELIVERED" != "true" ]]; then
  echo "Alert notification was not received by webhook receiver in time." >&2
  echo "Prometheus alerts:"
  curl -fsS "${PROMETHEUS_URL}/api/v1/alerts" || true
  echo
  echo "Alertmanager alerts:"
  curl -fsS "${ALERTMANAGER_URL}/api/v2/alerts" || true
  echo
  echo "Webhook events:"
  curl -fsS "${WEBHOOK_URL}/events" || true
  echo
  exit 1
fi

{
  echo
  echo "## Prometheus Alerts During Failure"
  echo
  echo "Command: curl -fsS ${PROMETHEUS_URL}/api/v1/alerts"
  echo
  curl -fsS "${PROMETHEUS_URL}/api/v1/alerts"
  echo
  echo "## Alertmanager Alerts During Failure"
  echo
  echo "Command: curl -fsS ${ALERTMANAGER_URL}/api/v2/alerts"
  echo
  curl -fsS "${ALERTMANAGER_URL}/api/v2/alerts"
  echo
  echo "## Webhook Events After Alert Delivery"
  echo
  echo "Command: curl -fsS ${WEBHOOK_URL}/events"
  echo
  curl -fsS "${WEBHOOK_URL}/events"
  echo
} >> "$EVIDENCE_FILE"

echo "Recovering service: starting lfcs-dashboard..."
"${DC_ENV[@]}" up -d lfcs-dashboard

echo "Waiting for app readiness after recovery..."
for i in {1..40}; do
  if curl -fsS "${APP_URL}/readyz" | grep -q '"status":"ready"'; then
    echo "Application recovered."
    break
  fi

  if [[ "$i" -eq 40 ]]; then
    echo "Application did not recover." >&2
    "${DC[@]}" logs --tail=120 lfcs-dashboard
    exit 1
  fi

  echo "Waiting for recovery..."
  sleep 3
done

echo "Waiting briefly for optional resolved notification..."
RESOLVED_DELIVERED="false"

for i in {1..40}; do
  if curl -fsS "${WEBHOOK_URL}/events" 2>/dev/null | grep -q '"status":"resolved"'; then
    RESOLVED_DELIVERED="true"
    echo "Resolved notification received."
    break
  fi
  sleep 3
done

{
  echo
  echo "## Application Readiness After Recovery"
  echo
  echo "Command: curl -fsS ${APP_URL}/readyz"
  echo
  curl -fsS "${APP_URL}/readyz"
  echo
  echo "## Webhook Events After Recovery"
  echo
  echo "Command: curl -fsS ${WEBHOOK_URL}/events"
  echo
  curl -fsS "${WEBHOOK_URL}/events"
  echo
  echo "## Resolved Notification Status"
  echo
  echo "Resolved notification observed: ${RESOLVED_DELIVERED}"
  echo
  echo "## Result"
  echo
  echo "PASS: Prometheus sent LFCSDashboardDown to Alertmanager, Alertmanager routed it to the local webhook receiver, the webhook receiver recorded the alert, and the LFCS Dashboard recovered after restart."
} >> "$EVIDENCE_FILE"

echo "Alertmanager routing test passed."
echo "Evidence written to: $EVIDENCE_FILE"
