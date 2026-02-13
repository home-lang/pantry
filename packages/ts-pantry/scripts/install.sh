#!/bin/bash
# Pantry Install Script
#
# One-liner install:
#   curl -fsSL https://pantry-registry.s3.us-east-1.amazonaws.com/install.sh | bash
#
# With custom bucket:
#   curl -fsSL https://pantry-registry.s3.us-east-1.amazonaws.com/install.sh | PANTRY_BUCKET=my-bucket bash
#
# NO DEPENDENCIES REQUIRED - just bash and curl (pre-installed on Mac/Linux)

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${BLUE}📦 Installing Pantry...${NC}"
echo ""

# Config
PANTRY_HOME="${PANTRY_HOME:-$HOME/.pantry}"
PANTRY_BUCKET="${PANTRY_BUCKET:-pantry-registry}"
PANTRY_REGION="${PANTRY_REGION:-us-east-1}"

# Detect shell
SHELL_NAME=$(basename "$SHELL")
if [[ "$SHELL_NAME" == "zsh" ]]; then
  SHELL_RC="$HOME/.zshrc"
elif [[ "$SHELL_NAME" == "bash" ]]; then
  SHELL_RC="$HOME/.bashrc"
else
  SHELL_RC="$HOME/.profile"
fi

# Create directories
echo -e "${BLUE}Creating $PANTRY_HOME...${NC}"
mkdir -p "$PANTRY_HOME/scripts"

# ============================================
# Create download.sh (pure bash, no deps)
# ============================================
echo -e "${BLUE}Installing download script...${NC}"

cat > "$PANTRY_HOME/scripts/download.sh" << 'DOWNLOAD_SCRIPT'
#!/bin/bash
set -e

PANTRY_HOME="${PANTRY_HOME:-$HOME/.pantry}"
PANTRY_BUCKET="${PANTRY_BUCKET:-pantry-registry}"
PANTRY_REGION="${PANTRY_REGION:-us-east-1}"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

CONFIG_FILE=""
QUIET=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -c|--config) CONFIG_FILE="$2"; shift 2 ;;
    -b|--bucket) PANTRY_BUCKET="$2"; shift 2 ;;
    -r|--region) PANTRY_REGION="$2"; shift 2 ;;
    -q|--quiet) QUIET=true; shift ;;
    *) shift ;;
  esac
done

detect_platform() {
  local os arch
  os=$(uname -s | tr '[:upper:]' '[:lower:]')
  arch=$(uname -m)
  [[ "$arch" == "arm64" || "$arch" == "aarch64" ]] && arch="arm64"
  [[ "$arch" == "x86_64" ]] && arch="x86-64"
  echo "${os}-${arch}"
}

PLATFORM=$(detect_platform)

log() { [[ "$QUIET" != true ]] && echo -e "$1"; }

is_installed() {
  local pkg="$1"
  [[ -d "$PANTRY_HOME/$pkg" ]] && [[ -n "$(ls -A "$PANTRY_HOME/$pkg" 2>/dev/null)" ]]
}

