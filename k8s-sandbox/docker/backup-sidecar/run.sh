#!/bin/sh

set -eu

WORKSPACE_DIR="/workspace"
BACKUP_FILE="/tmp/workspace.tar.gz"
BACKUP_KEY="${PROJECT_ID}/workspace.tar.gz"

echo "Starting workspace backup for project: ${PROJECT_ID}"

tar \
  --exclude="node_modules" \
  --exclude=".vite" \
  --exclude="dist" \
  --exclude=".forge" \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='coverage' \
  -czf "${BACKUP_FILE}" -C "${WORKSPACE_DIR}" .

echo "Workspace archived successfully"

aws s3 cp $BACKUP_FILE "s3://${S3_BUCKET}/${BACKUP_KEY}" --endpoint-url $S3_ENDPOINT

rm -f $BACKUP_FILE

echo "Workspace backup completed for project: ${PROJECT_ID}"