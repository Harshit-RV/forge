#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if ! kubectl get secret wildcard-forge-harshitrv-com-tls -n forge >/dev/null 2>&1; then
  echo "Missing secret wildcard-forge-harshitrv-com-tls — run create-wildcard-secret.sh first."
  exit 1
fi

kubectl delete configmap caddy-config -n forge --ignore-not-found
kubectl delete deployment caddy -n forge --ignore-not-found

kubectl create configmap caddy-config \
  --from-file=Caddyfile=manifests/caddy/Caddyfile \
  -n forge
kubectl apply -f manifests/caddy/deployment.yml -f manifests/caddy/service.yml
kubectl rollout status deployment/caddy -n forge --timeout=120s

kubectl get svc caddy -n forge
