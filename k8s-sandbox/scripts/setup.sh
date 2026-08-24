#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

kubectl apply -f manifests/namespace.yml
kubectl create configmap caddy-config --from-file=Caddyfile=manifests/caddy/Caddyfile -n forge
kubectl apply -f manifests/caddy/deployment.yml -f manifests/caddy/service.yml
kubectl get svc caddy -n forge
