import { existsSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

/**
 * Supported dependency file names in order of preference
 */
const DEPENDENCY_FILES = [
  'dependencies.yaml',
  'dependencies.yml',
  'pkgx.yaml',
  'pkgx.yml',
  '.pkgx.yaml',
  '.pkgx.yml',
  '.launchpad.yaml',
  'launchpad.yaml',
  '.launchpad.yml',
  'launchpad.yml',
  'deps.yml',
  'deps.yaml',
  '.deps.yml',
  '.deps.yaml',
] as const

/**
 * Find the launchpad/dev command in PATH or local directories
 */
function findDevCommand(): string {
  const pathDirs = process.env.PATH?.split(':') || []

  // Try to find launchpad or dev in PATH
  let dev_cmd = pathDirs
    .map(dir => join(dir, 'launchpad'))
    .find(cmd => existsSync(cmd)) || pathDirs
    .map(dir => join(dir, 'dev'))
    .find(cmd => existsSync(cmd))

  // If no global installation found, try to find the local script
  if (!dev_cmd) {
    const currentDir = process.cwd()
    const candidates = [
      join(currentDir, 'launchpad'),
      join(currentDir, '..', 'launchpad'),
      join(currentDir, 'packages', 'launchpad', 'bin', 'cli.ts'),
    ]

    dev_cmd = candidates.find(cmd => existsSync(cmd))

    if (!dev_cmd) {
      throw new Error('couldn\'t find `dev` or `launchpad` - please install launchpad globally or run from the project directory')
    }
  }

  // Convert relative paths to absolute paths so they work from any directory
  if (dev_cmd && (dev_cmd.startsWith('./') || dev_cmd === 'launchpad')) {
    const currentDir = process.cwd()
    if (dev_cmd === 'launchpad') {
      dev_cmd = join(currentDir, 'launchpad')
    }
    else {
      dev_cmd = join(currentDir, dev_cmd.replace('./', ''))
    }
  }

  return dev_cmd
}

export default function shellcode(): string {
  const dev_cmd = findDevCommand()
  const dataDirPath = datadir()
  const dependencyFilesList = DEPENDENCY_FILES.join(' ')

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
    # Extract the current environment directory from the function case statement
    current_env_dir=$(declare -f _pkgx_dev_try_bye | grep -o '"/[^"]*"' | head -1 | sed 's/"//g')
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
  for file in ${dependencyFilesList}; do
    if [ -f "$PWD/$file" ]; then
      deps_file="$PWD/$file"
      break
    fi
  done

  # DEACTIVATION LOGIC: Check if we should deactivate the current environment
  if [ "$was_active" = true ] && [ -n "$current_env_dir" ]; then
    # Deactivate if we're not in the project directory or any of its subdirectories
    case "$PWD" in
      "$current_env_dir"|"$current_env_dir/"*)
        # Still in the same project directory tree, keep active
        ;;
      *)
        # Outside the project directory tree, deactivate
        _pkgx_dev_try_bye
        was_active=false
        ;;
    esac
  fi

  # ACTIVATION LOGIC: Only run if we're not already active
  if [ "$was_active" = false ]; then
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

      # Force activation since we weren't active before
      # Generate project hash more reliably - use full hash to prevent collisions
      local project_hash=""
      if command -v python3 >/dev/null 2>&1; then
        project_hash=$(echo -n "$PWD" | python3 -c "import sys, hashlib; print(hashlib.md5(sys.stdin.read().encode()).hexdigest())" 2>/dev/null)
      elif command -v openssl >/dev/null 2>&1; then
        project_hash=$(echo -n "$PWD" | openssl md5 2>/dev/null | cut -d' ' -f2)
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
          local exit_code=0
          # Capture both stdout and stderr, check exit code
          launchpad_output=$(${dev_cmd} dev:dump "$PWD" 2>&1) || exit_code=$?

          if [ $exit_code -eq 0 ] && [ -n "$launchpad_output" ]; then
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
            echo "⚠️  Launchpad unavailable (exit code: $exit_code), using pkgx fallback..." >&2
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

  # Store original PATH before any modifications (critical for proper restoration)
  if [ -z "$_LAUNCHPAD_ORIGINAL_PATH" ]; then
    export _LAUNCHPAD_ORIGINAL_PATH="$PATH"
  fi

  # Set up project-specific PATH
  export PATH="$env_dir/bin:$env_dir/sbin:$_LAUNCHPAD_ORIGINAL_PATH"

  # Create the deactivation function with proper directory checking
  eval "_pkgx_dev_try_bye() {
    # Check if we're still in the project directory or a subdirectory
    case \"\$PWD\" in
      \"$cwd\"|\"$cwd/\"*)
        # Still in project directory, don't deactivate
        return 1
        ;;
      *)
        echo -e \"\\x1b[31mdev environment deactivated\\x1b[0m\" >&2
        # Restore original PATH to properly isolate the environment
        if [ -n \"\$_LAUNCHPAD_ORIGINAL_PATH\" ]; then
          export PATH=\"\$_LAUNCHPAD_ORIGINAL_PATH\"
          unset _LAUNCHPAD_ORIGINAL_PATH
        fi
        unset -f _pkgx_dev_try_bye
        ;;
    esac
  }"

  echo "✅ Environment activated for $cwd" >&2
}

