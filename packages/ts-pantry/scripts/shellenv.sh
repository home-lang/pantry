#!/bin/bash
# Pantry Shell Integration
# Add to your ~/.zshrc or ~/.bashrc:
#   source /path/to/ts-pantry/scripts/shellenv.sh
#
# Or for a global install:
#   eval "$(pantry shellenv)"

PANTRY_HOME="${PANTRY_HOME:-$HOME/.pantry}"
PANTRY_SCRIPT_DIR="${PANTRY_SCRIPT_DIR:-$(dirname "${BASH_SOURCE[0]:-$0}")}"
PANTRY_BUCKET="${PANTRY_BUCKET:-pantry-registry}"
PANTRY_REGION="${PANTRY_REGION:-us-east-1}"

# Track the last directory we processed to avoid re-running
_pantry_last_dir=""

# Colors
_pantry_green='\033[0;32m'
_pantry_yellow='\033[0;33m'
_pantry_blue='\033[0;34m'
_pantry_reset='\033[0m'

_pantry_hook() {
  local config_file=""

  # Don't re-run if we're in the same directory
  if [[ "$PWD" == "$_pantry_last_dir" ]]; then
    return
  fi
  _pantry_last_dir="$PWD"

  # Check for config files
  if [[ -f "pantry.yaml" ]]; then
    config_file="pantry.yaml"
  elif [[ -f "deps.yaml" ]]; then
    config_file="deps.yaml"
  elif [[ -f ".pantry.yaml" ]]; then
    config_file=".pantry.yaml"
  fi

  # No config file, deactivate if needed
  if [[ -z "$config_file" ]]; then
    if [[ -n "$PANTRY_ACTIVE" ]]; then
      _pantry_deactivate
    fi
    return
  fi

  # Config file found - activate
  _pantry_activate "$config_file"
}

