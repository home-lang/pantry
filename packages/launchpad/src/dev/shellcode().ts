import { existsSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

export default function shellcode(): string {
  // find self
  const pathDirs = process.env.PATH?.split(':') || []
  const dev_cmd = pathDirs
    .map(dir => join(dir, 'launchpad'))
    .find(cmd => existsSync(cmd)) || pathDirs
    .map(dir => join(dir, 'dev'))
    .find(cmd => existsSync(cmd))

  if (!dev_cmd)
    throw new Error('couldn\'t find `dev` or `launchpad`')

  const dataDirPath = datadir()

  return `
# Global variable to prevent infinite loops
_PKGX_ACTIVATING=""

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
    if [ -f "${dataDirPath}/$dir/dev.pkgx.activated" ]; then
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
  for file in dependencies.yaml dependencies.yml pkgx.yaml pkgx.yml .pkgx.yaml .pkgx.yml .launchpad.yaml launchpad.yaml .launchpad.yml launchpad.yml; do
    if [ -f "$PWD/$file" ]; then
      deps_file="$PWD/$file"
      break
    fi
  done

  # Ensure ~/.local/bin exists and is in PATH
  mkdir -p "$HOME/.local/bin"
  if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    export PATH="$HOME/.local/bin:$PATH"
  fi

  # If we found a dependency file, always create activation and activate
  if [ -n "$deps_file" ]; then
    # Only create activation if not already found
    if [ "$found_activation" = false ]; then
      mkdir -p "${dataDirPath}$PWD"
      touch "${dataDirPath}$PWD/dev.pkgx.activated"
      found_activation=true
      activation_dir="$PWD"
      echo "🔄 Auto-activating environment for $(basename "$PWD")" >&2
    fi

    # Force activation if we weren't active before
    if [ "$was_active" = false ]; then
      # Set flag to prevent recursive calls
      export _PKGX_ACTIVATING="$PWD"

      if [[ "${dev_cmd}" == *"launchpad"* ]]; then
        # Try to run launchpad dev:dump with proper error handling
        local launchpad_output=""
        if launchpad_output=$(${dev_cmd} dev:dump "$PWD" 2>/dev/null) && [ -n "$launchpad_output" ]; then
          # If launchpad succeeds and produces output, use it
          eval "$launchpad_output"
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
}

# Function to activate environment using pkgx directly
_pkgx_activate_with_pkgx() {
  local dir="$1"

  if [ ! -f "$dir/dependencies.yaml" ] || ! command -v pkgx >/dev/null 2>&1; then
    echo "⚠️  No dependencies.yaml or pkgx not available" >&2
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
    echo "eval \"_pkgx_dev_try_bye() {"
    echo "  echo 'dev environment deactivated' >&2"
    echo "  unset -f _pkgx_dev_try_bye"
    echo "}\""
    echo ""

    # Ensure PATH contains ~/.local/bin
    echo "if [[ \":\$PATH:\" != *\":\$HOME/.local/bin:\"* ]]; then"
    echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo "fi"

    # Set environment variables
    echo "set -a"

    # Filter environment variables
    echo "$env_output" | grep -v '^#' | grep -v '^$' | \
      grep -v 'LS_COLORS=' | grep -v 'VSCODE' | grep -v 'CURSOR' | \
      grep -v 'JetBrains' | grep -v '(Plugin)' | \
      sed 's/"/\\"/g'

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
        if launchpad_output=$(${dev_cmd} dev:dump "$PWD" 2>/dev/null) && [ -n "$launchpad_output" ]; then
          # If launchpad succeeds and produces output, use it
          eval "$launchpad_output"
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

        # Run hook immediately regardless of terminal type
        _pkgx_chpwd_hook'
elif [ -n "$BASH_VERSION" ] && [ "$POSIXLY_CORRECT" != y ] ; then
  eval 'cd() {
          builtin cd "$@" || return
          _pkgx_chpwd_hook
        }
        # Run hook immediately
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
