import { existsSync, readdirSync } from 'node:fs'
import path, { join } from 'node:path'
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
 * Find the dev command to use in shell integration
 * Looks for global installations first, then local development setups
 */
function findDevCommand(): string {
  const pathDirs = (process.env.PATH || '').split(':').filter(Boolean)
  const currentDir = process.cwd()

  // FIRST: Check if we're in a launchpad development environment
  // In this case, prefer the local script over any global installations
  const localCandidates = [
    join(currentDir, 'launchpad'),
    join(currentDir, '..', 'launchpad'),
    join(currentDir, 'packages', 'launchpad', 'bin', 'cli.ts'),
  ]

  const localLaunchpadScript = localCandidates.find(cmd => existsSync(cmd))

  if (localLaunchpadScript) {
    // We found a local launchpad script, prepare it for execution
    let dev_cmd = localLaunchpadScript

    // Convert relative paths to absolute paths so they work from any directory
    if (dev_cmd.startsWith('./') || !path.isAbsolute(dev_cmd)) {
      dev_cmd = path.resolve(dev_cmd)
    }

    // Since this is a local launchpad script, we need to find a way to run it
    // Try to find bun in multiple locations
    const homeDir = process.env.HOME || '~'
    const possibleBunPaths = [
      // Check PATH first
      ...pathDirs.map(dir => join(dir, 'bun')),
      // Check common installation locations
      join(homeDir, '.bun', 'bin', 'bun'),
      join('/usr/local/bin', 'bun'),
      join('/opt/homebrew/bin', 'bun'),
      join(homeDir, '.local', 'bin', 'bun'),
      // Check launchpad environment directories
      ...(function () {
        const launchpadEnvsDir = join(homeDir, '.local', 'share', 'launchpad', 'envs')
        if (existsSync(launchpadEnvsDir)) {
          try {
            const envDirs = readdirSync(launchpadEnvsDir)
            return envDirs.map(envDir => join(launchpadEnvsDir, envDir, 'bin', 'bun'))
          }
          catch {
            return []
          }
        }
        return []
      })(),
    ]

    const bunPath = possibleBunPaths.find(path => existsSync(path))

    if (bunPath) {
      // Use the found bun binary
      return `${bunPath} ${dev_cmd}`
    }
    else {
      // Check if pkgx is available
      const pkgxPath = pathDirs
        .map(dir => join(dir, 'pkgx'))
        .find(cmd => existsSync(cmd))

      if (pkgxPath) {
        // Fallback to pkgx bun
        return `pkgx bun ${dev_cmd}`
      }
      else {
        // If neither bun nor pkgx is available, we can't run the script
        // Return a command that will provide helpful error message
        return `echo "❌ Neither bun nor pkgx found. Please install one of them or run: curl -fsSL https://bun.sh/install | bash" >&2; false`
      }
    }
  }

  // SECOND: Try to find a globally installed launchpad command
  let dev_cmd = pathDirs
    .map(dir => join(dir, 'launchpad'))
    .find(cmd => existsSync(cmd))

  if (dev_cmd) {
    return 'launchpad'
  }

  // THIRD: Try to find a globally installed dev command
  dev_cmd = pathDirs
    .map(dir => join(dir, 'dev'))
    .find(cmd => existsSync(cmd))

  if (dev_cmd) {
    return 'dev'
  }

  // If nothing is found, provide a fallback that will work in most environments
  // This ensures dev:shellcode always works, even if launchpad isn't globally installed
  return 'echo "❌ Neither bun nor pkgx found. Please install one of them or run: curl -fsSL https://bun.sh/install | bash" >&2; false'
}

