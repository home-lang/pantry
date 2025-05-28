#!/bin/bash

# Launchpad wrapper script to handle missing dependencies
# This script provides fallback functionality when bun is not available

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Resolve the actual script location if it's a symlink
if [ -L "${BASH_SOURCE[0]}" ]; then
    REAL_SCRIPT="$(readlink "${BASH_SOURCE[0]}")"
    SCRIPT_DIR="$(cd "$(dirname "$REAL_SCRIPT")" && pwd)"
fi
CLI_PATH="$SCRIPT_DIR/packages/launchpad/bin/cli.ts"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to handle dev:dump command when bun is missing
fallback_dev_dump() {
    local target_dir="${1:-$PWD}"

    # Look for dependency files
    local dep_file=""
    for file in dependencies.yaml dependencies.yml pkgx.yaml pkgx.yml .pkgx.yaml .pkgx.yml; do
        if [ -f "$target_dir/$file" ]; then
            dep_file="$target_dir/$file"
            break
        fi
    done

    if [ -z "$dep_file" ]; then
        echo "no devenv detected" >&2
        return 1
    fi

    if ! command_exists pkgx; then
        echo "pkgx not available for fallback" >&2
        return 1
    fi

    # Change to target directory
    cd "$target_dir" || return 1

    # Read packages from dependencies file and build pkgx command
    local packages=""
    if [ -f "dependencies.yaml" ]; then
        # Extract packages from YAML - get lines under dependencies: that have package names
        packages=$(awk '/^dependencies:/{flag=1; next} flag && /^[[:space:]]+[^[:space:]]/{gsub(/^[[:space:]]+/, ""); gsub(/:.*$/, ""); print}' dependencies.yaml)
    fi

    # Use pkgx to get environment with all packages
    local env_output
    if [ -n "$packages" ]; then
        # Build pkgx command with all packages
        local pkgx_cmd="pkgx"
        for pkg in $packages; do
            # Get version from dependencies.yaml
            local version=$(grep "^\s\s$pkg:" dependencies.yaml | sed 's/.*:\s*//' | sed 's/\^//' | sed 's/~//')
            if [ -n "$version" ]; then
                pkgx_cmd="$pkgx_cmd +$pkg@$version"
            else
                pkgx_cmd="$pkgx_cmd +$pkg"
            fi
        done
        pkgx_cmd="$pkgx_cmd env"

        if env_output=$($pkgx_cmd 2>/dev/null); then
            # Parse and output the environment setup with filtering
            echo "# Fallback environment setup"
            echo "eval \"_pkgx_dev_try_bye() {"
            echo "  echo 'dev environment deactivated' >&2"
            echo "  unset -f _pkgx_dev_try_bye"
            echo "}\""
            echo ""
            echo "set -a"

            # Filter out problematic environment variables
            echo "$env_output" | grep -v '^#' | grep -v '^$' | \
                grep -v 'LS_COLORS=' | grep -v 'VSCODE' | grep -v 'CURSOR' | \
                grep -v 'JetBrains' | grep -v '(Plugin)' | \
                sed 's/"/\\"/g'

            echo "set +a"

            # Show activation message
            echo "echo 'dev environment activated (fallback)' >&2" >&2
        else
            echo "Failed to activate environment" >&2
            return 1
        fi
    else
        echo "No packages found in dependencies file" >&2
        return 1
    fi
}

# Function to activate environment using pkgx directly
_pkgx_activate_with_pkgx() {
  local dir="$1"

  if [ ! -f "$dir/dependencies.yaml" ] || ! command -v pkgx >/dev/null 2>&1; then
    echo "⚠️  No dependencies.yaml or pkgx not available" >&2
    return 1
  fi

  echo "🔄 Activating environment with pkgx (fallback mode)..." >&2

  # Call pkgx env to get environment variables for the packages
  # Use a subshell to avoid changing current directory permanently
  local env_output
  env_output=$(cd "$dir" && pkgx env 2>/dev/null)

  if [ $? -eq 0 ]; then
    # Setup output for eval
    cat << 'FALLBACK_EOF'
eval "_pkgx_dev_try_bye() {
  echo 'dev environment deactivated' >&2
  unset -f _pkgx_dev_try_bye
}"

# Ensure PATH contains ~/.local/bin
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
  export PATH="$HOME/.local/bin:$PATH"
fi

set -a
FALLBACK_EOF

    # Filter and output environment variables
    echo "$env_output" | grep -v '^#' | grep -v '^$' | \
      grep -v 'LS_COLORS=' | grep -v 'VSCODE' | grep -v 'CURSOR' | \
      grep -v 'JetBrains' | grep -v '(Plugin)' | \
      sed 's/"/\\"/g'

    cat << 'FALLBACK_EOF'
