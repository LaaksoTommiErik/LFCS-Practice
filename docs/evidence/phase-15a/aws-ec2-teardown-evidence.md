# Phase 15A — AWS EC2 Teardown Evidence

Terraform destroy was run after Phase 15A evidence collection.

## Destroy result

Terraform reported:

    Destroy complete! Resources: 3 destroyed.

Destroyed resources:

- aws_instance.app
- aws_security_group.app
- aws_key_pair.operator

## Cost safety result

The Phase 15A EC2 instance, security group, and key pair were destroyed after evidence collection.

## Teardown command

    terraform -chdir=infra/aws destroy

## Notes

Local Terraform files such as terraform.tfstate, terraform.tfvars, tfplan, and .terraform/ remain ignored and must not be committed.
