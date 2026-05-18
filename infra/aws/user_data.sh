#!/usr/bin/env bash
set -euxo pipefail

exec > >(tee -a /var/log/lfcs-dashboard-user-data.log) 2>&1

export DEBIAN_FRONTEND=noninteractive

apt-get update

apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  git \
  lsb-release

install -m 0755 -d /etc/apt/keyrings

if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
fi

chmod a+r /etc/apt/keyrings/docker.gpg

. /etc/os-release

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME} stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update

apt-get install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

systemctl enable --now docker

usermod -aG docker ubuntu || true

mkdir -p /opt/lfcs-dashboard
chown ubuntu:ubuntu /opt/lfcs-dashboard

cat > /etc/motd <<'MOTD'
LFCS Dashboard Phase 15A EC2 host

Docker is installed by Terraform user_data.
Application deployment is performed separately after Terraform apply.

Useful checks:
  sudo systemctl status docker --no-pager
  docker --version
  docker compose version
  sudo tail -n 100 /var/log/lfcs-dashboard-user-data.log
MOTD

docker --version
docker compose version
