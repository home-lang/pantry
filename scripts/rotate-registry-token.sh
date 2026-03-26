#!/usr/bin/env bash
set -euo pipefail

# Rotate the Pantry Registry token.
#
# This script:
# 1. Generates a new ptry_ token
# 2. Stores it in AWS SSM (/pantry/registry-token)
# 3. Updates the registry server's systemd config
# 4. Restarts the registry service
# 5. Updates GitHub secrets on specified repos
#
# Prerequisites:
#   - AWS CLI configured (us-east-1)
#   - SSH key at ~/.ssh/stacks-production.pem
#   - gh CLI authenticated
#
# Usage:
#   ./scripts/rotate-registry-token.sh
#   ./scripts/rotate-registry-token.sh --repos "pickier/pickier,home-lang/pantry"

REGISTRY_HOST="54.243.196.101"
SSH_KEY="$HOME/.ssh/stacks-production.pem"
SSH_USER="ec2-user"
SSM_PARAM="/pantry/registry-token"
AWS_REGION="us-east-1"
SERVICE_FILE="/etc/systemd/system/pantry-registry.service"

# Default repos to update
DEFAULT_REPOS="pickier/pickier,home-lang/pantry"

# Parse args
REPOS="${1:---repos}"
if [[ "$REPOS" == "--repos" ]]; then
  REPOS="${2:-$DEFAULT_REPOS}"
fi
if [[ "$REPOS" == "$DEFAULT_REPOS" ]] && [[ "${1:-}" != "--repos" ]] && [[ -n "${1:-}" ]]; then
  REPOS="$1"
fi
[[ "$REPOS" == "--repos" ]] && REPOS="$DEFAULT_REPOS"

echo "==> Generating new token..."
TOKEN=$(bun -e "console.log('ptry_' + require('node:crypto').randomBytes(32).toString('hex'))")
echo "    Token: ${TOKEN:0:20}..."

echo "==> Storing in AWS SSM ($SSM_PARAM)..."
aws ssm put-parameter \
  --name "$SSM_PARAM" \
  --type "SecureString" \
  --value "$TOKEN" \
  --description "Pantry registry admin token for commit publishing (rotated $(date -u +%Y-%m-%dT%H:%M:%SZ))" \
  --region "$AWS_REGION" \
  --overwrite > /dev/null
echo "    Stored."

echo "==> Updating registry server ($REGISTRY_HOST)..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$REGISTRY_HOST" "
  # Remove any existing PANTRY_REGISTRY_TOKEN line
  sudo sed -i '/PANTRY_REGISTRY_TOKEN/d' $SERVICE_FILE
  # Add the new token after the NPM_FALLBACK line
  sudo sed -i '/^Environment=NPM_FALLBACK/a Environment=PANTRY_REGISTRY_TOKEN=$TOKEN' $SERVICE_FILE
  sudo systemctl daemon-reload
  sudo systemctl restart pantry-registry
" 2>/dev/null
echo "    Registry restarted."

echo "==> Updating GitHub secrets..."
IFS=',' read -ra REPO_LIST <<< "$REPOS"
for repo in "${REPO_LIST[@]}"; do
  repo=$(echo "$repo" | xargs) # trim whitespace
  gh secret set PANTRY_TOKEN --repo "$repo" --body "$TOKEN"
  echo "    Updated: $repo"
done

echo ""
echo "Done. Token rotated successfully."
echo "SSM:      $SSM_PARAM"
echo "Server:   $REGISTRY_HOST"
echo "Repos:    $REPOS"
