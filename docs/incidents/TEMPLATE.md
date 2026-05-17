# Incident Template

## Summary

Briefly describe what happened.

## Severity

SEV4 for controlled local drills unless the drill exposes a real serious defect.

## Status

Resolved / unresolved.

## Start time

UTC timestamp.

## End time

UTC timestamp.

## Duration

Approximate duration.

## Detection

Describe how the issue was detected.

Examples:

- Prometheus alert
- Alertmanager notification
- synthetic probe failure
- manual health check
- user report

## Impact

Describe user-visible or service-visible impact.

For local drills, state that no real users were impacted.

## Root cause

Describe the underlying cause.

For drills, distinguish between the simulated cause and any real defects discovered during the test.

## Timeline

Use UTC timestamps.

| Time UTC | Event |
|---|---|
| YYYY-MM-DDTHH:MM:SSZ | Event description |

## Response

Describe what the operator checked and did.

## Recovery

Describe how service was restored.

## Verification

Describe how recovery was verified.

Examples:

- /healthz returned healthy
- /readyz returned ready
- Prometheus alert resolved
- Alertmanager sent resolved notification
- webhook receiver recorded alert
- containers returned to healthy state

## What went well

List operational positives.

## What went poorly

List gaps or delays.

## Follow-up actions

| Action | Owner | Status |
|---|---|---|
| Example action | Tommi | Open |
