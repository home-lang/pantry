#!/bin/bash
# Pantry Download Script (pure bash, no dependencies)
#
# Downloads packages from S3 registry
# Usage:
#   download.sh --config deps.yaml
#   download.sh --package php.net --version 8.4.17

set -e

# Config
PANTRY_HOME="${PANTRY_HOME:-$HOME/.pantry}"
PANTRY_BUCKET="${PANTRY_BUCKET:-pantry-registry}"
PANTRY_REGION="${PANTRY_REGION:-us-east-1}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse arguments
CONFIG_FILE=""
PACKAGE=""
VERSION=""
QUIET=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -c|--config) CONFIG_FILE="$2"; shift 2 ;;
    -p|--package) PACKAGE="$2"; shift 2 ;;
    -v|--version) VERSION="$2"; shift 2 ;;
    -b|--bucket) PANTRY_BUCKET="$2"; shift 2 ;;
    -r|--region) PANTRY_REGION="$2"; shift 2 ;;
    -q|--quiet) QUIET=true; shift ;;
    -h|--help)
      echo "Usage: download.sh [options]"
      echo ""
      echo "Options:"
      echo "  -c, --config <file>   Config file (deps.yaml or pantry.yaml)"
      echo "  -p, --package <name>  Single package to download"
      echo "  -v, --version <ver>   Version constraint (e.g., ^8.4)"
      echo "  -b, --bucket <name>   S3 bucket (default: pantry-registry)"
      echo "  -r, --region <region> AWS region (default: us-east-1)"
      echo "  -q, --quiet           Suppress output"
      echo "  -h, --help            Show this help"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Detect platform
detect_platform() {
  local os arch
  os=$(uname -s | tr '[:upper:]' '[:lower:]')
  arch=$(uname -m)

  [[ "$os" == "darwin" ]] && os="darwin"
  [[ "$os" == "linux" ]] && os="linux"
  [[ "$arch" == "arm64" || "$arch" == "aarch64" ]] && arch="arm64"
  [[ "$arch" == "x86_64" ]] && arch="x86-64"

  echo "${os}-${arch}"
}

PLATFORM=$(detect_platform)

# Log function
log() {
  [[ "$QUIET" == true ]] && return
  echo -e "$1"
}

# Check if package is installed locally
is_installed() {
  local pkg="$1"
  local pkg_dir="$PANTRY_HOME/$pkg"

  [[ -d "$pkg_dir" ]] && [[ -n "$(ls -A "$pkg_dir" 2>/dev/null)" ]]
}

# Get metadata from S3
get_metadata() {
  local pkg="$1"
  local metadata_url="https://${PANTRY_BUCKET}.s3.${PANTRY_REGION}.amazonaws.com/binaries/${pkg}/metadata.json"

  curl -fsSL "$metadata_url" 2>/dev/null
}

# Resolve version from constraint
resolve_version() {
  local constraint="$1"
  local versions="$2"

  # Remove ^ or ~ prefix
  local clean="${constraint#^}"
  clean="${clean#~}"

  # Get major version
  local major="${clean%%.*}"

  # Find matching version (simple: just get first match with same major)
  echo "$versions" | tr ',' '\n' | grep "^${major}\." | head -1
}