export default function shellcode(): string {
  const dev_cmd = findDevCommand()
  const dependencyFilesList = DEPENDENCY_FILES.join(' ')

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
  local current_env_dir=""
  if type _pkgx_dev_try_bye >/dev/null 2>&1; then
    was_active=true
    # Try to extract the current environment directory from the function
    # First try launchpad-style function (with case statement and quoted paths)
    current_env_dir=$(declare -f _pkgx_dev_try_bye | grep -o '"/[^"]*"' | head -1 | sed 's/"//g')

    # If that fails, we might have a pkgx fallback function
    # In this case, we can't reliably determine the original directory,
    # so we'll treat any directory with deps as a potential switch
    if [ -z "$current_env_dir" ]; then
      # For pkgx fallback functions, we'll use a more aggressive approach
      # and assume the current environment should be deactivated if we find
      # a different dependency file
      current_env_dir="__unknown__"
    fi
  fi

  # Find dependency files in current directory
  local deps_file=""
  for file in ${dependencyFilesList}; do
    if [ -f "$PWD/$file" ]; then
      deps_file="$PWD/$file"
      break
    fi
  done

  # DEACTIVATION LOGIC: Check if we should deactivate the current environment
  local adjusting_env=false
  if [ "$was_active" = true ] && [ -n "$current_env_dir" ]; then
    if [ "$current_env_dir" = "__unknown__" ]; then
      # We have an active environment but don't know its directory (pkgx fallback)
      # If we found a dependency file, assume we need to switch environments
      if [ -n "$deps_file" ]; then
        echo "🔄 Adjusting development environment..." >&2
        adjusting_env=true
        _pkgx_dev_try_bye silent
        was_active=false
      fi
    else
      # We know the current environment directory (launchpad-created function)
      # Check if current directory has its own dependency file (nested environment)
      if [ -n "$deps_file" ] && [ "$PWD" != "$current_env_dir" ]; then
        # We're in a subdirectory with its own dependency file, switch environments
        echo "🔄 Adjusting development environment..." >&2
        adjusting_env=true
        _pkgx_dev_try_bye silent
        was_active=false
      elif [ -z "$deps_file" ]; then
        # Check if we're outside the project directory tree
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
      else
        # We have a dependency file and we're in the same directory as the active environment
        # No need to reactivate - just return early
        return 0
      fi
    fi
  fi

  # ACTIVATION LOGIC: Only run if we're not already active and we found a dependency file
  if [ "$was_active" = false ] && [ -n "$deps_file" ]; then
    # Ensure ~/.local/bin exists and is in PATH
    mkdir -p "$HOME/.local/bin"
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
      export PATH="$HOME/.local/bin:$PATH"
    fi

    # Generate project hash more reliably - use full hash to prevent collisions
    local project_hash=""
    if command -v /usr/bin/python3 >/dev/null 2>&1; then
      project_hash=$(echo -n "$PWD" | /usr/bin/python3 -c "import sys, hashlib; print(hashlib.md5(sys.stdin.read().encode()).hexdigest())" 2>/dev/null)
    elif command -v python3 >/dev/null 2>&1; then
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

    # Also check for base64-encoded directory for backward compatibility
    local base64_hash=""
    if [ ! -d "$env_cache_dir/bin" ] && [ ! -d "$env_cache_dir/sbin" ]; then
      base64_hash=$(echo -n "$PWD" | base64 2>/dev/null | tr -d '\\n' | tr '/+=' '___')
      if [ -n "$base64_hash" ]; then
        local base64_cache_dir="$HOME/.local/share/launchpad/envs/$base64_hash"
        # Check if base64 cache has actual binaries
        if [ -d "$base64_cache_dir" ]; then
          local base64_has_binaries=false
          if [ -d "$base64_cache_dir/bin" ] && [ "$(ls -A "$base64_cache_dir/bin" 2>/dev/null)" ]; then
            base64_has_binaries=true
          elif [ -d "$base64_cache_dir/sbin" ] && [ "$(ls -A "$base64_cache_dir/sbin" 2>/dev/null)" ]; then
            base64_has_binaries=true
          fi

          if [ "$base64_has_binaries" = true ]; then
            env_cache_dir="$base64_cache_dir"
          fi
        fi
      fi
    fi

    # If packages are already installed, do fast activation
    if [ -n "$env_cache_dir" ] && [ -d "$env_cache_dir" ]; then
      # Check if there are actual binaries installed, not just empty directories
      local has_binaries=false
      if [ -d "$env_cache_dir/bin" ] && [ "$(ls -A "$env_cache_dir/bin" 2>/dev/null)" ]; then
        has_binaries=true
      elif [ -d "$env_cache_dir/sbin" ] && [ "$(ls -A "$env_cache_dir/sbin" 2>/dev/null)" ]; then
        has_binaries=true
      fi

      if [ "$has_binaries" = true ]; then
        # Fast path: packages already installed, just set up environment
        _launchpad_fast_activate "$PWD" "$env_cache_dir"
      else
        # Cache directory exists but no binaries - treat as slow path
        # Only show "Setting up development environment..." if we're not adjusting
        if [ "$adjusting_env" = false ]; then
          echo "🔄 Setting up development environment..." >&2
        fi

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
            # If launchpad fails, show the error but try fallback
            if [[ "$launchpad_output" == *"bun: No such file or directory"* ]]; then
              echo "⚠️  Bun not found. Install it with: curl -fsSL https://bun.sh/install | bash" >&2
              echo "    Or install pkgx: curl -fsSL https://pkgx.sh | bash" >&2
            elif [[ "$launchpad_output" == *"Neither bun nor pkgx found"* ]]; then
              echo "$launchpad_output" >&2
            else
              echo "⚠️  Launchpad unavailable (exit code: $exit_code), trying pkgx fallback..." >&2
              if [ "$exit_code" -ne 0 ] && [ -n "$launchpad_output" ]; then
                echo "    Error: $launchpad_output" >&2
              fi
            fi

            # Try pkgx fallback
            if command -v pkgx >/dev/null 2>&1; then
              eval "$(_pkgx_activate_with_pkgx "$PWD")"
            else
              echo "❌ Cannot activate environment: neither launchpad nor pkgx is available" >&2
              echo "   Install one of the following:" >&2
              echo "   • Bun: curl -fsSL https://bun.sh/install | bash" >&2
              echo "   • pkgx: curl -fsSL https://pkgx.sh | bash" >&2
            fi
          fi
        else
          # For other dev commands, try with basic error handling
          local dev_output=""
          local dev_exit_code=0
          dev_output=$(${dev_cmd} dump 2>&1) || dev_exit_code=$?

          if [ $dev_exit_code -eq 0 ] && [ -n "$dev_output" ]; then
            eval "$dev_output"
          else
            echo "⚠️  Dev command failed (exit code: $dev_exit_code)" >&2
            if [ -n "$dev_output" ]; then
              echo "    Error: $dev_output" >&2
            fi
          fi
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

  # Build PATH with only existing directories for better performance
  local new_path=""
  if [ -d "$env_dir/bin" ]; then
    new_path="$env_dir/bin"
  fi
  if [ -d "$env_dir/sbin" ]; then
    if [ -n "$new_path" ]; then
      new_path="$new_path:$env_dir/sbin"
    else
      new_path="$env_dir/sbin"
    fi
  fi

  # Set up project-specific PATH
  if [ -n "$new_path" ]; then
    export PATH="$new_path:$_LAUNCHPAD_ORIGINAL_PATH"
  else
    export PATH="$_LAUNCHPAD_ORIGINAL_PATH"
  fi

  # Create the deactivation function with proper directory checking
  _pkgx_dev_try_bye() {
    case "$PWD" in
      "$cwd"|"$cwd/"*)
        return 1
        ;;
      *)
        if [ "$1" != "silent" ]; then
          echo -e "\\033[31mdev environment deactivated\\033[0m" >&2
        fi
        if [ -n "$_LAUNCHPAD_ORIGINAL_PATH" ]; then
          export PATH="$_LAUNCHPAD_ORIGINAL_PATH"
          unset _LAUNCHPAD_ORIGINAL_PATH
        fi
        unset -f _pkgx_dev_try_bye
        ;;
    esac
  }

  echo "✅ Environment activated for \\033[3m$cwd\\033[0m" >&2
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
    echo "  if [ \\\\\\"\\$1\\\\\\" != \\\\\\"silent\\\\\\" ]; then"
    echo "    echo 'dev environment deactivated' >&2"
    echo "  fi"
    echo "  unset -f _pkgx_dev_try_bye"
    echo "}\\""
    echo ""

    # Ensure PATH contains ~/.local/bin
    echo "if [[ :\\$PATH: != *\\":\\$HOME/.local/bin:\\"* ]]; then"
    echo "  export PATH=\\"\\$HOME/.local/bin:\\$PATH\\""
    echo "fi"

    # Set environment variables
    echo "set -a"

    # Filter environment variables using system tools when possible
    if command -v /usr/bin/grep >/dev/null 2>&1 && command -v /usr/bin/sed >/dev/null 2>&1; then
      echo "$env_output" | /usr/bin/grep -v '^#' 2>/dev/null | /usr/bin/grep -v '^$' 2>/dev/null | \
        /usr/bin/grep -v 'LS_COLORS=' 2>/dev/null | /usr/bin/grep -v 'VSCODE' 2>/dev/null | /usr/bin/grep -v 'CURSOR' 2>/dev/null | \
        /usr/bin/grep -v 'JetBrains' 2>/dev/null | /usr/bin/grep -v '(Plugin)' 2>/dev/null | \
        /usr/bin/sed 's/"/\\\\"/g' 2>/dev/null
    else
      echo "$env_output" | grep -v '^#' | grep -v '^$' | \
        grep -v 'LS_COLORS=' | grep -v 'VSCODE' | grep -v 'CURSOR' | \
        grep -v 'JetBrains' | grep -v '(Plugin)' | \
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
      PWD=/ _pkgx_dev_try_bye
    else
      echo "no devenv" >&2
    fi;;
  ''|on)
    if [ "$2" ]; then
      "${dev_cmd}" "$@"
    elif ! type -f _pkgx_dev_try_bye >/dev/null 2>&1; then
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
          # If launchpad fails, show the error but try fallback
          if [[ "$launchpad_output" == *"bun: No such file or directory"* ]]; then
            echo "⚠️  Bun not found. Install it with: curl -fsSL https://bun.sh/install | bash" >&2
            echo "    Or install pkgx: curl -fsSL https://pkgx.sh | bash" >&2
          elif [[ "$launchpad_output" == *"Neither bun nor pkgx found"* ]]; then
            echo "$launchpad_output" >&2
          else
            echo "⚠️  Launchpad unavailable (exit code: $exit_code), trying pkgx fallback..." >&2
            if [ "$exit_code" -ne 0 ] && [ -n "$launchpad_output" ]; then
              echo "    Error: $launchpad_output" >&2
            fi
          fi

          # Try pkgx fallback
          if command -v pkgx >/dev/null 2>&1; then
            eval "$(_pkgx_activate_with_pkgx "$PWD")"
          else
            echo "❌ Cannot activate environment: neither launchpad nor pkgx is available" >&2
            echo "   Install one of the following:" >&2
            echo "   • Bun: curl -fsSL https://bun.sh/install | bash" >&2
            echo "   • pkgx: curl -fsSL https://pkgx.sh | bash" >&2
          fi
        fi
      else
        # For other dev commands, try with basic error handling
        local dev_output=""
        local dev_exit_code=0
        dev_output=$(${dev_cmd} dump 2>&1) || dev_exit_code=$?

        if [ $dev_exit_code -eq 0 ] && [ -n "$dev_output" ]; then
          eval "$dev_output"
        else
          echo "⚠️  Dev command failed (exit code: $dev_exit_code)" >&2
          if [ -n "$dev_output" ]; then
            echo "    Error: $dev_output" >&2
          fi
        fi
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

        # Check for dependency files on shell startup (no background jobs, no delays)
        if ! type _pkgx_dev_try_bye >/dev/null 2>&1; then
          for file in ${dependencyFilesList}; do
            if [ -f "$PWD/$file" ]; then
              _pkgx_chpwd_hook
              break
            fi
          done
        fi'
elif [ -n "$BASH_VERSION" ] && [ "$POSIXLY_CORRECT" != y ] ; then
  eval 'cd() {
          builtin cd "$@" || return
          _pkgx_chpwd_hook
        }

        # Check for dependency files on shell startup (no background jobs, no delays)
        if ! type _pkgx_dev_try_bye >/dev/null 2>&1; then
          for file in ${dependencyFilesList}; do
            if [ -f "$PWD/$file" ]; then
              _pkgx_chpwd_hook
              break
            fi
          done
        fi'
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
  const home = process.env.HOME || '~'
  switch (process.platform) {
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
