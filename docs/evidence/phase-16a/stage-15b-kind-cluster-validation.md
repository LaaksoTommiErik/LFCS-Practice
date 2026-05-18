# Stage 15B — kind Cluster Validation

2026-05-18T17:26:57+03:00

## Branch
phase-16a-kubernetes-monitoring-basics

## Git status
?? docs/evidence/phase-16a/
?? k8s/

## kind clusters
lfcs-dashboard

## kubectl context
kind-lfcs-dashboard

## cluster-info
Kubernetes control plane is running at https://127.0.0.1:39139
CoreDNS is running at https://127.0.0.1:39139/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.

## nodes
NAME                           STATUS   ROLES           AGE     VERSION   INTERNAL-IP   EXTERNAL-IP   OS-IMAGE                         KERNEL-VERSION      CONTAINER-RUNTIME
lfcs-dashboard-control-plane   Ready    control-plane   2m53s   v1.35.0   172.19.0.2    <none>        Debian GNU/Linux 12 (bookworm)   6.17.0-23-generic   containerd://2.2.0

## system pods
NAMESPACE            NAME                                                   READY   STATUS    RESTARTS   AGE
kube-system          coredns-7d764666f9-8sht8                               1/1     Running   0          2m43s
kube-system          coredns-7d764666f9-flk6b                               1/1     Running   0          2m43s
kube-system          etcd-lfcs-dashboard-control-plane                      1/1     Running   0          2m51s
kube-system          kindnet-q7xfw                                          1/1     Running   0          2m44s
kube-system          kube-apiserver-lfcs-dashboard-control-plane            1/1     Running   0          2m51s
kube-system          kube-controller-manager-lfcs-dashboard-control-plane   1/1     Running   0          2m51s
kube-system          kube-proxy-cwh4d                                       1/1     Running   0          2m44s
kube-system          kube-scheduler-lfcs-dashboard-control-plane            1/1     Running   0          2m51s
local-path-storage   local-path-provisioner-67b8995b4b-gm6jv                1/1     Running   0          2m43s