# Download and install a package
download_package() {
  local pkg="$1"
  local version_constraint="$2"

  log "${BLUE}📦${NC} Installing ${pkg}${version_constraint:+@$version_constraint}"

  # Check if already installed
  if is_installed "$pkg"; then
    log "   ${GREEN}✓${NC} Already installed"
    return 0
  fi

  # Get metadata
  log "   Fetching metadata..."
  local metadata
  metadata=$(get_metadata "$pkg")

  if [[ -z "$metadata" ]]; then
    log "   ${RED}✗${NC} Package not found in registry"
    return 1
  fi

  # Parse metadata (simple JSON parsing with grep/sed)
  local latest_version
  latest_version=$(echo "$metadata" | grep -o '"latestVersion"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"latestVersion"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

  # Resolve version
  local version="$latest_version"
  if [[ -n "$version_constraint" ]]; then
    local available_versions
    available_versions=$(echo "$metadata" | grep -o '"versions"[[:space:]]*:[[:space:]]*{[^}]*}' | grep -o '"[0-9][^"]*"' | tr -d '"' | tr '\n' ',')
    local resolved
    resolved=$(resolve_version "$version_constraint" "$available_versions")
    [[ -n "$resolved" ]] && version="$resolved"
  fi

  log "   Version: ${version}"

  # Get tarball info for this platform
  local tarball_path="binaries/${pkg}/${version}/${PLATFORM}/${pkg}-${version}.tar.gz"
  # Handle domain with dots in filename
  local tarball_filename="${pkg}-${version}.tar.gz"
  tarball_filename="${tarball_filename//\//-}"
  tarball_path="binaries/${pkg}/${version}/${PLATFORM}/${tarball_filename}"

  local tarball_url="https://${PANTRY_BUCKET}.s3.${PANTRY_REGION}.amazonaws.com/${tarball_path}"

  # Create install directory
  local install_dir="$PANTRY_HOME/$pkg/$version"
  mkdir -p "$install_dir"

  # Download tarball
  log "   Downloading..."
  local tarball_tmp="$install_dir/package.tar.gz"

  if ! curl -fsSL -o "$tarball_tmp" "$tarball_url" 2>/dev/null; then
    # Try alternate filename format
    tarball_path="binaries/${pkg}/${version}/${PLATFORM}/${pkg//./-}-${version}.tar.gz"
    tarball_url="https://${PANTRY_BUCKET}.s3.${PANTRY_REGION}.amazonaws.com/${tarball_path}"

    if ! curl -fsSL -o "$tarball_tmp" "$tarball_url" 2>/dev/null; then
      log "   ${RED}✗${NC} Download failed"
      rm -rf "$install_dir"
      return 1
    fi
  fi

  # Extract
  log "   Extracting..."
  tar -xzf "$tarball_tmp" -C "$install_dir"
  rm "$tarball_tmp"

  # Make binaries executable
  if [[ -d "$install_dir/bin" ]]; then
    chmod +x "$install_dir/bin"/* 2>/dev/null || true
  fi

  log "   ${GREEN}✓${NC} Installed to $install_dir"
  return 0
}

# Parse deps.yaml and download all packages
download_from_config() {
  local config="$1"

  if [[ ! -f "$config" ]]; then
    log "${RED}✗${NC} Config file not found: $config"
    return 1
  fi

  log "${BLUE}📦 pantry${NC} Installing from ${config}"

  local in_deps=false
  local success=0
  local failed=0

  while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

    # Check for dependencies section
    if [[ "$line" =~ ^dependencies: ]]; then
      in_deps=true
      continue
    fi

    # Check if we've left dependencies section (no leading whitespace)
    if [[ "$in_deps" == true && ! "$line" =~ ^[[:space:]] && "$line" =~ : ]]; then
      in_deps=false
      continue
    fi

    # Parse dependency line
    if [[ "$in_deps" == true && "$line" =~ ^[[:space:]]+([^:]+):[[:space:]]*(.*)$ ]]; then
      local pkg="${BASH_REMATCH[1]}"
      local version="${BASH_REMATCH[2]}"

      # Clean up
      pkg=$(echo "$pkg" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
      version=$(echo "$version" | sed "s/^[[:space:]]*//;s/[[:space:]]*$//;s/['\"]//g")

      if download_package "$pkg" "$version"; then
        ((success++))
      else
        ((failed++))
      fi
    fi
  done < "$config"

  log ""
  log "${GREEN}✓${NC} Installed: $success"
  [[ $failed -gt 0 ]] && log "${RED}✗${NC} Failed: $failed"

  return $failed
}

# Main
main() {
  mkdir -p "$PANTRY_HOME"

  if [[ -n "$CONFIG_FILE" ]]; then
    download_from_config "$CONFIG_FILE"
  elif [[ -n "$PACKAGE" ]]; then
    download_package "$PACKAGE" "$VERSION"
  else
    # Auto-detect config file
    if [[ -f "deps.yaml" ]]; then
      download_from_config "deps.yaml"
    elif [[ -f "pantry.yaml" ]]; then
      download_from_config "pantry.yaml"
    elif [[ -f ".pantry.yaml" ]]; then
      download_from_config ".pantry.yaml"
    else
      echo "No config file found. Use --config or --package"
      exit 1
    fi
  fi
}

main