download_package() {
  local pkg="$1"
  local version_constraint="$2"

  # Skip if installed
  if is_installed "$pkg"; then
    return 0
  fi

  log "${BLUE}📦${NC} Installing ${pkg}"

  # Get metadata
  local metadata_url="https://${PANTRY_BUCKET}.s3.${PANTRY_REGION}.amazonaws.com/binaries/${pkg}/metadata.json"
  local metadata
  metadata=$(curl -fsSL "$metadata_url" 2>/dev/null) || {
    log "   ${RED}✗${NC} Not found in registry"
    return 1
  }

  # Get latest version
  local version
  version=$(echo "$metadata" | grep -o '"latestVersion"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"\([^"]*\)"$/\1/')

  log "   Version: ${version}"

  # Build tarball URL
  local tarball_name="${pkg//./-}-${version}.tar.gz"
  local tarball_url="https://${PANTRY_BUCKET}.s3.${PANTRY_REGION}.amazonaws.com/binaries/${pkg}/${version}/${PLATFORM}/${tarball_name}"

  # Create install dir
  local install_dir="$PANTRY_HOME/$pkg/$version"
  mkdir -p "$install_dir"

  # Download
  log "   Downloading..."
  local tmp="$install_dir/package.tar.gz"
  if ! curl -fsSL -o "$tmp" "$tarball_url" 2>/dev/null; then
    log "   ${RED}✗${NC} Download failed"
    rm -rf "$install_dir"
    return 1
  fi

  # Extract
  log "   Extracting..."
  tar -xzf "$tmp" -C "$install_dir"
  rm "$tmp"

  # Make executable
  [[ -d "$install_dir/bin" ]] && chmod +x "$install_dir/bin"/* 2>/dev/null || true

  log "   ${GREEN}✓${NC} Installed"
  return 0
}

download_from_config() {
  local config="$1"
  [[ ! -f "$config" ]] && return 1

  local in_deps=false
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

    if [[ "$line" =~ ^dependencies: ]]; then
      in_deps=true
      continue
    fi

    if [[ "$in_deps" == true && ! "$line" =~ ^[[:space:]] ]]; then
      break
    fi

    if [[ "$in_deps" == true && "$line" =~ ^[[:space:]]+([^:]+): ]]; then
      local pkg="${BASH_REMATCH[1]}"
      pkg=$(echo "$pkg" | sed 's/^[[:space:]]*//')
      download_package "$pkg" ""
    fi
  done < "$config"
}

# Main
mkdir -p "$PANTRY_HOME"

if [[ -n "$CONFIG_FILE" ]]; then
  download_from_config "$CONFIG_FILE"
elif [[ -f "deps.yaml" ]]; then
  download_from_config "deps.yaml"
elif [[ -f "pantry.yaml" ]]; then
  download_from_config "pantry.yaml"
fi
DOWNLOAD_SCRIPT

chmod +x "$PANTRY_HOME/scripts/download.sh"

# ============================================
# Create shellenv.sh (shell integration)
# ============================================
echo -e "${BLUE}Installing shell integration...${NC}"

cat > "$PANTRY_HOME/scripts/shellenv.sh" << 'SHELLENV'
#!/bin/bash
# Pantry Shell Integration

PANTRY_HOME="${PANTRY_HOME:-$HOME/.pantry}"
PANTRY_BUCKET="${PANTRY_BUCKET:-pantry-registry}"
PANTRY_REGION="${PANTRY_REGION:-us-east-1}"

_pantry_last_dir=""

