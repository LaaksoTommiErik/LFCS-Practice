# LFCS Dashboard — AWS EC2 Terraform Deployment Runbook

This runbook documents the Phase 15A AWS baseline deployment for the LFCS Study Dashboard.

## Scope

Phase 15A provisions one AWS EC2 Ubuntu host with Terraform, installs Docker through user_data, deploys the existing Docker Compose stack, and verifies the app through public HTTP.

## Included

- Terraform under infra/aws/
- Default AWS VPC
- Ubuntu EC2 instance
- SSH restricted to operator public IP /32
- Public HTTP port 80 for the dashboard
- Docker installed by user_data
- Docker Compose stack deployed to /opt/lfcs-dashboard
- Public /healthz and /readyz checks
- EC2-local /metrics and observability checks

## Excluded

- EKS
- ECS
- RDS
- ALB
- DNS
- TLS
- Route 53
- S3 backups
- Secrets Manager
- Terraform remote state
- Multi-AZ production architecture

## Prerequisites

Required local tools:

- Terraform
- AWS CLI v2
- SSH
- Git

Required AWS profile:

    lfcs-admin

Verify:

    aws sts get-caller-identity --profile lfcs-admin
    aws configure get region --profile lfcs-admin

Expected region:

    eu-north-1

## Cost warning

This deployment creates real AWS resources.

Do not leave the EC2 instance running casually.

Teardown command:

    terraform -chdir=infra/aws destroy

## Terraform workflow

Initialize:

    terraform -chdir=infra/aws init

Format:

    terraform -chdir=infra/aws fmt -recursive

Validate:

    terraform -chdir=infra/aws validate

Plan:

    terraform -chdir=infra/aws plan -out=tfplan

Apply:

    terraform -chdir=infra/aws apply tfplan

Outputs:

    terraform -chdir=infra/aws output

## SSH access

Get the public IP:

    terraform -chdir=infra/aws output -raw public_ip

SSH to the host:

    ssh -i ~/.ssh/lfcs_aws_ed25519 ubuntu@PUBLIC_IP

## Docker host verification

Run on EC2:

    sudo systemctl status docker --no-pager
    docker --version
    docker compose version
    sudo tail -n 80 /var/log/lfcs-dashboard-user-data.log
    ls -ld /opt/lfcs-dashboard

## Deployment procedure

On EC2, the repository is deployed to:

    /opt/lfcs-dashboard

The stack is started with:

    sudo docker compose --env-file .env up -d --build

Minimal EC2 `.env` example:

    NODE_ENV=production
    LFCS_DASHBOARD_PORT=80
    ENABLE_HTTPS=false
    DATABASE_URL=postgresql://lfcs:lfcs@postgres:5432/lfcs_dashboard
    SESSION_SECRET=<generated-secret>
    GRAFANA_ADMIN_USER=admin
    GRAFANA_ADMIN_PASSWORD=<generated-secret>

`ENABLE_HTTPS=false` is required for the raw HTTP EC2 baseline. If HTTPS/TLS is added later, set `ENABLE_HTTPS=true` so HTTPS-specific security headers can be enabled safely.

Check services:

    sudo docker compose --env-file .env ps

## Public verification

From local workstation:

    PUBLIC_IP="$(terraform -chdir=infra/aws output -raw public_ip)"
    curl -fsS "http://${PUBLIC_IP}/healthz"
    curl -fsS "http://${PUBLIC_IP}/readyz"
    curl -fsSI "http://${PUBLIC_IP}/" | head -n 10

Expected:

- /healthz returns healthy JSON
- /readyz returns ready JSON with database ok
- / returns HTTP 200

## EC2-local observability verification

Run through SSH:

    curl -fsS http://127.0.0.1/metrics | head -n 20
    curl -fsS http://127.0.0.1:9090/-/healthy
    curl -fsSI http://127.0.0.1:3001/login | head -n 5
    curl -fsS http://127.0.0.1:9093/-/healthy
    curl -fsS http://127.0.0.1:9115/-/healthy
    curl -fsS http://127.0.0.1:9094/healthz

## Security notes

- SSH is restricted to the operator public IP /32.
- Public HTTP is open on port 80 for the app.
- Observability services are not opened in the AWS security group.
- Terraform state, tfvars, tfplan files, private SSH keys, and AWS credentials must not be committed.
- This is a portfolio baseline, not production-grade AWS architecture.

## Teardown

Destroy resources:

    terraform -chdir=infra/aws destroy

Verify destroy:

    terraform -chdir=infra/aws plan

Expected after destroy:

    Plan: 3 to add, 0 to change, 0 to destroy

This means Terraform would recreate the destroyed baseline if applied again.
