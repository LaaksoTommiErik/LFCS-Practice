# Phase 15B — AWS Deployment Portfolio Summary

This document summarizes the employer-facing value of the Phase 15A AWS/Terraform deployment work.

## Summary

The LFCS Study Dashboard now includes a Terraform-managed AWS EC2 baseline deployment.

The deployment provisions one Ubuntu EC2 host, installs Docker through EC2 `user_data`, deploys the existing Docker Compose operations stack, verifies public health/readiness endpoints, verifies metrics and observability services from the EC2-local network, records evidence, and tears the infrastructure down after evidence collection.

## What this proves

This phase proves that the project can be moved from a local Docker Compose environment to a real AWS host using Infrastructure as Code.

Evidence exists for:

- Terraform planning and applying infrastructure
- EC2 instance creation
- SSH access through a restricted `/32` ingress rule
- Docker installation through `user_data`
- Docker Compose stack deployment on EC2
- Public `/healthz`
- Public `/readyz` with PostgreSQL readiness
- EC2-local `/metrics`
- Prometheus health
- Grafana reachability
- Alertmanager health
- Blackbox Exporter health
- Alert webhook health
- Security group ingress review
- Terraform teardown

## What this does not prove

This phase does not claim production-grade AWS architecture.

The current AWS baseline does not include:

- DNS
- TLS
- ALB
- RDS
- ECS
- EKS
- S3 backup storage
- Secrets Manager
- Terraform remote state
- multi-AZ architecture
- external alert notification integration

These are known future improvements.

## Security decisions

The Terraform baseline includes several security-conscious defaults:

- SSH is restricted to the operator public IP `/32`.
- Public ingress is limited to HTTP port 80.
- Observability ports are not publicly opened in the AWS security group.
- EC2 metadata requires IMDSv2.
- The root EBS volume is encrypted.
- Terraform local state, tfvars, tfplan files, AWS credentials, and private SSH keys are ignored and must not be committed.

## Cost control

The EC2 instance was destroyed after evidence collection.

Teardown command:

    terraform -chdir=infra/aws destroy

Evidence:

    docs/evidence/phase-15a/aws-ec2-teardown-evidence.md

## Interview explanation

A concise interview explanation:

> I built the LFCS Study Dashboard as an operations-focused portfolio project. After containerizing and instrumenting it locally, I added a Terraform-managed AWS EC2 baseline. Terraform provisions an Ubuntu EC2 instance, restricts SSH to my public IP, exposes only HTTP 80 publicly, installs Docker through user_data, and runs the existing Docker Compose stack. I verified public health and readiness endpoints, checked metrics and observability services from the EC2-local network, documented the runbook, captured evidence, and destroyed the resources afterward to control cost.

## Best evidence files

- `infra/aws/README.md`
- `docs/runbooks/aws-ec2-deployment.md`
- `docs/evidence/phase-15a/aws-ec2-deployment-evidence.md`
- `docs/evidence/phase-15a/aws-ec2-teardown-evidence.md`

## Next improvements

Recommended next improvements:

1. Add DNS and TLS.
2. Add Kubernetes or ECS deployment path.
3. Add centralized logs with Loki or equivalent.
4. Add OpenTelemetry tracing.
5. Add external notification routing such as Slack or PagerDuty-style integration.
