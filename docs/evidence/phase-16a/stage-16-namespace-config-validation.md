# Stage 16 — Namespace and Configuration Validation

2026-05-18T17:38:05+03:00

## Branch
phase-16a-kubernetes-config

## Git status
 M .gitignore
?? docs/evidence/phase-16a/stage-16-namespace-config-validation.md
?? k8s/base/
?? k8s/local/

## Namespace
NAME             STATUS   AGE   LABELS
lfcs-dashboard   Active   19s   app.kubernetes.io/name=lfcs-dashboard,app.kubernetes.io/part-of=lfcs-dashboard,kubernetes.io/metadata.name=lfcs-dashboard

## ConfigMap
apiVersion: v1
data:
  NODE_ENV: production
  PORT: "3000"
  POSTGRES_DB: lfcs_dashboard
  POSTGRES_HOST: postgres
  POSTGRES_PORT: "5432"
kind: ConfigMap
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"v1","data":{"NODE_ENV":"production","PORT":"3000","POSTGRES_DB":"lfcs_dashboard","POSTGRES_HOST":"postgres","POSTGRES_PORT":"5432"},"kind":"ConfigMap","metadata":{"annotations":{},"labels":{"app.kubernetes.io/component":"config","app.kubernetes.io/name":"lfcs-dashboard"},"name":"lfcs-dashboard-config","namespace":"lfcs-dashboard"}}
  creationTimestamp: "2026-05-18T14:37:46Z"
  labels:
    app.kubernetes.io/component: config
    app.kubernetes.io/name: lfcs-dashboard
  name: lfcs-dashboard-config
  namespace: lfcs-dashboard
  resourceVersion: "1502"
  uid: 48237a9e-1ed2-4de6-a5e7-65789ee8a429

## Namespace resources