set +a
echo "✅ Dev environment activated via pkgx (fallback)" >&2
FALLBACK_EOF

    return 0
  else
    echo "⚠️  Failed to activate environment with pkgx" >&2
    return 1
  fi
}

_pkgx_chpwd_hook() {
  # Prevent infinite loops during activation
  if [ -n "$_PKGX_ACTIVATING" ]; then
    return 0
  fi

  # Check if we're currently in an active dev environment
  local was_active=false
  if type _pkgx_dev_try_bye >/dev/null 2>&1; then
    was_active=true
  fi

  # Look for activation file in current directory or parent directories
  local found_activation=false
  local activation_dir=""
  dir="$PWD"
  while [ "$dir" != / -a "$dir" != . ]; do
    if [ -f "$HOME/Library/Application Support/pkgx/dev/$dir/dev.pkgx.activated" ]; then
      found_activation=true
      activation_dir="$dir"
      break
    fi
    dir="$(dirname "$dir")"
  done

  # If we were active but no longer in an activation directory, deactivate
  if [ "$was_active" = true ] && [ "$found_activation" = false ]; then
    _pkgx_dev_try_bye
  fi

  # Find dependency files in current directory
  local deps_file=""
  for file in dependencies.yaml dependencies.yml pkgx.yaml pkgx.yml .pkgx.yaml .pkgx.yml; do
    if [ -f "$PWD/$file" ]; then
      deps_file="$PWD/$file"
      break
    fi
  done

  # If we found a dependency file, always create activation and activate
  if [ -n "$deps_file" ]; then
    # Only create activation if not already found
    if [ "$found_activation" = false ]; then
      mkdir -p "$HOME/Library/Application Support/pkgx/dev$PWD"
      touch "$HOME/Library/Application Support/pkgx/dev$PWD/dev.pkgx.activated"
      found_activation=true
      activation_dir="$PWD"
      echo "🔄 Auto-activating environment for $(basename "$PWD")" >&2
    fi

    # Force activation if we weren't active before
    if [ "$was_active" = false ]; then
      # Set flag to prevent recursive calls
      export _PKGX_ACTIVATING="$PWD"

      # Try launchpad dev:dump first, fallback to pkgx if it fails
      local launchpad_output=""
      if launchpad_output=$(launchpad dev:dump "$activation_dir" 2>/dev/null) && [ -n "$launchpad_output" ]; then
        # If launchpad succeeds and produces output, use it
        eval "$launchpad_output"
      else
        # If launchpad fails or produces no output, use pkgx fallback
        echo "⚠️  Launchpad unavailable, using pkgx fallback..." >&2
        eval "$(_pkgx_activate_with_pkgx "$activation_dir")"
      fi

      # Clear the flag after activation
      unset _PKGX_ACTIVATING
    fi
  fi
}