_pantry_check_installed() {
  local config_file="$1"
  local missing=0

  while IFS=': ' read -r key value; do
    [[ -z "$key" || "$key" =~ ^# || "$key" == "dependencies" ]] && continue
    local pkg=$(echo "$key" | sed 's/^[[:space:]]*//')
    [[ -z "$pkg" || "$pkg" == "dependencies" ]] && continue

    local pkg_dir="$PANTRY_HOME/$pkg"
    if [[ ! -d "$pkg_dir" ]] || [[ -z "$(ls -A "$pkg_dir" 2>/dev/null)" ]]; then
      missing=1
      break
    fi
  done < "$config_file"

  return $missing
}

_pantry_activate() {
  local config_file="$1"

  # Check if all packages are already installed locally
  if _pantry_check_installed "$config_file"; then
    # All packages exist - just update PATH silently
    _pantry_update_path "$config_file"
    export PANTRY_ACTIVE="$PWD"
    export PANTRY_CONFIG="$config_file"
    return
  fi

  # Some packages missing - download them
  echo -e "${_pantry_blue}📦 pantry${_pantry_reset} Syncing packages from ${config_file}..."

  # Use bash download script (no dependencies required)
  "$PANTRY_SCRIPT_DIR/download.sh" \
    -c "$config_file" \
    -b "$PANTRY_BUCKET" \
    -r "$PANTRY_REGION"

  # Build PATH from installed packages
  _pantry_update_path "$config_file"

  export PANTRY_ACTIVE="$PWD"
  export PANTRY_CONFIG="$config_file"
}

_pantry_deactivate() {
  # Remove pantry paths from PATH
  if [[ -n "$PANTRY_OLD_PATH" ]]; then
    export PATH="$PANTRY_OLD_PATH"
    unset PANTRY_OLD_PATH
  fi

  unset PANTRY_ACTIVE
  unset PANTRY_CONFIG
}

_pantry_update_path() {
  local config_file="$1"
  local new_paths=""

  # Save original PATH if not already saved
  if [[ -z "$PANTRY_OLD_PATH" ]]; then
    export PANTRY_OLD_PATH="$PATH"
  fi

  # Parse dependencies from config file and add to PATH
  while IFS=': ' read -r key value; do
    # Skip empty lines, comments, and non-dependency lines
    [[ -z "$key" || "$key" =~ ^# || "$key" == "dependencies" ]] && continue

    # Clean up the package name (remove leading spaces)
    local pkg=$(echo "$key" | sed 's/^[[:space:]]*//')
    [[ -z "$pkg" || "$pkg" == "dependencies" ]] && continue

    # Find the installed version
    local pkg_dir="$PANTRY_HOME/$pkg"
    if [[ -d "$pkg_dir" ]]; then
      # Get the latest/current version
      local version_dir=$(ls -1 "$pkg_dir" | grep -v current | sort -V | tail -1)
      if [[ -n "$version_dir" ]]; then
        local bin_dir="$pkg_dir/$version_dir/bin"
        local sbin_dir="$pkg_dir/$version_dir/sbin"

        if [[ -d "$bin_dir" ]]; then
          new_paths="$bin_dir:$new_paths"
        fi
        if [[ -d "$sbin_dir" ]]; then
          new_paths="$sbin_dir:$new_paths"
        fi
      fi
    fi
  done < "$config_file"

  # Update PATH (silently)
  if [[ -n "$new_paths" ]]; then
    export PATH="${new_paths}$PANTRY_OLD_PATH"
  fi
}

# Install the hook based on shell type
if [[ -n "$ZSH_VERSION" ]]; then
  # Zsh: use chpwd hook
  autoload -Uz add-zsh-hook
  add-zsh-hook chpwd _pantry_hook

  # Run on initial load too
  _pantry_hook

elif [[ -n "$BASH_VERSION" ]]; then
  # Bash: use PROMPT_COMMAND
  _pantry_prompt_command() {
    _pantry_hook
    # Preserve any existing PROMPT_COMMAND
    if [[ -n "$_pantry_old_prompt_command" ]]; then
      eval "$_pantry_old_prompt_command"
    fi
  }

  _pantry_old_prompt_command="$PROMPT_COMMAND"
  PROMPT_COMMAND="_pantry_prompt_command"

  # Run on initial load too
  _pantry_hook
fi

# Manual commands
pantry() {
  case "$1" in
    install|sync)
      if [[ -f "pantry.yaml" || -f "deps.yaml" || -f ".pantry.yaml" ]]; then
        local config_file="pantry.yaml"
        [[ -f "deps.yaml" ]] && config_file="deps.yaml"
        [[ -f ".pantry.yaml" ]] && config_file=".pantry.yaml"

        "$PANTRY_SCRIPT_DIR/download.sh" \
          -c "$config_file" \
          -b "$PANTRY_BUCKET" \
          -r "$PANTRY_REGION"

        _pantry_update_path "$config_file"
      else
        echo "No pantry.yaml or deps.yaml found in current directory"
        return 1
      fi
      ;;

    deactivate)
      _pantry_deactivate
      echo "Pantry deactivated"
      ;;

    status)
      if [[ -n "$PANTRY_ACTIVE" ]]; then
        echo "Pantry active in: $PANTRY_ACTIVE"
        echo "Config: $PANTRY_CONFIG"
        echo "Packages in PATH:"
        echo "$PATH" | tr ':' '\n' | grep "$PANTRY_HOME" | while read p; do
          echo "  - $p"
        done
      else
        echo "Pantry not active"
      fi
      ;;

    list)
      echo "Installed packages:"
      ls -1 "$PANTRY_HOME" 2>/dev/null | while read pkg; do
        [[ "$pkg" == "env.sh" ]] && continue
        local versions=$(ls -1 "$PANTRY_HOME/$pkg" 2>/dev/null | grep -v current | tr '\n' ', ' | sed 's/,$//')
        echo "  - $pkg: $versions"
      done
      ;;

    env)
      # Download missing packages to ~/.pantry and add to PATH
      local config_file=""
      if [[ -f "pantry.yaml" ]]; then
        config_file="pantry.yaml"
      elif [[ -f "deps.yaml" ]]; then
        config_file="deps.yaml"
      elif [[ -f ".pantry.yaml" ]]; then
        config_file=".pantry.yaml"
      fi

      if [[ -z "$config_file" ]]; then
        echo "No pantry.yaml or deps.yaml found in current directory"
        return 1
      fi

      echo -e "${_pantry_blue}pantry env${_pantry_reset} Setting up environment from ${config_file}..."
      echo ""

      local _pe_base_url="https://${PANTRY_BUCKET}.s3.${PANTRY_REGION}.amazonaws.com"
      local _pe_os=$(uname -s | tr '[:upper:]' '[:lower:]')
      local _pe_arch=$(uname -m)
      [[ "$_pe_arch" == "arm64" || "$_pe_arch" == "aarch64" ]] && _pe_arch="arm64"
      [[ "$_pe_arch" == "x86_64" ]] && _pe_arch="x86-64"
      local _pe_platform="${_pe_os}-${_pe_arch}"

      local _pe_ok=0
      local _pe_fail=0
      local _pe_packages=()

      # Parse dependencies
      while IFS= read -r line || [[ -n "$line" ]]; do
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        [[ "$line" =~ ^dependencies: ]] && continue
        [[ "$line" =~ ^services: ]] && break
        [[ ! "$line" =~ ^[[:space:]] ]] && continue
        local pkg=$(echo "$line" | sed 's/^[[:space:]]*//' | cut -d: -f1)
        [[ -z "$pkg" ]] && continue
        _pe_packages+=("$pkg")
      done < "$config_file"

      for pkg in "${_pe_packages[@]}"; do
        local pkg_dir="$PANTRY_HOME/$pkg"
        local ver=""

        # Check if already cached
        if [[ -d "$pkg_dir" ]] && [[ -n "$(ls -A "$pkg_dir" 2>/dev/null)" ]]; then
          ver=$(ls -1 "$pkg_dir" 2>/dev/null | grep -v current | grep -v '.tmp' | sort -V | tail -1)
        fi

        # Download if not cached
        if [[ -z "$ver" ]]; then
          echo -e "  ${_pantry_blue}downloading${_pantry_reset} ${pkg}..."

          local metadata
          metadata=$(curl -fsSL "${_pe_base_url}/binaries/${pkg}/metadata.json" 2>/dev/null)
          if [[ -z "$metadata" ]]; then
            echo -e "  ${_pantry_yellow}not found${_pantry_reset}  ${pkg}"
            _pe_fail=$((_pe_fail + 1))
            continue
          fi

          local version
          version=$(echo "$metadata" | grep -o '"latestVersion"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"\([^"]*\)"$/\1/')
          if [[ -z "$version" ]]; then
            echo -e "  ${_pantry_yellow}no version${_pantry_reset} ${pkg}"
            _pe_fail=$((_pe_fail + 1))
            continue
          fi

          local install_dir="$PANTRY_HOME/$pkg/$version"
          mkdir -p "$install_dir"

          local tmp="$install_dir/package.tar.gz"
          local dl_ok=false
          local tarball_name="${pkg//\//-}-${version}.tar.gz"
          local tarball_name_alt="${pkg//./-}-${version}.tar.gz"

          curl -fsSL -o "$tmp" "${_pe_base_url}/binaries/${pkg}/${version}/${_pe_platform}/${tarball_name}" 2>/dev/null && dl_ok=true
          [[ "$dl_ok" != true ]] && curl -fsSL -o "$tmp" "${_pe_base_url}/binaries/${pkg}/${version}/${_pe_platform}/${tarball_name_alt}" 2>/dev/null && dl_ok=true

          if [[ "$dl_ok" != true ]]; then
            echo -e "  ${_pantry_yellow}failed${_pantry_reset}     ${pkg} (download error)"
            rm -rf "$install_dir"
            _pe_fail=$((_pe_fail + 1))
            continue
          fi

          # Validate not an XML error
          local fsize=$(wc -c < "$tmp" | tr -d ' ')
          if [[ "$fsize" -lt 1000 ]]; then
            if grep -q 'xml\|Error\|NoSuchKey' "$tmp" 2>/dev/null; then
              echo -e "  ${_pantry_yellow}failed${_pantry_reset}     ${pkg} (bad archive)"
              rm -rf "$install_dir"
              _pe_fail=$((_pe_fail + 1))
              continue
            fi
          fi

          tar -xzf "$tmp" -C "$install_dir" 2>/dev/null
          rm -f "$tmp"
          [[ -d "$install_dir/bin" ]] && chmod +x "$install_dir/bin"/* 2>/dev/null
          [[ -d "$install_dir/sbin" ]] && chmod +x "$install_dir/sbin"/* 2>/dev/null

          ver="$version"
          echo -e "  ${_pantry_green}installed${_pantry_reset}  ${pkg}@${version}"
        else
          echo -e "  ${_pantry_green}cached${_pantry_reset}     ${pkg}@${ver}"
        fi
        _pe_ok=$((_pe_ok + 1))
      done

      # Update PATH to point to ~/.pantry package bins
      _pantry_update_path "$config_file"
      export PANTRY_ACTIVE="$PWD"
      export PANTRY_CONFIG="$config_file"

      echo ""
      echo -e "${_pantry_green}${_pe_ok} packages activated${_pantry_reset}"
      [[ $_pe_fail -gt 0 ]] && echo -e "${_pantry_yellow}${_pe_fail} packages failed${_pantry_reset}"

      # Show what's in PATH
      echo ""
      echo "PATH updated with:"
      echo "$PATH" | tr ':' '\n' | grep "$PANTRY_HOME" | while read p; do
        echo "  $p"
      done
      ;;

    *)
      echo "Usage: pantry <command>"
      echo ""
      echo "Commands:"
      echo "  env        Download packages and activate in PATH"
      echo "  install    Download packages from deps.yaml"
      echo "  sync       Same as install"
      echo "  deactivate Remove pantry packages from PATH"
      echo "  status     Show current pantry status"
      echo "  list       List installed packages"
      ;;
  esac
}

# Silently loaded - use 'pantry status' to check
