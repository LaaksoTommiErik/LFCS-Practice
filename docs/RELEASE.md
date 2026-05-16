# Release and Change Management

This document describes the lightweight release process for the LFCS Study Dashboard.

The goal is to show disciplined change management for a portfolio project without pretending it is an enterprise production system.

## Release model

The project uses a simple GitHub pull request workflow:

```text
feature branch -> pull request -> CI checks -> review -> merge to main
```

Every pull request should pass CI before merge.

CI currently verifies:

```text
npm ci
npm run build
local app startup
/healthz
/readyz
/metrics
Docker image build
Docker container startup
container /healthz
container /readyz
container /metrics
Trivy image scan report
```

## Versioning

Until the project reaches a public deployment, releases can use simple tags:

```text
v0.1.0
v0.2.0
v0.3.0
```

Use semantic-version-style meaning:

| Version part | Meaning |
|---|---|
| MAJOR | Incompatible architecture or data change |
| MINOR | New feature, new operational layer, or new deployment capability |
| PATCH | Bug fix, documentation correction, or small operational fix |

## Create a release tag

From a clean `main` branch:

```bash
git checkout main
git pull origin main
git status
```

Expected:

```text
nothing to commit, working tree clean
```

Create an annotated tag:

```bash
git tag -a v0.1.0 -m "Phase 7 security and release hygiene baseline"
git push origin v0.1.0
```

## Release notes template

Use this format:

```markdown
# Release vX.Y.Z

## Summary

Short description of what changed.

## Added

- New capabilities

## Changed

- Behavior changes

## Fixed

- Bug fixes

## Operational verification

- CI passed
- Smoke tests passed
- Docker image built
- Container endpoint checks passed

## Known limitations

- Current honest limitations

## Rollback note

How to return to the previous known-good state.
```

## Rollback approach

For the current local portfolio project, rollback means returning Git and runtime files to a previous known-good commit or tag.

Inspect recent commits:

```bash
git checkout main
git pull origin main
git log --oneline -10
```

Inspect an older release tag:

```bash
git checkout v0.1.0
```

Return to main:

```bash
git checkout main
```

For a deployed Linux/systemd version, rollback should eventually include:

```text
previous Git commit or release tag
npm ci
npm run build
systemctl restart lfcs-dashboard
health/readiness verification
```

For Docker:

```text
previous image tag
docker compose up -d
container health verification
```

## Branch protection policy

Recommended GitHub settings:

```text
Require pull request before merging
Require status checks before merging
Require CI / Build, smoke test, and Docker verify
Require branches to be up to date before merging
Do not allow direct pushes to main
Require conversation resolution before merging
```

These settings are repository-level controls and are configured in GitHub, not in source code.

## Definition of done for a change

A change is complete only when:

```text
[ ] Code or documentation updated
[ ] Local verification performed when applicable
[ ] CI passes
[ ] Security implications considered
[ ] PR body explains verification
[ ] Screenshots or evidence saved when operational behavior changed
[ ] Merged to main
[ ] Local main pulled after merge
```