# Simple function to run a command with dependencies from dependencies.yaml
run_with_deps() {
    local cmd="$1"
    shift

    # Check for pkgx
    if ! command_exists pkgx; then
        echo "Error: pkgx is not available, please install it first" >&2
        return 1
    fi

    # Check for dependencies.yaml
    if [ ! -f "dependencies.yaml" ]; then
        echo "Error: dependencies.yaml not found" >&2
        return 1
    fi

    # Build pkgx command string with all packages from dependencies.yaml
    local pkgx_cmd="pkgx"
    while IFS=': ' read -r pkg version; do
        # Skip empty lines and comments
        if [ -z "$pkg" ] || [[ "$pkg" == \#* ]]; then
            continue
        fi
        # Skip the "dependencies:" line
        if [ "$pkg" = "dependencies" ]; then
            continue
        fi
        # Remove leading spaces
        pkg=$(echo "$pkg" | sed 's/^[[:space:]]*//')
        # Skip empty package names
        if [ -z "$pkg" ]; then
            continue
        fi

        # Add the package to pkgx command
        pkgx_cmd="$pkgx_cmd +$pkg"
    done < "dependencies.yaml"

    # Run command with dependencies
    if [ "$pkgx_cmd" != "pkgx" ]; then
        echo "Running '$cmd $@' with dependencies..." >&2
        $pkgx_cmd -- "$cmd" "$@"
    else
        echo "Error: No packages found in dependencies.yaml" >&2
        return 1
    fi
}

# Main logic
if [ "$1" = "dev:dump" ]; then
    # Handle dev:dump command specifically
    fallback_dev_dump "$2"
elif [ "$1" = "dev:shellcode" ]; then
    # For shellcode, check if bun is available first
    if command_exists bun; then
        # Use the full CLI for shellcode generation
        exec bun "$CLI_PATH" "$@"
    else
        # Provide fallback shell integration when bun is not available
        cat << 'EOF'
# Function to activate environment using pkgx directly
_pkgx_activate_with_pkgx() {
  local dir="$1"

  if [ ! -f "$dir/dependencies.yaml" ] || ! command -v pkgx >/dev/null 2>&1; then
    echo "⚠️  No dependencies.yaml or pkgx not available" >&2
    return 1
  fi

  echo "🔄 Activating environment with pkgx (fallback mode)..." >&2

  # Call pkgx env to get environment variables for the packages
  # Use a subshell to avoid changing current directory permanently
  local env_output
  env_output=$(cd "$dir" && pkgx env 2>/dev/null)

  if [ $? -eq 0 ]; then
    # Setup output for eval
    cat << 'FALLBACK_EOF'
eval "_pkgx_dev_try_bye() {
  echo 'dev environment deactivated' >&2
  unset -f _pkgx_dev_try_bye
}"

# Ensure PATH contains ~/.local/bin
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
  export PATH="$HOME/.local/bin:$PATH"
fi

set -a
FALLBACK_EOF

    # Filter and output environment variables
    echo "$env_output" | grep -v '^#' | grep -v '^$' | \
      grep -v 'LS_COLORS=' | grep -v 'VSCODE' | grep -v 'CURSOR' | \
      grep -v 'JetBrains' | grep -v '(Plugin)' | \
      sed 's/"/\\"/g'

    cat << 'FALLBACK_EOF'
set +a
echo "✅ Dev environment activated via pkgx (fallback)" >&2
FALLBACK_EOF

    return 0
  else
    echo "⚠️  Failed to activate environment with pkgx" >&2
    return 1
  fi
}

_pkgx_chpwd_hook() {
  # Prevent infinite loops during activation
  if [ -n "$_PKGX_ACTIVATING" ]; then
    return 0
  fi

  # Check if we're currently in an active dev environment
  local was_active=false
  if type _pkgx_dev_try_bye >/dev/null 2>&1; then
    was_active=true
  fi

  # Look for activation file in current directory or parent directories
  local found_activation=false
  local activation_dir=""
  dir="$PWD"
  while [ "$dir" != / -a "$dir" != . ]; do
    if [ -f "$HOME/Library/Application Support/pkgx/dev/$dir/dev.pkgx.activated" ]; then
      found_activation=true
      activation_dir="$dir"
      break
    fi
    dir="$(dirname "$dir")"
  done

  # If we were active but no longer in an activation directory, deactivate
  if [ "$was_active" = true ] && [ "$found_activation" = false ]; then
    _pkgx_dev_try_bye
  fi

  # Find dependency files in current directory
  local deps_file=""
  for file in dependencies.yaml dependencies.yml pkgx.yaml pkgx.yml .pkgx.yaml .pkgx.yml; do
    if [ -f "$PWD/$file" ]; then
      deps_file="$PWD/$file"
      break
    fi
  done

  # If we found a dependency file, always create activation and activate
  if [ -n "$deps_file" ]; then
    # Only create activation if not already found
    if [ "$found_activation" = false ]; then
      mkdir -p "$HOME/Library/Application Support/pkgx/dev$PWD"
      touch "$HOME/Library/Application Support/pkgx/dev$PWD/dev.pkgx.activated"
      found_activation=true
      activation_dir="$PWD"
      echo "🔄 Auto-activating environment for $(basename "$PWD")" >&2
    fi

    # Force activation if we weren't active before
    if [ "$was_active" = false ]; then
      # Set flag to prevent recursive calls
      export _PKGX_ACTIVATING="$PWD"

      # Try launchpad dev:dump first, fallback to pkgx if it fails
      local launchpad_output=""
      if launchpad_output=$(launchpad dev:dump "$activation_dir" 2>/dev/null) && [ -n "$launchpad_output" ]; then
        # If launchpad succeeds and produces output, use it
        eval "$launchpad_output"
      else
        # If launchpad fails or produces no output, use pkgx fallback
        echo "⚠️  Launchpad unavailable, using pkgx fallback..." >&2
        eval "$(_pkgx_activate_with_pkgx "$activation_dir")"
      fi

      # Clear the flag after activation
      unset _PKGX_ACTIVATING
    fi
  fi
}
EOF
    fi
elif [ "$1" = "with" ]; then
    # Run a command with dependencies
    shift
    run_with_deps "$@"
elif command_exists bun; then
    # If bun is available, use the normal CLI for all other commands
    echo "Debug: Using bun to run command: $@" >&2
    exec bun "$CLI_PATH" "$@"
else
    # Bun is not available, provide limited functionality
    case "$1" in
        "dev:dump"|"dev:shellcode"|"with")
            # These are handled above
            ;;
        "bun")
            echo "Debug: Installing bun without bun available" >&2
            # Try to use pkgx directly for bun installation
            if command_exists pkgx; then
                echo "Debug: Using pkgx to install bun" >&2
                # Get bun path from pkgx
                BUN_PATH=$(pkgx +bun.sh -- which bun 2>/dev/null)
                if [ -n "$BUN_PATH" ]; then
                    echo "Debug: Found bun at $BUN_PATH" >&2
                    # Create link in ~/.local/bin
                    mkdir -p "$HOME/.local/bin"
                    ln -sf "$BUN_PATH" "$HOME/.local/bin/bun"
                    echo "✅ Installed bun to $HOME/.local/bin/bun" >&2
                    # Use pkgx to run the command
                    pkgx +bun.sh -- bun "$CLI_PATH" "$@"
                else
                    echo "Error: Failed to find bun path" >&2
                    exit 1
                fi
            else
                echo "Error: pkgx is not available to install bun" >&2
                exit 1
            fi
            ;;
        *)
            echo "Error: bun is not available and command '$1' requires full CLI functionality" >&2
            echo "Please install missing packages or use 'pkgx' directly" >&2
            exit 1
            ;;
    esac
