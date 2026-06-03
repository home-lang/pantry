#!/usr/bin/env bash
# Targeted darwin-arm64 gap-fill: build only the missing packages in small,
# disk-safe chunks, pruning build trees between chunks. Logs per-package
# outcome to /tmp/gapfill-darwin.log. Aborts a chunk's heavy builds if disk
# drops below MIN_FREE_GB after a prune.
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"
set -a; source ~/.pantry-hetzner.env; set +a
export PATH="/opt/homebrew/bin:$HOME/.cargo/bin:$HOME/.local/share/pantry/global/bin:$PATH"
export BUILDKIT_ROOT=/tmp/pantry-build
export HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_INSTALL_CLEANUP=1
mkdir -p "$BUILDKIT_ROOT"

PLATFORM=darwin-arm64
MISS_FILE="${1:-/tmp/miss-darwin-arm64.txt}"
CHUNK=6
MIN_FREE_GB=7
LOG=/tmp/gapfill-darwin.log
: > "$LOG"

free_gb() { df -Pk / | awk 'NR==2{print int($4/1024/1024)}'; }
prune() {
  rm -rf "$BUILDKIT_ROOT"/* /tmp/buildkit-* 2>/dev/null
  brew cleanup -s >/dev/null 2>&1 || true
}

mapfile -t PKGS < <(grep -E '^[a-z0-9]' "$MISS_FILE")
TOTAL=${#PKGS[@]}
echo "=== darwin-arm64 gap-fill: $TOTAL pkgs, chunk=$CHUNK, $(date -u +%FT%TZ) ===" | tee -a "$LOG"

i=0
while [ "$i" -lt "$TOTAL" ]; do
  fg=$(free_gb)
  if [ "${fg:-0}" -lt "$MIN_FREE_GB" ]; then
    echo "### low disk ${fg}GB — pruning" | tee -a "$LOG"; prune; fg=$(free_gb)
    [ "${fg:-0}" -lt "$MIN_FREE_GB" ] && { echo "### ABORT low disk ${fg}GB at idx $i" | tee -a "$LOG"; exit 2; }
  fi
  chunk=("${PKGS[@]:$i:$CHUNK}")
  joined=$(IFS=,; echo "${chunk[*]}")
  echo "### CHUNK @${i}/${TOTAL} free=${fg}GB :: $joined  $(date -u +%H:%M:%SZ)" | tee -a "$LOG"
  bun scripts/build-all-packages.ts -b "$S3_BUCKET" -r "$S3_REGION" \
      --platform "$PLATFORM" -p "$joined" >>"$LOG" 2>&1
  # Emit per-chunk summary line for monitoring
  grep -E "uploaded,|Total:|✅|❌|Failed \(" "$LOG" | tail -3 | sed 's/^/  /'
  prune
  i=$((i + CHUNK))
done
echo "=== GAPFILL DONE $(date -u +%FT%TZ) ===" | tee -a "$LOG"
echo "UPLOADED_TOTAL: $(grep -cE 'Uploaded|✅.*uploaded' "$LOG")"