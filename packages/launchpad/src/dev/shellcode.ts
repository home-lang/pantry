import { existsSync } from 'node:fs'
import path, { join } from 'node:path'
import process from 'node:process'
import { config } from '../config'

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

  const localLaunchpadScript = localCandidates.find((cmd) => {
    try {
      return existsSync(cmd)
    }
    catch {
      return false
    }
  })

  if (localLaunchpadScript) {
    // We found a local launchpad script, prepare it for execution
    let dev_cmd = localLaunchpadScript

    // Convert relative paths to absolute paths so they work from any directory
    if (dev_cmd.startsWith('./') || !path.isAbsolute(dev_cmd)) {
      dev_cmd = path.resolve(dev_cmd)
    }

    // Since this is a local launchpad script, we need to find a stable way to run it
    // First, try to find bun in stable locations, avoiding temporary pkgx paths
    const homeDir = process.env.HOME || process.env.USERPROFILE || '~'
    const stableBunPaths = [
      // Check common user installation locations (stable paths) first
      join(homeDir, '.bun', 'bin', 'bun'),
      join('/usr/local/bin', 'bun'),
      join('/opt/homebrew/bin', 'bun'),
      join(homeDir, '.local', 'bin', 'bun'),
      // Check PATH but filter out temporary pkgx paths
      ...pathDirs
        .map(dir => join(dir, 'bun'))
        .filter(path => !path.includes('.pkgx') && !path.includes('/tmp/')),
    ]

    const bunPath = stableBunPaths.find((path) => {
      try {
        return existsSync(path)
      }
      catch {
        return false
      }
    })

    if (bunPath) {
      // Use the found stable bun binary - ensure proper quoting for shell execution
      return `"${bunPath}" "${dev_cmd}"`
    }
    else {
      // Check if bun is available globally via command -v
      return `if command -v bun >/dev/null 2>&1; then bun "${dev_cmd}"; else echo "❌ Bun not found. Install bun: curl -fsSL https://bun.sh/install | bash" >&2 && false; fi`
    }
  }

  // SECOND: Try to find a globally installed launchpad command
  let dev_cmd = pathDirs
    .map(dir => join(dir, 'launchpad'))
    .find((cmd) => {
      try {
        return existsSync(cmd)
      }
      catch {
        return false
      }
    })

  if (dev_cmd) {
    return 'launchpad'
  }

  // THIRD: Try to find a globally installed dev command
  dev_cmd = pathDirs
    .map(dir => join(dir, 'dev'))
    .find((cmd) => {
      try {
        return existsSync(cmd)
      }
      catch {
        return false
      }
    })

  if (dev_cmd) {
    return 'dev'
  }

  // If nothing is found, provide a fallback that will work in most environments
  // This ensures dev:shellcode always works, even if launchpad isn't globally installed
  return `echo "❌ Launchpad not found. Install bun to use local development: curl -fsSL https://bun.sh/install | bash" >&2 && false`
}

