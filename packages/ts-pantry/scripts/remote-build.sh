#!/usr/bin/env bash
# Run on a provisioned Linux box. Sources S3 creds + toolchain PATH, ensures
# deps are installed, then builds the requested packages with build-all-packages.
#   remote-build.sh <platform> <force|noforce> [comma,sep,domains]
# With no domain list it runs the FULL buildable sweep (skips what's already in S3).
set -uo pipefail
PLATFORM="${1:?platform}"        # linux-x86-64 | linux-arm64
FORCE_MODE="${2:-noforce}"
DOMAINS="${3:-}"

set -a; source /root/.pantry-hetzner.env; set +a
[ -f /root/.pantry-env.sh ] && source /root/.pantry-env.sh
export PATH="/root/.bun/bin:/root/.cargo/bin:/usr/local/go/bin:$PATH"
export BUILDKIT_ROOT=/root/pantry-build
mkdir -p "$BUILDKIT_ROOT"

# Install deps from the repo root (workspace), but run the build from the
# ts-pantry package dir — discoverPackages() resolves src/recipes, src/pantry
# relative to process.cwd().
cd /root/pantry
if [ ! -d node_modules ]; then
  echo "### bun install"
  bun install --silent 2>&1 | tail -3 || bun install 2>&1 | tail -10
fi

cd /root/pantry/packages/ts-pantry
ARGS=(-b "$S3_BUCKET" -r "$S3_REGION" --platform "$PLATFORM")
[ "$FORCE_MODE" = "force" ] && ARGS+=(--force)
[ -n "$DOMAINS" ] && ARGS+=(-p "$DOMAINS")

echo "### build-all-packages ${ARGS[*]}  cwd=$(pwd)  $(date -u +%FT%TZ)"
bun scripts/build-all-packages.ts "${ARGS[@]}"
echo "### REMOTE-BUILD DONE rc=$? $(date -u +%FT%TZ)"
