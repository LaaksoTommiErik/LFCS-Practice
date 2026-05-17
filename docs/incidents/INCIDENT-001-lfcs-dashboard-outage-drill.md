# INCIDENT-001 — LFCS Dashboard Controlled Outage Drill

## Summary

A controlled local incident drill was performed by stopping the lfcs-dashboard container. The outage was detected by Prometheus, routed through Alertmanager, recorded by the local webhook receiver, and mitigated by restarting the service.

## Severity

SEV4 — controlled local drill.

## Status

Resolved.

## Start time

2026-05-17T21:35:37Z

## End time

2026-05-17T21:39:21Z

## Detection time

2026-05-17T21:38:31Z

## Mitigation time

2026-05-17T21:38:31Z

## Recovery time

2026-05-17T21:38:36Z

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
| 2026-05-17T21:35:37Z | Incident drill started |
| 2026-05-17T21:36:05Z | lfcs-dashboard was stopped intentionally |
| 2026-05-17T21:38:31Z | LFCSDashboardDown reached the webhook receiver |
| 2026-05-17T21:38:31Z | Mitigation started by restarting lfcs-dashboard |
| 2026-05-17T21:38:36Z | /readyz returned ready |
| 2026-05-17T21:39:21Z | Evidence collection completed |

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

Resolved notification observed: true

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
