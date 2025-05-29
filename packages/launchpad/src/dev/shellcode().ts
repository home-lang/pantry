import { existsSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

export default function shellcode(): string {
  // find self
  const pathDirs = process.env.PATH?.split(':') || []
  let dev_cmd = pathDirs
    .map(dir => join(dir, 'launchpad'))
    .find(cmd => existsSync(cmd)) || pathDirs
    .map(dir => join(dir, 'dev'))
    .find(cmd => existsSync(cmd))

  // If no global installation found, try to find the local script
  if (!dev_cmd) {
    // Check if we're in the launchpad project directory
    const currentDir = process.cwd()
    const localLaunchpad = join(currentDir, 'launchpad')
    const parentLaunchpad = join(currentDir, '..', 'launchpad')

    if (existsSync(localLaunchpad)) {
      dev_cmd = localLaunchpad
    }
    else if (existsSync(parentLaunchpad)) {
      dev_cmd = parentLaunchpad
    }
    else {
      throw new Error('couldn\'t find `dev` or `launchpad` - please install launchpad globally or run from the project directory')
    }
  }

  // Convert relative paths to absolute paths so they work from any directory
  if (dev_cmd && (dev_cmd.startsWith('./') || dev_cmd === 'launchpad')) {
    const currentDir = process.cwd()
    if (dev_cmd === 'launchpad') {
      // This means it was found in PATH via current directory
      dev_cmd = join(currentDir, 'launchpad')
    }
    else {
      // Convert relative path to absolute
      dev_cmd = join(currentDir, dev_cmd.replace('./', ''))
    }
  }

  const dataDirPath = datadir()

  return `
# Global variable to prevent infinite loops
_PKGX_ACTIVATING=""

_pkgx_chpwd_hook() {
  # Prevent infinite loops during activation
  if [ -n "$_PKGX_ACTIVATING" ]; then
    return 0
  fi

  # Skip heavy operations during initial shell startup
  if [ -n "$_LAUNCHPAD_STARTUP_SKIP" ]; then
    unset _LAUNCHPAD_STARTUP_SKIP
    return 0
  fi

  # Check if we're currently in an active dev environment
  local was_active=false
  local current_env_dir=""
  if type _pkgx_dev_try_bye >/dev/null 2>&1; then
    was_active=true
    # Extract the current environment directory from the function
    current_env_dir=$(declare -f _pkgx_dev_try_bye | grep -o 'PWD#"[^"]*"' | head -1 | cut -d'"' -f2)
  fi

  # Look for activation file in current directory or parent directories
  local found_activation=false
  local activation_dir=""
  dir="$PWD"
  while [ "$dir" != / -a "$dir" != . ]; do
    if [ -f "${dataDirPath}/$dir/dev.pkgx.activated" ]; then
      found_activation=true
      activation_dir="$dir"
      break
    fi
    dir="$(dirname "$dir")"
  done

  # Find dependency files in current directory
  local deps_file=""
  for file in dependencies.yaml dependencies.yml pkgx.yaml pkgx.yml .pkgx.yaml .pkgx.yml .launchpad.yaml launchpad.yaml .launchpad.yml launchpad.yml deps.yml deps.yaml .deps.yml .deps.yaml; do
    if [ -f "$PWD/$file" ]; then
      deps_file="$PWD/$file"
      break
    fi
  done

  # If we were active but moved to a different directory with different dependencies, deactivate first
  if [ "$was_active" = true ] && [ -n "$current_env_dir" ] && [ "$current_env_dir" != "$PWD" ]; then
    _pkgx_dev_try_bye
    was_active=false
  fi

  # If we were active but no longer in an activation directory, deactivate
  if [ "$was_active" = true ] && [ "$found_activation" = false ]; then
    _pkgx_dev_try_bye
    was_active=false
  fi

  # Ensure ~/.local/bin exists and is in PATH
  mkdir -p "$HOME/.local/bin"
  if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    export PATH="$HOME/.local/bin:$PATH"
  fi

  # If we found a dependency file, check if activation is needed
  if [ -n "$deps_file" ]; then
    # Only create activation if not already found
    if [ "$found_activation" = false ]; then
      mkdir -p "${dataDirPath}$PWD"
      touch "${dataDirPath}$PWD/dev.pkgx.activated"
      found_activation=true
      activation_dir="$PWD"
    fi

    # Check if environment is already properly activated for this directory
    if [ "$was_active" = true ] && [ "$current_env_dir" = "$PWD" ]; then
      # Already active for the correct directory, nothing to do
      return 0
    fi

    # Force activation if we weren't active before or if we switched directories
    if [ "$was_active" = false ]; then
      # Check if packages are already installed (cache check)
      # Use a simple hash based on the directory path
      local project_hash=""
      if command -v openssl >/dev/null 2>&1; then
        project_hash=$(echo -n "$PWD" | openssl base64 2>/dev/null | tr -d '\\n' | tr '/+=' '___')
      elif command -v base64 >/dev/null 2>&1; then
        project_hash=$(echo -n "$PWD" | base64 2>/dev/null | tr -d '\\n' | tr '/+=' '___')
      fi

      local env_cache_dir=""
      if [ -n "$project_hash" ]; then
        env_cache_dir="$HOME/.local/share/launchpad/envs/$project_hash"
      fi

      # If packages are already installed, do fast activation
      if [ -n "$env_cache_dir" ] && [ -d "$env_cache_dir/bin" -o -d "$env_cache_dir/sbin" ]; then
        # Fast path: packages already installed, just set up environment
        _launchpad_fast_activate "$PWD" "$env_cache_dir"
      else
        # Slow path: need to install packages
        echo "🔄 Setting up development environment..." >&2

        # Set flag to prevent recursive calls
        export _PKGX_ACTIVATING="$PWD"

        if [[ "${dev_cmd}" == *"launchpad"* ]]; then
          # Try to run launchpad dev:dump with proper error handling
          local launchpad_output=""
          # Capture both stdout and stderr, check exit code
          if launchpad_output=$(${dev_cmd} dev:dump "$PWD" 2>&1) && [ $? -eq 0 ]; then
            # If launchpad succeeds, extract just the shell script part using system sed
            local shell_script=""
            shell_script=$(echo "$launchpad_output" | /usr/bin/sed -n '/^[[:space:]]*#.*Project-specific environment/,$p' 2>/dev/null || echo "$launchpad_output" | sed -n '/^[[:space:]]*#.*Project-specific environment/,$p')
            if [ -n "$shell_script" ]; then
              eval "$shell_script"
            else
              echo "⚠️  Launchpad succeeded but no shell script found, using pkgx fallback..." >&2
              eval "$(_pkgx_activate_with_pkgx "$PWD")"
            fi
          else
            # If launchpad fails or produces no output, use pkgx fallback
            echo "⚠️  Launchpad unavailable, using pkgx fallback..." >&2
            eval "$(_pkgx_activate_with_pkgx "$PWD")"
          fi
        else
          eval "$(${dev_cmd} dump)"
        fi

        # Clear the flag after activation
        unset _PKGX_ACTIVATING
      fi
    fi
  fi
}

# Fast activation function for already-installed packages
_launchpad_fast_activate() {
  local cwd="$1"
  local env_dir="$2"

  # Clean up PATH by removing any existing launchpad environment paths
  CLEANED_PATH="$(echo "$PATH" | tr ':' '\n' | grep -v '/.local/share/launchpad/envs/' | tr '\n' ':' | sed 's/:$//')"

  # Store the cleaned PATH as original
  export _LAUNCHPAD_ORIGINAL_PATH="$CLEANED_PATH"
  export PATH="$env_dir/bin:$env_dir/sbin:$PATH"

  # Create the deactivation function
  eval "_pkgx_dev_try_bye() {
    local suffix=\"\\\${PWD#\\\"$cwd\\\"}\"
    [ \\\"\\\$PWD\\\" = \\\"$cwd\\\$suffix\\\" ] && return 1
    echo -e \\\"\\\\x1b[31mdev environment deactivated\\\\x1b[0m\\\" >&2
    # Restore original PATH to properly isolate the environment
    if [ -n \\\"\\\$_LAUNCHPAD_ORIGINAL_PATH\\\" ]; then
      export PATH=\\\"\\\$_LAUNCHPAD_ORIGINAL_PATH\\\"
      unset _LAUNCHPAD_ORIGINAL_PATH
    fi
    unset -f _pkgx_dev_try_bye
  }"

  echo "✅ Environment activated for $cwd" >&2
}

# Function to activate environment using pkgx directly
_pkgx_activate_with_pkgx() {
  local dir="$1"

  # Check for any supported dependency file
  local deps_file=""
  for file in dependencies.yaml dependencies.yml pkgx.yaml pkgx.yml .pkgx.yaml .pkgx.yml .launchpad.yaml launchpad.yaml .launchpad.yml launchpad.yml deps.yml deps.yaml .deps.yml .deps.yaml; do
    if [ -f "$dir/$file" ]; then
      deps_file="$dir/$file"
      break
    fi
  done

  if [ -z "$deps_file" ] || ! command -v pkgx >/dev/null 2>&1; then
    echo "⚠️  No dependency file found or pkgx not available" >&2
    return 1
  fi

  echo "🔄 Activating environment with pkgx (fallback mode)..." >&2

  # Create ~/.local/bin directory
  mkdir -p "$HOME/.local/bin"

  # Call pkgx env to get environment variables for the packages
  # Use a subshell to avoid changing current directory permanently
  local env_output
  env_output=$(cd "$dir" && pkgx env 2>/dev/null)

  if [ $? -eq 0 ]; then
    # Setup output
    echo "# Environment setup (fallback mode)"
    echo "eval \\"_pkgx_dev_try_bye() {"
    echo "  echo 'dev environment deactivated' >&2"
    echo "  unset -f _pkgx_dev_try_bye"
    echo "}\\""
    echo ""

    # Ensure PATH contains ~/.local/bin
    echo "if [[ \\":\$PATH:\\" != *\\":\$HOME/.local/bin:\\"* ]]; then"
    echo "  export PATH=\\"\$HOME/.local/bin:\$PATH\\""
    echo "fi"

    # Set environment variables
    echo "set -a"

    # Filter environment variables using system tools when possible
    echo "$env_output" | /usr/bin/grep -v '^#' 2>/dev/null | /usr/bin/grep -v '^$' 2>/dev/null | \\
      /usr/bin/grep -v 'LS_COLORS=' 2>/dev/null | /usr/bin/grep -v 'VSCODE' 2>/dev/null | /usr/bin/grep -v 'CURSOR' 2>/dev/null | \\
      /usr/bin/grep -v 'JetBrains' 2>/dev/null | /usr/bin/grep -v '(Plugin)' 2>/dev/null | \\
      /usr/bin/sed 's/"/\\\\"/g' 2>/dev/null || \\
      echo "$env_output" | grep -v '^#' | grep -v '^$' | \\
      grep -v 'LS_COLORS=' | grep -v 'VSCODE' | grep -v 'CURSOR' | \\
      grep -v 'JetBrains' | grep -v '(Plugin)' | \\
      sed 's/"/\\\\"/g'

    echo "set +a"
    echo "echo '✅ Dev environment activated via pkgx (fallback)' >&2"

    return 0
  else
    echo "⚠️  Failed to activate environment with pkgx" >&2
    return 1
  fi
}

dev() {
  case "$1" in
  off)
    if type -f _pkgx_dev_try_bye >/dev/null 2>&1; then
      dir="$PWD"
      while [ "$dir" != / -a "$dir" != . ]; do
        if [ -f "${dataDirPath}/$dir/dev.pkgx.activated" ]; then
          rm "${dataDirPath}/$dir/dev.pkgx.activated"
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
      "${dev_cmd}" "$@"
    elif ! type -f _pkgx_dev_try_bye >/dev/null 2>&1; then
      mkdir -p "${dataDirPath}$PWD"
      touch "${dataDirPath}$PWD/dev.pkgx.activated"
      if [[ "${dev_cmd}" == *"launchpad"* ]]; then
        # Try to run launchpad dev:dump with proper error handling
        local launchpad_output=""
        # Capture both stdout and stderr, check exit code
        if launchpad_output=$(${dev_cmd} dev:dump "$PWD" 2>&1) && [ $? -eq 0 ]; then
          # If launchpad succeeds, extract just the shell script part using system sed
          local shell_script=""
          shell_script=$(echo "$launchpad_output" | /usr/bin/sed -n '/^[[:space:]]*#.*Project-specific environment/,$p' 2>/dev/null || echo "$launchpad_output" | sed -n '/^[[:space:]]*#.*Project-specific environment/,$p')
          if [ -n "$shell_script" ]; then
            eval "$shell_script"
          else
            echo "⚠️  Launchpad succeeded but no shell script found, using pkgx fallback..." >&2
            eval "$(_pkgx_activate_with_pkgx "$PWD")"
          fi
        else
          # If launchpad fails or produces no output, use pkgx fallback
          echo "⚠️  Launchpad unavailable, using pkgx fallback..." >&2
          eval "$(_pkgx_activate_with_pkgx "$PWD")"
        fi
      else
        eval "$(${dev_cmd} dump)"
      fi
    else
      echo "devenv already active" >&2
    fi;;
  *)
    # Pass all other commands directly to dev/launchpad
    "${dev_cmd}" "$@";;
  esac
}

if [ -n "$ZSH_VERSION" ] && [ "$(emulate)" = "zsh" ]; then
  eval 'typeset -ag chpwd_functions

        if [[ -z "\${chpwd_functions[(r)_pkgx_chpwd_hook]+1}" ]]; then
          chpwd_functions=( _pkgx_chpwd_hook \${chpwd_functions[@]} )
        fi

        # Skip heavy operations on initial startup
        export _LAUNCHPAD_STARTUP_SKIP=1
        # Run hook immediately but skip heavy operations
        _pkgx_chpwd_hook'
elif [ -n "$BASH_VERSION" ] && [ "$POSIXLY_CORRECT" != y ] ; then
  eval 'cd() {
          builtin cd "$@" || return
          _pkgx_chpwd_hook
        }
        # Skip heavy operations on initial startup
        export _LAUNCHPAD_STARTUP_SKIP=1
        # Run hook immediately but skip heavy operations
        _pkgx_chpwd_hook'
else
  POSIXLY_CORRECT=y
  echo "pkgx: dev: warning: unsupported shell" >&2
fi
`.trim()
}

export function datadir(): string {
  const xdgDataHome = process.env.XDG_DATA_HOME?.trim()
  if (xdgDataHome) {
    return join(xdgDataHome, 'pkgx', 'dev')
  }

  return join(platform_data_home_default(), 'pkgx', 'dev')
}

function platform_data_home_default(): string {
  const home = homedir()
  switch (platform()) {
    case 'darwin':
      return join(home, 'Library', 'Application Support')
    case 'win32': {
      const LOCALAPPDATA = process.env.LOCALAPPDATA
      if (LOCALAPPDATA) {
        return LOCALAPPDATA
      }
      else {
        return join(home, 'AppData', 'Local')
      }
    }
    default:
      return join(home, '.local', 'share')
  }
}
