# LFCS Dashboard — Phase 15A AWS EC2 Terraform Baseline

This directory contains the Phase 15A AWS baseline for the LFCS Study Dashboard.

## Scope

This phase provisions one AWS EC2 Ubuntu host using Terraform.

The EC2 instance is intended to run the existing Docker Compose stack after the host is created.

## Included

- Default VPC lookup
- Ubuntu 24.04 EC2 instance
- EC2 security group
- SSH ingress restricted to the operator public IP /32
- Public HTTP ingress on port 80
- EC2 key pair from local SSH public key
- Encrypted gp3 root EBS volume
- Docker installation through user_data
- Terraform outputs for SSH and HTTP verification

## Excluded in Phase 15A

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

## Required local tools

- Terraform
- AWS CLI v2
- SSH
- Git

## Required AWS CLI profile

This project expects the local AWS CLI profile:

    lfcs-admin

Verify it with:

    aws sts get-caller-identity --profile lfcs-admin

## Commands

Initialize Terraform:

    terraform -chdir=infra/aws init

Format Terraform files:

    terraform -chdir=infra/aws fmt -recursive

Validate Terraform files:

    terraform -chdir=infra/aws validate

Create a plan:

    terraform -chdir=infra/aws plan -out=tfplan

Apply infrastructure:

    terraform -chdir=infra/aws apply tfplan

Destroy infrastructure:

    terraform -chdir=infra/aws destroy

## Cost warning

This configuration creates real AWS resources.

Do not leave EC2 running casually.

After evidence collection, destroy the infrastructure unless intentionally keeping it:

    terraform -chdir=infra/aws destroy

## Files that must not be committed

- terraform.tfvars
- terraform.tfstate
- terraform.tfstate.backup
- .terraform/
- tfplan
- private SSH keys
- AWS credentials
