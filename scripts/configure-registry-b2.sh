#!/usr/bin/env bash
set -euo pipefail

# Point the running Pantry registry (EC2) at Backblaze B2 for object storage.
#
# The registry server stays on EC2 but reads/writes package tarballs, binaries
# and the object metadata snapshot from a Backblaze B2 bucket via the
# S3-compatible API. This script writes the B2 configuration into the server's
# systemd unit and restarts it. It also mirrors the values into AWS SSM (same
# pattern as the registry token) so they can be reapplied on a fresh box.
#
# Prerequisites:
#   - A Backblaze B2 bucket + an application key (keyID + applicationKey) scoped
#     to that bucket. The master application key cannot be used with the S3 API.
#   - AWS CLI configured (us-east-1) — the registry box is still on EC2.
#   - SSH key at ~/.ssh/stacks-production.pem
#
# Usage (env vars):
#   B2_BUCKET=pantry-registry \
#   B2_REGION=us-west-004 \
#   B2_APPLICATION_KEY_ID=000xxxxxxxxxxxx0000000001 \
#   B2_APPLICATION_KEY=K000xxxxxxxxxxxxxxxxxxxxxxxxxxx \
#   ./scripts/configure-registry-b2.sh
#
# Optional:
#   B2_ENDPOINT=s3.us-west-004.backblazeb2.com   (default: s3.$B2_REGION.backblazeb2.com)
#   METADATA_BACKEND=object                       (default: object)
#   SKIP_SSM=1                                     (don't write to AWS SSM)

REGISTRY_HOST="${REGISTRY_HOST:-54.243.196.101}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/stacks-production.pem}"
SSH_USER="${SSH_USER:-ec2-user}"
SERVICE_FILE="/etc/systemd/system/pantry-registry.service"
AWS_REGION="us-east-1"

: "${B2_BUCKET:?Set B2_BUCKET to your Backblaze bucket name}"
: "${B2_REGION:?Set B2_REGION (e.g. us-west-004)}"
: "${B2_APPLICATION_KEY_ID:?Set B2_APPLICATION_KEY_ID (the keyID, not the master key)}"
: "${B2_APPLICATION_KEY:?Set B2_APPLICATION_KEY (the applicationKey secret)}"

B2_ENDPOINT="${B2_ENDPOINT:-s3.${B2_REGION}.backblazeb2.com}"
METADATA_BACKEND="${METADATA_BACKEND:-object}"

echo "==> Backblaze B2 registry configuration"
echo "    Bucket:   $B2_BUCKET"
echo "    Region:   $B2_REGION"
echo "    Endpoint: $B2_ENDPOINT"
echo "    Metadata: $METADATA_BACKEND"
echo "    KeyID:    ${B2_APPLICATION_KEY_ID:0:8}…"

if [[ "${SKIP_SSM:-0}" != "1" ]]; then
  echo "==> Mirroring config to AWS SSM (/pantry/b2-*)…"
  aws ssm put-parameter --name /pantry/b2-bucket           --type String       --value "$B2_BUCKET"            --region "$AWS_REGION" --overwrite >/dev/null
  aws ssm put-parameter --name /pantry/b2-region           --type String       --value "$B2_REGION"            --region "$AWS_REGION" --overwrite >/dev/null
  aws ssm put-parameter --name /pantry/b2-endpoint         --type String       --value "$B2_ENDPOINT"          --region "$AWS_REGION" --overwrite >/dev/null
  aws ssm put-parameter --name /pantry/b2-application-key-id --type SecureString --value "$B2_APPLICATION_KEY_ID" --region "$AWS_REGION" --overwrite >/dev/null
  aws ssm put-parameter --name /pantry/b2-application-key  --type SecureString  --value "$B2_APPLICATION_KEY"   --region "$AWS_REGION" --overwrite >/dev/null
  echo "    Stored."
fi

echo "==> Updating registry server ($REGISTRY_HOST)…"
# shellcheck disable=SC2087
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$REGISTRY_HOST" "
  set -e
  # Drop any prior storage env lines so re-running is idempotent.
  sudo sed -i '/^Environment=STORAGE_PROVIDER/d;/^Environment=S3_BUCKET/d;/^Environment=S3_REGION/d;/^Environment=S3_ENDPOINT/d;/^Environment=METADATA_BACKEND/d;/^Environment=B2_APPLICATION_KEY_ID/d;/^Environment=B2_APPLICATION_KEY/d' $SERVICE_FILE
  # Append the B2 storage configuration to the [Service] section.
  sudo sed -i '/^\[Service\]/a Environment=STORAGE_PROVIDER=backblaze\nEnvironment=S3_BUCKET=$B2_BUCKET\nEnvironment=S3_REGION=$B2_REGION\nEnvironment=S3_ENDPOINT=$B2_ENDPOINT\nEnvironment=METADATA_BACKEND=$METADATA_BACKEND\nEnvironment=B2_APPLICATION_KEY_ID=$B2_APPLICATION_KEY_ID\nEnvironment=B2_APPLICATION_KEY=$B2_APPLICATION_KEY' $SERVICE_FILE
  sudo systemctl daemon-reload
  sudo systemctl restart pantry-registry
  sleep 2
  sudo systemctl is-active pantry-registry
" 2>/dev/null
echo "    Registry restarted."

echo ""
echo "Done. The registry now uses Backblaze B2 ($B2_BUCKET @ $B2_ENDPOINT)."
echo "Verify: curl -fsS https://registry.pantry.dev/health"