_pantry_check_installed() {
  local config_file="$1"
  while IFS=': ' read -r key value; do
    [[ -z "$key" || "$key" =~ ^# || "$key" == "dependencies" ]] && continue
    local pkg=$(echo "$key" | sed 's/^[[:space:]]*//')
    [[ -z "$pkg" || "$pkg" == "dependencies" ]] && continue
    local pkg_dir="$PANTRY_HOME/$pkg"
    if [[ ! -d "$pkg_dir" ]] || [[ -z "$(ls -A "$pkg_dir" 2>/dev/null)" ]]; then
      return 1
    fi
  done < "$config_file"
  return 0
}

_pantry_hook() {
  [[ "$PWD" == "$_pantry_last_dir" ]] && return
  _pantry_last_dir="$PWD"

  local config_file=""
  [[ -f "deps.yaml" ]] && config_file="deps.yaml"
  [[ -f "pantry.yaml" ]] && config_file="pantry.yaml"
  [[ -f ".pantry.yaml" ]] && config_file=".pantry.yaml"

  if [[ -z "$config_file" ]]; then
    [[ -n "$PANTRY_ACTIVE" ]] && _pantry_deactivate
    return
  fi

  # Check if all packages installed
  if _pantry_check_installed "$config_file"; then
    _pantry_update_path "$config_file"
    export PANTRY_ACTIVE="$PWD"
    export PANTRY_CONFIG="$config_file"
    return
  fi

  # Download missing packages
  echo -e "\033[0;34m📦 pantry\033[0m Syncing packages..."
  "$PANTRY_HOME/scripts/download.sh" -c "$config_file" -b "$PANTRY_BUCKET" -r "$PANTRY_REGION"

  _pantry_update_path "$config_file"
  export PANTRY_ACTIVE="$PWD"
  export PANTRY_CONFIG="$config_file"
}

_pantry_deactivate() {
  [[ -n "$PANTRY_OLD_PATH" ]] && export PATH="$PANTRY_OLD_PATH" && unset PANTRY_OLD_PATH
  unset PANTRY_ACTIVE PANTRY_CONFIG
}

_pantry_update_path() {
  local config_file="$1"
  local new_paths=""
  [[ -z "$PANTRY_OLD_PATH" ]] && export PANTRY_OLD_PATH="$PATH"

  while IFS=': ' read -r key value; do
    [[ -z "$key" || "$key" =~ ^# || "$key" == "dependencies" ]] && continue
    local pkg=$(echo "$key" | sed 's/^[[:space:]]*//')
    [[ -z "$pkg" || "$pkg" == "dependencies" ]] && continue

    local pkg_dir="$PANTRY_HOME/$pkg"
    if [[ -d "$pkg_dir" ]]; then
      local version_dir=$(ls -1 "$pkg_dir" 2>/dev/null | grep -v current | sort -V | tail -1)
      [[ -n "$version_dir" && -d "$pkg_dir/$version_dir/bin" ]] && new_paths="$pkg_dir/$version_dir/bin:$new_paths"
    fi
  done < "$config_file"

  [[ -n "$new_paths" ]] && export PATH="${new_paths}$PANTRY_OLD_PATH"
}

# Hook into shell
if [[ -n "$ZSH_VERSION" ]]; then
  autoload -Uz add-zsh-hook
  add-zsh-hook chpwd _pantry_hook
  _pantry_hook
elif [[ -n "$BASH_VERSION" ]]; then
  _pantry_old_prompt="$PROMPT_COMMAND"
  PROMPT_COMMAND="_pantry_hook; $_pantry_old_prompt"
  _pantry_hook
fi

# Commands
pantry() {
  case "$1" in
    install|sync)
      local cf="deps.yaml"
      [[ -f "pantry.yaml" ]] && cf="pantry.yaml"
      "$PANTRY_HOME/scripts/download.sh" -c "$cf" -b "$PANTRY_BUCKET" -r "$PANTRY_REGION"
      _pantry_update_path "$cf"
      ;;
    status)
      [[ -n "$PANTRY_ACTIVE" ]] && echo "Active: $PANTRY_ACTIVE" || echo "Not active"
      ;;
    list)
      echo "Packages:"
      ls -1 "$PANTRY_HOME" 2>/dev/null | grep -v scripts | while read p; do
        [[ -d "$PANTRY_HOME/$p" ]] && echo "  $p: $(ls "$PANTRY_HOME/$p" | tr '\n' ' ')"
      done
      ;;
    deactivate) _pantry_deactivate; echo "Deactivated" ;;
    *) echo "Usage: pantry {install|status|list|deactivate}" ;;
  esac
}
SHELLENV

chmod +x "$PANTRY_HOME/scripts/shellenv.sh"

# ============================================
# Configure shell
# ============================================
echo -e "${BLUE}Configuring $SHELL_RC...${NC}"

if ! grep -q "PANTRY_HOME" "$SHELL_RC" 2>/dev/null; then
  cat >> "$SHELL_RC" << EOF

# Pantry - zero-config package manager
export PANTRY_HOME="$PANTRY_HOME"
export PANTRY_BUCKET="$PANTRY_BUCKET"
export PANTRY_REGION="$PANTRY_REGION"
source "\$PANTRY_HOME/scripts/shellenv.sh"
EOF
  echo -e "${GREEN}✓${NC} Added to $SHELL_RC"
else
  echo -e "${YELLOW}Already configured${NC}"
fi

# Done
echo ""
echo -e "${GREEN}✅ Pantry installed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Restart terminal or run: source $SHELL_RC"
echo "  2. cd into a project with deps.yaml"
echo "  3. Packages auto-download and activate!"
echo ""
echo "Example deps.yaml:"
echo "  dependencies:"
echo "    bun.sh: ^1"
echo "    php.net: ^8.4"
echo ""
echo "Commands:"
echo "  pantry status   - Show active packages"
echo "  pantry list     - List installed packages"
echo "  pantry install  - Force sync packages"
echo ""
