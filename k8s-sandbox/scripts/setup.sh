#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if ! kubectl get secret wildcard-forge-harshitrv-com-tls -n forge >/dev/null 2>&1; then
  echo "Missing secret wildcard-forge-harshitrv-com-tls in namespace forge."
  echo "Issue a DNS-01 wildcard cert, then:"
  echo "  ./scripts/create-wildcard-secret.sh /path/to/fullchain.pem /path/to/privkey.pem"
  exit 1
fi

kubectl apply -f manifests/namespace.yml
kubectl create configmap caddy-config \
  --from-file=Caddyfile=manifests/caddy/Caddyfile \
  -n forge \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f manifests/caddy/deployment.yml -f manifests/caddy/service.yml
kubectl rollout restart deployment/caddy -n forge
kubectl rollout status deployment/caddy -n forge --timeout=120s

kubectl get svc caddy -n forge
