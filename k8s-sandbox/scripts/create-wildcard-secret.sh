#!/usr/bin/env bash
# Create/update the wildcard TLS secret Caddy mounts at /etc/certs.
#
# Prerequisites: PEM files for *.forge.harshitrv.com (DNS-01), e.g. from certbot:
#   sudo certbot certonly --manual --preferred-challenges dns \
#     -d '*.forge.harshitrv.com'
#
# Usage: ./scripts/create-wildcard-secret.sh /path/to/fullchain.pem /path/to/privkey.pem
set -euo pipefail
cd "$(dirname "$0")/.."

CERT="${1:?fullchain.pem path required}"
KEY="${2:?privkey.pem path required}"

kubectl create namespace forge --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret tls wildcard-forge-harshitrv-com-tls \
  --cert="$CERT" \
  --key="$KEY" \
  -n forge \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secret wildcard-forge-harshitrv-com-tls upserted in namespace forge."
echo "If Caddy is already running: kubectl rollout restart deployment/caddy -n forge"
