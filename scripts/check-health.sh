#!/usr/bin/env bash

set -u

BASE_URL="${1:-http://localhost}"
BASE_URL="${BASE_URL%/}"

pretty_json() {
  if command -v jq >/dev/null 2>&1; then
    jq .
  elif command -v python3 >/dev/null 2>&1; then
    python3 -m json.tool
  else
    cat
  fi
}

check_endpoint() {
  local label="$1"
  local path="$2"
  local tmp_file
  local status
  local status_file

  tmp_file="$(mktemp)"
  status_file="$(mktemp)"

  if curl -sS -o "$tmp_file" -w "%{http_code}" "$BASE_URL$path" >"$status_file"; then
    status="$(cat "$status_file")"
  else
    status="000"
  fi

  echo
  echo "=== $label ==="
  echo "URL: $BASE_URL$path"
  echo "HTTP status: $status"
  echo "Response:"

  if [ -s "$tmp_file" ]; then
    pretty_json < "$tmp_file"
  else
    echo "(empty response)"
  fi

  rm -f "$tmp_file" "$status_file"

  if [ "$status" != "200" ]; then
    echo
    echo "Result: FAILED"
    return 1
  fi

  echo
  echo "Result: OK"
}

overall_status=0

check_endpoint "Health check" "/healthz" || overall_status=1
check_endpoint "Readiness check" "/readyz" || overall_status=1

echo

if [ "$overall_status" -eq 0 ]; then
  echo "Overall result: OK"
else
  echo "Overall result: FAILED"
fi

exit "$overall_status"