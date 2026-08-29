#!/bin/sh
set -e

WORKSPACE_DIR=/workspace
BACKUP_DOWNLOAD_DIR=/
TEMPLATE_DIR=/opt/templates/starter-react-app/
BACKUP_FILE="${BACKUP_DOWNLOAD_DIR}/workspace.tar.gz"
BACKUP_KEY="${PROJECT_ID}/workspace.tar.gz"

echo "Initializing workspace for project: ${PROJECT_ID}"

mkdir -p $WORKSPACE_DIR

if aws s3 cp "s3://${S3_BUCKET}/${BACKUP_KEY}" $BACKUP_FILE --endpoint-url $S3_ENDPOINT; then
  tar -xzf $BACKUP_DOWNLOAD_DIR/workspace.tar.gz -C $WORKSPACE_DIR
  rm -f $BACKUP_DOWNLOAD_DIR/workspace.tar.gz
  echo "Restore completed for project: $PROJECT_ID"
else
  echo "No backup found at s3://${S3_BUCKET}/${PROJECT_ID}/workspace.tar.gz"
  cp -r "${TEMPLATE_DIR}/." "$WORKSPACE_DIR/"
  echo "Template copied to workspace for project: $PROJECT_ID"
fi