fi

dev() {
  case "$1" in
  off)
    if type -f _pkgx_dev_try_bye >/dev/null 2>&1; then
      dir="$PWD"
      while [ "$dir" != / -a "$dir" != . ]; do
        if [ -f "$HOME/Library/Application Support/pkgx/dev/$dir/dev.pkgx.activated" ]; then
          rm "$HOME/Library/Application Support/pkgx/dev/$dir/dev.pkgx.activated"
          break
        fi
        dir="$(dirname "$dir")"
      done
      PWD=/ _pkgx_dev_try_bye
    else
      echo "no devenv" >&2
    fi;;
  ''|on)
    if [ "$2" ]; then
      launchpad "$@"
    elif ! type -f _pkgx_dev_try_bye >/dev/null 2>&1; then
      mkdir -p "$HOME/Library/Application Support/pkgx/dev$PWD"
      touch "$HOME/Library/Application Support/pkgx/dev$PWD/dev.pkgx.activated"
      # Set flag to prevent recursive calls
      export _PKGX_ACTIVATING="$PWD"

      # Try launchpad dev:dump first, fallback to pkgx if it fails
      local launchpad_output=""
      if launchpad_output=$(launchpad dev:dump "$PWD" 2>/dev/null) && [ -n "$launchpad_output" ]; then
        # If launchpad succeeds and produces output, use it
        eval "$launchpad_output"
      else
        # If launchpad fails or produces no output, use pkgx fallback
        echo "⚠️  Launchpad unavailable, using pkgx fallback..." >&2
        eval "$(_pkgx_activate_with_pkgx "$PWD")"
      fi

      # Clear the flag after activation
      unset _PKGX_ACTIVATING
    else
      echo "devenv already active" >&2
    fi;;
  with)
    shift
    # Run a command with all dependencies from dependencies.yaml
    if [ -f "$PWD/dependencies.yaml" ]; then
      if command_exists pkgx; then
        # Build pkgx command string with all packages from dependencies.yaml
        local pkgx_cmd="pkgx"
        while IFS=': ' read -r pkg version; do
          # Skip empty lines and comments
          if [ -z "$pkg" ] || [[ "$pkg" == \#* ]]; then
              continue
          fi
          # Skip the "dependencies:" line
          if [ "$pkg" = "dependencies" ]; then
              continue
          fi
          # Remove leading spaces
          pkg=$(echo "$pkg" | sed 's/^[[:space:]]*//')
          # Skip empty package names
          if [ -z "$pkg" ]; then
              continue
          fi

          # Add the package to pkgx command
          pkgx_cmd="$pkgx_cmd +$pkg"
        done < "$PWD/dependencies.yaml"

        # Run command with dependencies
        if [ "$pkgx_cmd" != "pkgx" ]; then
          echo "Running '$@' with dependencies..." >&2
          exec $pkgx_cmd -- "$@"
        else
          echo "⚠️ No packages found in dependencies.yaml" >&2
          exit 1
        fi
      else
        echo "⚠️ pkgx not available" >&2
        exit 1
      fi
    else
      echo "⚠️ No dependencies.yaml found" >&2
      exit 1
    fi;;
  *)
    launchpad "$@";;
  esac
}

if [ -n "$ZSH_VERSION" ] && [ $(emulate) = zsh ]; then
  eval 'typeset -ag chpwd_functions

        if [[ -z "${chpwd_functions[(r)_pkgx_chpwd_hook]+1}" ]]; then
          chpwd_functions=( _pkgx_chpwd_hook ${chpwd_functions[@]} )
        fi

        _pkgx_chpwd_hook'
elif [ -n "$BASH_VERSION" ] && [ "$POSIXLY_CORRECT" != y ] ; then
  eval 'cd() {
          builtin cd "$@" || return
          _pkgx_chpwd_hook
        }
        _pkgx_chpwd_hook'
else
  POSIXLY_CORRECT=y
  echo "pkgx: dev: warning: unsupported shell" >&2
fi