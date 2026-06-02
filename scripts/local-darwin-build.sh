#!/usr/bin/env bash
# Build darwin-arm64 source packages locally on a Mac and upload to Hetzner.
# Skips artifacts already present (no --force) so it only fills gaps. Cleans
# build trees between batches and guards free disk (laptops run tight).
#
# Requires object-storage creds in ~/.pantry-hetzner.env (STORAGE_PROVIDER,
# S3_BUCKET, S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY).
# Run on an Apple-Silicon Mac with bun + Xcode + Homebrew build tools.
set -uo pipefail

# Repo root derived from this script's location so it works on any machine.
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO/packages/ts-pantry"
set -a; source ~/.pantry-hetzner.env; set +a
export PATH="/opt/homebrew/bin:$HOME/.cargo/bin:$HOME/.local/share/pantry/global/bin:$PATH"
export BUILDKIT_ROOT=/tmp/pantry-build
export HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_INSTALL_CLEANUP=1
mkdir -p "$BUILDKIT_ROOT"

PLATFORM=darwin-arm64
BATCH_SIZE=50
MIN_FREE_GB=8

# POSIX df (-Pk) works under both BSD and GNU df; available KB -> GB.
free_gb() { df -Pk / | awk 'NR==2{print int($4/1024/1024)}'; }
prune() {
  rm -rf "$BUILDKIT_ROOT"/* 2>/dev/null
  rm -rf /tmp/buildkit-* 2>/dev/null
  brew cleanup -s >/dev/null 2>&1
  cargo cache --autoclean >/dev/null 2>&1 || true
}

TOTAL=$(bun scripts/build-all-packages.ts --count-only --platform "$PLATFORM" 2>/dev/null | tail -1)
[ -z "$TOTAL" ] && { echo "FATAL: could not get package count"; exit 1; }
LAST=$(( (TOTAL - 1) / BATCH_SIZE ))
echo "=== local darwin-arm64 build: $TOTAL pkgs, batches 0..$LAST, $(date -u +%FT%TZ) ==="

for b in $(seq 0 "$LAST"); do
  fg=$(free_gb)
  echo "### BATCH $b/$LAST  free=${fg}GB  $(date -u +%H:%M:%SZ)"
  if [ "${fg:-0}" -lt "$MIN_FREE_GB" ]; then
    echo "### low disk (${fg}GB) — pruning"
    prune
    fg=$(free_gb)
    [ "${fg:-0}" -lt "$MIN_FREE_GB" ] && { echo "### ABORT: still low disk ${fg}GB at batch $b"; exit 2; }
  fi
  bun scripts/build-all-packages.ts -b "$S3_BUCKET" -r "$S3_REGION" \
      --platform "$PLATFORM" --batch "$b" --batch-size "$BATCH_SIZE" 2>&1
  prune
done
echo "=== ALL BATCHES DONE $(date -u +%FT%TZ) ==="
