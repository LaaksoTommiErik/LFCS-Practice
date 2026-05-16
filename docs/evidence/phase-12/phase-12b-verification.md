# Phase 12B Verification

## Scope

Phase 12B adds a provisioned Grafana dashboard for local synthetic monitoring and converts the load-test notes into an evidence-backed report.

## Files added or updated

| File | Purpose |
|---|---|
| ops/grafana/dashboards/lfcs-synthetic-monitoring.json | Grafana dashboard as code |
| docs/performance/load-test.md | Load-test report with observed k6 results |
| docs/evidence/phase-12/phase-12b-verification.md | Verification record for Phase 12B |

## Verification commands

Validate dashboard JSON:

    python3 -m json.tool ops/grafana/dashboards/lfcs-synthetic-monitoring.json >/tmp/lfcs-synthetic-monitoring.valid.json

Validate Docker Compose config:

    docker compose config

Start or refresh the stack:

    docker compose up -d --build

Restart Grafana to force dashboard provisioning reload:

    docker compose restart grafana

Check Grafana dashboard search API:

    GRAFANA_USER="${GRAFANA_ADMIN_USER:-admin}"
    GRAFANA_PASS="${GRAFANA_ADMIN_PASSWORD:-admin}"

    curl -fsS -u "$GRAFANA_USER:$GRAFANA_PASS" \
      "http://127.0.0.1:3001/api/search?query=LFCS%20Synthetic%20Monitoring"

Check Prometheus synthetic success:

    curl -G -fsS "http://127.0.0.1:9090/api/v1/query" \
      --data-urlencode 'query=min(probe_success{job="lfcs-dashboard-synthetic"})'

Check Prometheus synthetic duration:

    curl -G -fsS "http://127.0.0.1:9090/api/v1/query" \
      --data-urlencode 'query=max(probe_duration_seconds{job="lfcs-dashboard-synthetic"})'

## Expected results

| Check | Expected result |
|---|---|
| Dashboard JSON validation | exits successfully |
| Docker Compose config | exits successfully |
| Grafana dashboard search | returns LFCS Synthetic Monitoring |
| Synthetic success query | returns value 1 |
| Synthetic duration query | returns numeric duration values |

## Screenshot evidence to save

Save screenshots under docs/evidence/screenshots/.

Required screenshots:

| Screenshot | Suggested filename |
|---|---|
| Grafana synthetic dashboard | phase-12b-grafana-synthetic-dashboard.png |
| Prometheus probe_success query | phase-12b-prometheus-probe-success.png |
| Prometheus probe_duration_seconds query | phase-12b-prometheus-probe-duration.png |
| Updated load-test report in editor or GitHub | phase-12b-load-test-report.png |

## Completion note

Phase 12B is complete when the Grafana dashboard is visible, Prometheus synthetic metrics are still returning good data, and the load-test report contains observed results from the real k6 smoke test.
