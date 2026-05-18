output "instance_id" {
  description = "EC2 instance ID."
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Public IPv4 address of the EC2 instance."
  value       = aws_instance.app.public_ip
}

output "public_dns" {
  description = "Public DNS name of the EC2 instance."
  value       = aws_instance.app.public_dns
}

output "ssh_command" {
  description = "SSH command for the Ubuntu EC2 instance."
  value       = "ssh -i ~/.ssh/lfcs_aws_ed25519 ubuntu@${aws_instance.app.public_ip}"
}

output "healthz_url" {
  description = "Public health endpoint URL after the app is deployed."
  value       = "http://${aws_instance.app.public_ip}/healthz"
}

output "readyz_url" {
  description = "Public readiness endpoint URL after the app is deployed."
  value       = "http://${aws_instance.app.public_ip}/readyz"
}