export default function shellcode(): string {
  const dev_cmd = findDevCommand()
  const dependencyFilesList = DEPENDENCY_FILES.join(' ')

  // Evaluate config values once to avoid undefined issues in shell script
  const showShellMessages = config.showShellMessages ? 'true' : 'false'
  const shellActivationMessageTemplate = config.shellActivationMessage || 'Environment activated for {path}'
  const shellDeactivationMessage = config.shellDeactivationMessage || 'dev environment deactivated'

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

    # Generate readable project hash for better user experience
    local project_hash=""
    local project_name=$(basename "$PWD")
    local clean_project_name=$(echo "$project_name" | sed 's/[^a-zA-Z0-9._-]/-/g' | tr '[:upper:]' '[:lower:]')

    # Create a simple hash using Bun's hash function for consistency
    # This ensures perfect consistency between shell and TypeScript hash generation
    local hash_input="$PWD"
    local short_hash=""

    # Try to use Bun's hash function for consistency
    if command -v bun >/dev/null 2>&1; then
      short_hash=$(echo -n "$hash_input" | bun -e "
const input = await Bun.stdin.text();
const hash = Bun.hash(input);
console.log(hash.toString(16).padStart(16, '0').slice(0, 8));
" 2>/dev/null)
    fi

    # Fallback: try to find bun in common locations if not in PATH
    if [ -z "$short_hash" ]; then
      local bun_paths=(
        "$HOME/.bun/bin/bun"
        "/usr/local/bin/bun"
        "/opt/homebrew/bin/bun"
        "$HOME/.local/bin/bun"
      )

      for bun_path in "\${bun_paths[@]}"; do
        if [ -x "$bun_path" ]; then
          short_hash=$(echo -n "$hash_input" | "$bun_path" -e "
const input = await Bun.stdin.text();
const hash = Bun.hash(input);
console.log(hash.toString(16).padStart(16, '0').slice(0, 8));
" 2>/dev/null)
          if [ -n "$short_hash" ]; then
            break
          fi
        fi
      done
    fi

    # Final fallback: use base64 with better collision avoidance if Bun is not available
    if [ -z "$short_hash" ]; then
      local full_hash=$(echo -n "$hash_input" | base64 2>/dev/null | tr -d '\\n' | tr '/+=' '___')
      if [ -n "$full_hash" ]; then
        # Take characters from the middle to avoid suffix collisions
        local hash_len=\${#full_hash}
        local start_pos=\$((hash_len / 3))
        short_hash=$(echo "$full_hash" | cut -c\$((start_pos + 1))-\$((start_pos + 8)))
      fi
    fi

    if [ -n "$short_hash" ] && [ -n "$clean_project_name" ]; then
      project_hash="\${clean_project_name}_\${short_hash}"
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

    # If packages are already installed, check if they match current dependencies
    if [ -n "$env_cache_dir" ] && [ -d "$env_cache_dir" ]; then
      # Check if there are actual binaries installed, not just empty directories
      local has_binaries=false
      if [ -d "$env_cache_dir/bin" ] && [ "$(ls -A "$env_cache_dir/bin" 2>/dev/null)" ]; then
        has_binaries=true
      elif [ -d "$env_cache_dir/sbin" ] && [ "$(ls -A "$env_cache_dir/sbin" 2>/dev/null)" ]; then
        has_binaries=true
      fi

      # Check if cached environment matches current dependencies
      local deps_match=true
      if [ "$has_binaries" = true ] && [ -f "$deps_file" ]; then
        # Create a simple hash of the dependency file content for comparison
        local current_deps_hash=""
        if command -v bun >/dev/null 2>&1; then
          current_deps_hash=$(cat "$deps_file" | bun -e "
const input = await Bun.stdin.text();
const hash = Bun.hash(input);
console.log(hash.toString(16).padStart(16, '0').slice(0, 8));
" 2>/dev/null)
        fi

        # Fallback hash method if bun is not available
        if [ -z "$current_deps_hash" ]; then
          current_deps_hash=$(cat "$deps_file" | base64 2>/dev/null | tr -d '\\n' | tr '/+=' '___' | cut -c1-8)
        fi

        # Check if we have a stored hash for this environment
        local stored_hash=""
        if [ -f "$env_cache_dir/.deps_hash" ]; then
          stored_hash=$(cat "$env_cache_dir/.deps_hash" 2>/dev/null)
        fi

        # If hashes don't match, we need to regenerate
        if [ "$current_deps_hash" != "$stored_hash" ]; then
          deps_match=false
          echo "🔄 Dependencies changed, updating environment..." >&2
        fi
      fi

      if [ "$has_binaries" = true ] && [ "$deps_match" = true ]; then
        # Fast path: packages already installed and match current dependencies
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
          # Try to run launchpad dev with proper error handling
          local launchpad_output=""
          local exit_code=0
          # Capture only stdout, let stderr (progress bars) pass through to user
          launchpad_output=$(eval "${dev_cmd} dev --shell \\"$PWD\\"") || exit_code=$?

          if [ $exit_code -eq 0 ] && [ -n "$launchpad_output" ]; then
            # If launchpad succeeds, extract just the shell script part using system sed
            local shell_script=""
            shell_script=$(echo "$launchpad_output" | /usr/bin/sed -n '/^[[:space:]]*#.*Project-specific environment/,$p' 2>/dev/null || echo "$launchpad_output" | sed -n '/^[[:space:]]*#.*Project-specific environment/,$p')
            if [ -n "$shell_script" ]; then
              eval "$shell_script"
            else
                        echo "⚠️  Launchpad succeeded but no shell script found" >&2
          echo "    Try running: launchpad dev:dump" >&2
            fi
          else
            # If launchpad fails, show generic error message
            local project_name=$(basename "$PWD")
            echo "⚠️  Cannot set up development environment for $project_name" >&2
            echo "💡 To fix this:" >&2
            echo "   • Install bun: curl -fsSL https://bun.sh/install | bash" >&2
            echo "   • Or compile launchpad globally: bun run compile" >&2
            echo "   • Or run manually: launchpad dev" >&2
          fi
        else
          # For other dev commands, try with basic error handling
          local dev_output=""
          local dev_exit_code=0
          dev_output=$(eval "${dev_cmd} dump" 2>&1) || dev_exit_code=$?

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
  # Use a here-document to properly capture the cwd variable
  eval "$(cat <<EOF
_pkgx_dev_try_bye() {
  case "\\$PWD" in
    "$cwd"|"$cwd/"*)
      return 1
      ;;
    *)
      if [ "\\$1" != "silent" ]; then
        if [ "${showShellMessages}" = "true" ]; then
          echo -e "\\\\033[31m${shellDeactivationMessage}\\\\033[0m" >&2
        fi
      fi
      if [ -n "\\$_LAUNCHPAD_ORIGINAL_PATH" ]; then
        export PATH="\\$_LAUNCHPAD_ORIGINAL_PATH"
        unset _LAUNCHPAD_ORIGINAL_PATH
      fi
      unset -f _pkgx_dev_try_bye
      ;;
  esac
}
EOF
)"

  # Show activation message if enabled
  if [ "${showShellMessages}" = "true" ]; then
    # Replace {path} placeholder with actual path using sed with | delimiter
    # Use basename for cleaner display and add color coding
    local project_name=$(basename "$cwd")
    local message="${shellActivationMessageTemplate}"
    message=$(echo "$message" | sed "s|{path}|$project_name|g")
    printf "\\033[32m%s\\033[0m\\n" "$message" >&2
  fi
}

# Function for better error messaging when launchpad fails
_launchpad_show_help() {
  local project_name=$(basename "$PWD")
  echo "⚠️  Cannot set up development environment for $project_name" >&2
  echo "💡 To fix this:" >&2
  echo "   • Install bun: curl -fsSL https://bun.sh/install | bash" >&2
  echo "   • Or compile launchpad globally: bun run compile" >&2
  echo "   • Or run manually: launchpad dev" >&2
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
      eval "${dev_cmd} \\"$@\\""
    elif ! type -f _pkgx_dev_try_bye >/dev/null 2>&1; then
      if [[ "${dev_cmd}" == *"launchpad"* ]]; then
        # Try to run launchpad dev with proper error handling
        local launchpad_output=""
        local exit_code=0
        # Capture only stdout, let stderr (progress bars) pass through to user
        launchpad_output=$(eval "${dev_cmd} dev --shell \\"$PWD\\"") || exit_code=$?

        if [ $exit_code -eq 0 ] && [ -n "$launchpad_output" ]; then
          # If launchpad succeeds, extract just the shell script part using system sed
          local shell_script=""
          shell_script=$(echo "$launchpad_output" | /usr/bin/sed -n '/^[[:space:]]*#.*Project-specific environment/,$p' 2>/dev/null || echo "$launchpad_output" | sed -n '/^[[:space:]]*#.*Project-specific environment/,$p')
          if [ -n "$shell_script" ]; then
            eval "$shell_script"
          else
            echo "⚠️  Launchpad succeeded but no shell script found" >&2
            echo "    Try running: launchpad dev" >&2
          fi
        else
          # If launchpad fails, show generic error message
          local project_name=$(basename "$PWD")
          echo "⚠️  Cannot set up development environment for $project_name" >&2
          echo "💡 To fix this:" >&2
          echo "   • Install bun: curl -fsSL https://bun.sh/install | bash" >&2
          echo "   • Or compile launchpad globally: bun run compile" >&2
          echo "   • Or run manually: launchpad dev" >&2
        fi
      else
        # For other dev commands, try with basic error handling
        local dev_output=""
        local dev_exit_code=0
        dev_output=$(eval "${dev_cmd} dump" 2>&1) || dev_exit_code=$?

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
        eval "${dev_cmd} \\"$@\\"";;
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
  echo "launchpad: dev: warning: unsupported shell" >&2
fi
`.trim()
}

export function datadir(): string {
  const xdgDataHome = process.env.XDG_DATA_HOME?.trim()
  if (xdgDataHome) {
    return join(xdgDataHome, 'launchpad', 'dev')
  }

  return join(platform_data_home_default(), 'launchpad', 'dev')
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
