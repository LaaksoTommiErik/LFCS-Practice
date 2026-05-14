#!/usr/bin/env bash

set -u

BASE_URL="${1:-http://127.0.0.1:3000}"
BASE_URL="${BASE_URL%/}"

failures=0

tmp_body="$(mktemp)"
tmp_status="$(mktemp)"

cleanup() {
  rm -f "$tmp_body" "$tmp_status"
}

trap cleanup EXIT

check_http_200() {
  local label="$1"
  local path="$2"
  local url="${BASE_URL}${path}"
  local status

  : > "$tmp_body"
  : > "$tmp_status"

  if curl -sS -o "$tmp_body" -w "%{http_code}" "$url" > "$tmp_status"; then
    status="$(cat "$tmp_status")"
  else
    status="000"
  fi

  echo
  echo "=== ${label} ==="
  echo "URL: ${url}"
  echo "HTTP status: ${status}"

  if [ "$status" = "200" ]; then
    echo "Result: OK"
    return 0
  fi

  echo "Result: FAILED"
  echo "Response body:"
  cat "$tmp_body"
  failures=1
  return 1
}

check_body_contains() {
  local label="$1"
  local path="$2"
  local expected="$3"
  local url="${BASE_URL}${path}"
  local status

  : > "$tmp_body"
  : > "$tmp_status"

  if curl -sS -o "$tmp_body" -w "%{http_code}" "$url" > "$tmp_status"; then
    status="$(cat "$tmp_status")"
  else
    status="000"
  fi

  echo
  echo "=== ${label} ==="
  echo "URL: ${url}"
  echo "HTTP status: ${status}"
  echo "Expected content: ${expected}"

  if [ "$status" != "200" ]; then
    echo "Result: FAILED"
    echo "Response body:"
    cat "$tmp_body"
    failures=1
    return 1
  fi

  if grep -q "$expected" "$tmp_body"; then
    echo "Result: OK"
    return 0
  fi

  echo "Result: FAILED"
  echo "Response body did not contain expected content."
  echo "Response body preview:"
  head -n 20 "$tmp_body"
  failures=1
  return 1
}

echo "Running LFCS Study Dashboard smoke test"
echo "Base URL: ${BASE_URL}"

check_http_200 "Frontend root" "/"
check_body_contains "Health endpoint" "/healthz" "healthy"
check_body_contains "Readiness endpoint" "/readyz" "ready"
check_http_200 "Metrics endpoint" "/metrics"
check_body_contains "Metrics content" "/metrics" "lfcs_dashboard_http_requests_total"

echo

if [ "$failures" -eq 0 ]; then
  echo "Smoke test result: OK"
  exit 0
fi

echo "Smoke test result: FAILED"
exit 1
