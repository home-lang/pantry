#!/usr/bin/env bash
# Bootstrap a fresh Ubuntu box (x86-64 or aarch64) with the toolchain needed to
# source-build the pantry recipe set. Idempotent-ish: re-running re-installs apt
# pkgs (fast if present) and skips lang toolchains already on disk.
set -uo pipefail
export DEBIAN_FRONTEND=noninteractive
ARCH="$(uname -m)"  # x86_64 | aarch64
LOG=/root/bootstrap.log
exec > >(tee -a "$LOG") 2>&1
echo "=== bootstrap start $(date -u +%FT%TZ) arch=$ARCH ==="

echo "### apt update + base toolchain"
apt-get update -y
apt-get install -y --no-install-recommends \
  build-essential clang lld cmake ninja-build \
  autoconf automake libtool pkg-config m4 \
  bison flex gettext texinfo gperf \
  curl wget xz-utils unzip zip ca-certificates \
  zlib1g-dev libssl-dev libreadline-dev libncurses-dev \
  python3 python3-pip python3-venv \
  git rsync file patch

echo "### bun"
if [ ! -x /root/.bun/bin/bun ]; then
  curl -fsSL https://bun.sh/install | bash
fi
export PATH="/root/.bun/bin:$PATH"
bun --version || echo "bun MISSING"

echo "### rust"
if [ ! -x /root/.cargo/bin/cargo ]; then
  curl -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal
fi
export PATH="/root/.cargo/bin:$PATH"
cargo --version || echo "cargo MISSING"

echo "### go"
if ! /usr/local/go/bin/go version >/dev/null 2>&1; then
  case "$ARCH" in
    x86_64)  GOARCH=amd64 ;;
    aarch64) GOARCH=arm64 ;;
    *) GOARCH=amd64 ;;
  esac
  GOVER=1.23.4
  curl -fsSL "https://go.dev/dl/go${GOVER}.linux-${GOARCH}.tar.gz" -o /tmp/go.tgz
  rm -rf /usr/local/go && tar -C /usr/local -xzf /tmp/go.tgz && rm -f /tmp/go.tgz
fi
/usr/local/go/bin/go version || echo "go MISSING"

# persist PATH for non-interactive ssh
cat > /root/.pantry-env.sh <<'EOF'
export PATH="/root/.bun/bin:/root/.cargo/bin:/usr/local/go/bin:$PATH"
EOF

echo "=== bootstrap DONE $(date -u +%FT%TZ) ==="
