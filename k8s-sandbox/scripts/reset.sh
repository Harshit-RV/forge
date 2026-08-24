#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

kubectl delete configmap caddy-config -n forge
kubectl delete deployment caddy -n forge
kubectl create configmap caddy-config --from-file=Caddyfile=manifests/caddy/Caddyfile -n forge
kubectl apply -f manifests/caddy/deployment.yml
kubectl get svc caddy -n forge
