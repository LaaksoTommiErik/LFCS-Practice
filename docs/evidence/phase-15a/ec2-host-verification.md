# Phase 15A EC2 Host Verification

Date: 2026-05-18T13:35:14+03:00

## Terraform outputs
healthz_url = "http://13.50.225.65/healthz"
instance_id = "i-092d3de8032fd1b23"
public_dns = "ec2-13-50-225-65.eu-north-1.compute.amazonaws.com"
public_ip = "13.50.225.65"
readyz_url = "http://13.50.225.65/readyz"
ssh_command = "ssh -i ~/.ssh/lfcs_aws_ed25519 ubuntu@13.50.225.65"

## EC2 instance state
-------------------------------------------------------
|                  DescribeInstances                  |
+---------------+-------------------------------------+
|  InstanceType |  t3.micro                           |
|  KeyName      |  lfcs-dashboard-phase-15a-operator  |
|  PublicIp     |  13.50.225.65                       |
|  State        |  running                            |
|  SubnetId     |  subnet-01314b7563d41efc2           |
|  VpcId        |  vpc-0b5768e9bd3216d7b              |
+---------------+-------------------------------------+
