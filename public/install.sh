#!/bin/bash
# Pantry Installer
#
# Usage:
#   curl -fsSL https://pantry.dev | bash
#
# Options (via env vars):
#   PANTRY_INSTALL_DIR  — where to put the binary (default: ~/.local/bin)
#   PANTRY_VERSION      — specific version to install (default: latest)

set -euo pipefail

PANTRY_INSTALL_DIR="${PANTRY_INSTALL_DIR:-$HOME/.local/bin}"
PANTRY_VERSION="${PANTRY_VERSION:-latest}"
REPO="home-lang/pantry"

# Colors
if [ -t 1 ]; then
  GREEN='\033[0;32m'
  DIM='\033[2m'
  BOLD='\033[1m'
  RESET='\033[0m'
else
  GREEN='' DIM='' BOLD='' RESET=''
fi

info() { printf "${DIM}%s${RESET}\n" "$1"; }
success() { printf "${GREEN}${BOLD}%s${RESET}\n" "$1"; }
error() { printf "\033[0;31m%s\033[0m\n" "$1" >&2; exit 1; }

# Detect platform
detect_platform() {
  local os arch
  os=$(uname -s)
  arch=$(uname -m)

  case "$os" in
    Darwin) os="darwin" ;;
    Linux)  os="linux" ;;
    FreeBSD) os="freebsd" ;;
    MINGW*|MSYS*|CYGWIN*) os="windows" ;;
    *) error "Unsupported OS: $os" ;;
  esac

  case "$arch" in
    x86_64|amd64) arch="x64" ;;
    arm64|aarch64) arch="arm64" ;;
    *) error "Unsupported architecture: $arch" ;;
  esac

  echo "${os}-${arch}"
}

# Resolve version tag
resolve_version() {
  if [ "$PANTRY_VERSION" = "latest" ]; then
    local tag
    tag=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
      | grep '"tag_name"' | head -1 | sed 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
    [ -z "$tag" ] && error "Failed to fetch latest version"
    echo "$tag"
  else
    echo "v${PANTRY_VERSION#v}"
  fi
}

TMP_DIR=""
cleanup() { [ -n "$TMP_DIR" ] && rm -rf "$TMP_DIR"; }
trap cleanup EXIT

main() {
  local platform version zip_name url

  platform=$(detect_platform)
  info "Detected platform: ${platform}"

  version=$(resolve_version)
  info "Installing pantry ${version}..."

  zip_name="pantry-${platform}.zip"
  url="https://github.com/${REPO}/releases/download/${version}/${zip_name}"

  TMP_DIR=$(mktemp -d)

  # Download
  curl -fsSL -o "${TMP_DIR}/${zip_name}" "$url" \
    || error "Download failed. Check https://github.com/${REPO}/releases for available builds."

  # Extract
  unzip -qo "${TMP_DIR}/${zip_name}" -d "${TMP_DIR}" \
    || error "Extraction failed"

  # Install
  mkdir -p "$PANTRY_INSTALL_DIR"
  local bin_name="pantry"
  [ "$platform" = "windows-x64" ] && bin_name="pantry.exe"
  cp "${TMP_DIR}/${bin_name}" "${PANTRY_INSTALL_DIR}/${bin_name}"
  chmod +x "${PANTRY_INSTALL_DIR}/${bin_name}"

  # Verify
  if ! "${PANTRY_INSTALL_DIR}/${bin_name}" --version >/dev/null 2>&1; then
    error "Installation verification failed"
  fi

  # Ensure PATH
  local in_path=false
  case ":$PATH:" in
    *":${PANTRY_INSTALL_DIR}:"*) in_path=true ;;
  esac

  echo ""
  success "pantry ${version} installed to ${PANTRY_INSTALL_DIR}/${bin_name}"
  echo ""

  if [ "$in_path" = false ]; then
    local shell_name rc_file
    shell_name=$(basename "${SHELL:-/bin/bash}")
    case "$shell_name" in
      zsh)  rc_file="$HOME/.zshrc" ;;
      bash) rc_file="$HOME/.bashrc" ;;
      fish) rc_file="$HOME/.config/fish/config.fish" ;;
      *)    rc_file="$HOME/.profile" ;;
    esac

    # Add to PATH in shell rc
    if [ "$shell_name" = "fish" ]; then
      if ! grep -q "PANTRY_INSTALL_DIR\|${PANTRY_INSTALL_DIR}" "$rc_file" 2>/dev/null; then
        echo "" >> "$rc_file"
        echo "fish_add_path ${PANTRY_INSTALL_DIR}" >> "$rc_file"
      fi
    else
      if ! grep -q "PANTRY_INSTALL_DIR\|${PANTRY_INSTALL_DIR}" "$rc_file" 2>/dev/null; then
        echo "" >> "$rc_file"
        echo "export PATH=\"${PANTRY_INSTALL_DIR}:\$PATH\"" >> "$rc_file"
      fi
    fi

    info "Added ${PANTRY_INSTALL_DIR} to PATH in ${rc_file}"
    echo ""
    info "To get started, run:"
    echo ""
    echo "  source ${rc_file} && pantry bootstrap"
  else
    info "To get started, run:"
    echo ""
    echo "  pantry bootstrap"
  fi
  echo ""
}

main