# Function to activate environment using pkgx directly
_pkgx_activate_with_pkgx() {
  local dir="$1"

  # Check for any supported dependency file
  local deps_file=""
  for file in ${dependencyFilesList}; do
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
  local exit_code=0
  env_output=$(cd "$dir" && pkgx env 2>/dev/null) || exit_code=$?

  if [ $exit_code -eq 0 ] && [ -n "$env_output" ]; then
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
    if command -v /usr/bin/grep >/dev/null 2>&1 && command -v /usr/bin/sed >/dev/null 2>&1; then
      echo "$env_output" | /usr/bin/grep -v '^#' 2>/dev/null | /usr/bin/grep -v '^$' 2>/dev/null | \\
        /usr/bin/grep -v 'LS_COLORS=' 2>/dev/null | /usr/bin/grep -v 'VSCODE' 2>/dev/null | /usr/bin/grep -v 'CURSOR' 2>/dev/null | \\
        /usr/bin/grep -v 'JetBrains' 2>/dev/null | /usr/bin/grep -v '(Plugin)' 2>/dev/null | \\
        /usr/bin/sed 's/"/\\\\"/g' 2>/dev/null
    else
      echo "$env_output" | grep -v '^#' | grep -v '^$' | \\
        grep -v 'LS_COLORS=' | grep -v 'VSCODE' | grep -v 'CURSOR' | \\
        grep -v 'JetBrains' | grep -v '(Plugin)' | \\
        sed 's/"/\\\\"/g'
    fi

    echo "set +a"
    echo "echo '✅ Dev environment activated via pkgx (fallback)' >&2"

    return 0
  else
    echo "⚠️  Failed to activate environment with pkgx (exit code: $exit_code)" >&2
    return 1
  fi
}

dev() {
  case "$1" in
  off)
    if type -f _pkgx_dev_try_bye >/dev/null 2>&1; then
      local dir="$PWD"
      while [ "$dir" != / -a "$dir" != . ]; do
        if [ -f "${dataDirPath}/$dir/dev.pkgx.activated" ]; then
          rm -f "${dataDirPath}/$dir/dev.pkgx.activated"
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
        local exit_code=0
        # Capture both stdout and stderr, check exit code
        launchpad_output=$(${dev_cmd} dev:dump "$PWD" 2>&1) || exit_code=$?

        if [ $exit_code -eq 0 ] && [ -n "$launchpad_output" ]; then
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
          echo "⚠️  Launchpad unavailable (exit code: $exit_code), using pkgx fallback..." >&2
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
