variable "aws_region" {
  description = "AWS region for the Phase 15A EC2 baseline."
  type        = string
  default     = "eu-north-1"
}

variable "aws_profile" {
  description = "Local AWS CLI profile used by Terraform."
  type        = string
  default     = "lfcs-admin"
}

variable "project_name" {
  description = "Project name used for AWS resource names and tags."
  type        = string
  default     = "lfcs-dashboard"
}

variable "environment" {
  description = "Environment label for resource tags."
  type        = string
  default     = "phase-15a"
}

variable "allowed_ssh_cidr" {
  description = "Public IPv4 CIDR allowed to SSH into the EC2 instance. Use your-ip/32."
  type        = string
}

variable "public_key_path" {
  description = "Path to the local public SSH key registered as the EC2 key pair."
  type        = string
  default     = "~/.ssh/lfcs_aws_ed25519.pub"
}

variable "instance_type" {
  description = "EC2 instance type for the baseline host."
  type        = string
  default     = "t3.micro"
}

variable "root_volume_size_gb" {
  description = "Root EBS volume size in GiB."
  type        = number
  default     = 16
}
