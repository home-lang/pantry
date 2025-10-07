import { homedir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { config } from '../config'

// Helper function to find the correct launchpad binary
function getLaunchpadBinary(): string {
  // Always use just 'launchpad' to allow local shims to work
  // The shell will find the appropriate binary in PATH (including ./launchpad)
  return 'launchpad'
}

export function shellcode(_testMode: boolean = false): string {
  // Use the same launchpad binary that's currently running
  const launchpadBinary = getLaunchpadBinary()

  // Use config-backed shell message configuration with {path} substitution
  const showMessages = config.showShellMessages ? 'true' : 'false'
  // Replace {path} with shell-evaluated basename (italic)
  const activationMessage = (config.shellActivationMessage || '✅ Environment activated for {path}')
    .replace('{path}', '\\x1B[3m$(basename "$project_dir")\\x1B[0m')
    .replace(/\n$/, '')
  const deactivationMessage = config.shellDeactivationMessage || 'Environment deactivated'

  // Verbosity: default to verbose for shell integration unless explicitly disabled
  // Priority: LAUNCHPAD_VERBOSE (runtime) > LAUNCHPAD_SHELL_VERBOSE (env) > config.verbose
  const verboseDefault = (typeof process !== 'undefined' && process.env?.LAUNCHPAD_SHELL_VERBOSE !== 'false')
    ? true
    : !!config.verbose

  return `
# MINIMAL LAUNCHPAD SHELL INTEGRATION - DEBUGGING VERSION
# Exit early if shell integration is disabled or explicit test mode
if [[ "$LAUNCHPAD_DISABLE_SHELL_INTEGRATION" == "1" || "$LAUNCHPAD_TEST_MODE" == "1" ]]; then
    return 0 2>/dev/null || exit 0
fi

# Skip shell integration during initial shell startup to avoid interfering with prompt initialization
# This prevents conflicts with starship and other prompt systems during .zshrc loading
if [[ "$LAUNCHPAD_SKIP_INITIAL_INTEGRATION" == "1" ]]; then
    return 0 2>/dev/null || exit 0
fi

# PATH helper: append a directory if not already present
__lp_append_path() {
    local dir="$1"
    if [[ -n "$dir" && -d "$dir" ]]; then
        case ":$PATH:" in
            *":$dir:"*) : ;;
            *) PATH="$PATH:$dir"; export PATH ;;
        esac
    fi
}

# Ensure Launchpad global bin is on PATH (with lower priority than system tools)
__lp_append_path "$HOME/.local/share/launchpad/global/bin"

# Portable current time in milliseconds
lp_now_ms() {
    if [[ -n "$ZSH_VERSION" && -n "$EPOCHREALTIME" ]]; then
        # EPOCHREALTIME is like: seconds.microseconds
        local sec="\${EPOCHREALTIME%.*}"
        local usec="\${EPOCHREALTIME#*.}"
        # Zero-pad/truncate to 3 digits for milliseconds
        local msec=$(( 10#\${usec:0:3} ))
        printf '%d%03d\n' "$sec" "$msec"
    elif command -v python3 >/dev/null 2>&1; then
        python3 - <<'PY'
import time
print(int(time.time() * 1000))
PY
    else
        # Fallback: seconds * 1000 (approx)
        local s=$(date +%s 2>/dev/null || echo 0)
        printf '%d\n' $(( s * 1000 ))
    fi
}

# Hook functions will be defined and registered after initial processing

# Cache helper functions
__lp_file_mtime_cached() {
    local f="$1"
    if [[ -z "$f" || ! -e "$f" ]]; then echo 0; return; fi
    if stat -f %m "$f" >/dev/null 2>&1; then
        stat -f %m "$f"
    elif stat -c %Y "$f" >/dev/null 2>&1; then
        stat -c %Y "$f"
    else
        echo 0
    fi
}

__lp_read_cache() {
    local cache_file="$HOME/.cache/launchpad/shell_cache/env_cache"
    local lookup_dir="$1"

    if [[ ! -f "$cache_file" ]]; then
        return 1
    fi

    # Read cache line by line and find matching project directory
    while IFS='|' read -r proj_dir dep_file dep_mtime env_dir; do
        if [[ "$proj_dir" == "$lookup_dir" ]]; then
            # Verify dependency file hasn't changed
            if [[ -n "$dep_file" && -f "$dep_file" ]]; then
                local current_mtime=$(__lp_file_mtime_cached "$dep_file")
                if [[ "$current_mtime" == "$dep_mtime" ]]; then
                    echo "$env_dir|$dep_file"
                    return 0
                fi
            elif [[ -z "$dep_file" ]]; then
                # No dependency file case
                echo "$env_dir|"
                return 0
            fi
        fi
    done < "$cache_file"

    return 1
}

__lp_write_cache() {
    local cache_dir="$HOME/.cache/launchpad/shell_cache"
    local cache_file="$cache_dir/env_cache"
    local proj_dir="$1"
    local dep_file="$2"
    local env_dir="$3"

    mkdir -p "$cache_dir" 2>/dev/null || true

    local dep_mtime=0
    if [[ -n "$dep_file" && -f "$dep_file" ]]; then
        dep_mtime=$(__lp_file_mtime_cached "$dep_file")
    fi

    # Create temp file for atomic write
    local temp_file="$cache_file.tmp.$$"

    # Copy existing entries except the one we're updating
    if [[ -f "$cache_file" ]]; then
        grep -v "^$proj_dir|" "$cache_file" > "$temp_file" 2>/dev/null || true
    fi

    # Add new entry
    echo "$proj_dir|$dep_file|$dep_mtime|$env_dir" >> "$temp_file"

    # Atomic replace
    mv "$temp_file" "$cache_file" 2>/dev/null || rm -f "$temp_file"
}

# Environment switching function (called by hooks)
__launchpad_switch_environment() {
    # SUPER FAST PATH: If PWD hasn't changed, return immediately (0 syscalls)
    if [[ "$__LAUNCHPAD_LAST_PWD" == "$PWD" ]]; then
        return 0
    fi
    export __LAUNCHPAD_LAST_PWD="$PWD"

    # Start timer for performance tracking (portable)
    local start_time=$(lp_now_ms)

    # Check if verbose mode is enabled
    local verbose_mode="${verboseDefault}"
    if [[ -n "$LAUNCHPAD_VERBOSE" ]]; then
        verbose_mode="$LAUNCHPAD_VERBOSE"
    fi

    # Dedupe key for verbose printing (avoid duplicate start/completion logs per PWD)
    local __lp_verbose_key="$PWD"
    local __lp_should_verbose_print="1"
    if [[ "$__LAUNCHPAD_LAST_VERBOSE_KEY" == "$__lp_verbose_key" ]]; then
        __lp_should_verbose_print="0"
    fi
    export __LAUNCHPAD_LAST_VERBOSE_KEY="$__lp_verbose_key"

    # Known dependency filenames (keep in sync with DEPENDENCY_FILE_NAMES in src/env.ts)
    local _dep_names=(
        # Launchpad-specific files (highest priority)
        "dependencies.yaml" "dependencies.yml" "deps.yaml" "deps.yml" "pkgx.yaml" "pkgx.yml" "launchpad.yaml" "launchpad.yml"
        # Node.js/JavaScript
        "package.json"
        # Python
        "pyproject.toml" "requirements.txt" "setup.py" "Pipfile" "Pipfile.lock"
        # Rust
        "Cargo.toml"
        # Go
        "go.mod" "go.sum"
        # Ruby
        "Gemfile"
        # Deno
        "deno.json" "deno.jsonc"
        # GitHub Actions
        "action.yml" "action.yaml"
        # Kubernetes/Docker
        "skaffold.yaml" "skaffold.yml"
        # Version control files
        ".nvmrc" ".node-version" ".ruby-version" ".python-version" ".terraform-version"
        # Package manager files
        "yarn.lock" "bun.lock" "bun.lockb" ".yarnrc"
    )

    # Step 1: Try cache first for instant project detection
    local project_dir=""
    local cached_env_dir=""
    local cached_dep_file=""

    # First, try to find project root by walking up from PWD
    local __dir="$PWD"
    while [[ "$__dir" != "/" && -z "$project_dir" ]]; do
        # Check cache for this directory
        local cache_result=$(__lp_read_cache "$__dir")
        if [[ $? -eq 0 && -n "$cache_result" ]]; then
            # Cache hit! Extract env_dir and dep_file
            cached_env_dir="\${cache_result%|*}"
            cached_dep_file="\${cache_result#*|}"
            project_dir="$__dir"
            break
        fi

        # Check if this directory has any dependency files
        for name in "\${_dep_names[@]}"; do
            if [[ -f "$__dir/$name" ]]; then
                project_dir="$__dir"
                break 2
            fi
        done

        __dir="$(dirname "$__dir")"
    done

    # If cache miss and no project found yet, use fast binary detection
    if [[ -z "$project_dir" ]]; then
        if ${launchpadBinary} dev:find-project-root "$PWD" >/dev/null 2>&1; then
            project_dir=$(LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 ${launchpadBinary} dev:find-project-root "$PWD" 2>/dev/null || echo "")
        fi
    fi

    # Removed verbose project detection message

    # Step 2: Prepare global paths but don't add them yet
    # We'll add them after project-specific paths to ensure proper precedence
    local local_bin="$HOME/.local/bin"
    local global_bin="$HOME/.local/share/launchpad/global/bin"

    # Step 2.0: Detect global ready markers (persistent) to skip redundant global setup
    local ready_cache_marker="$HOME/.cache/launchpad/global_ready"
    local ready_global_marker="$HOME/.local/share/launchpad/global/.ready"
    if [[ -f "$ready_cache_marker" || -f "$ready_global_marker" ]]; then
        # Removed verbose reuse message
        # No-op: presence of the marker simply informs reuse; installs remain on-demand per env needs

        # TTL-based background update check to keep globals fresh without blocking the prompt
        # Uses LAUNCHPAD_GLOBAL_UPDATE_TTL_HOURS (default 24). Backoff 60 minutes between checks.
        __lp_file_mtime() {
            local f="$1"
            if [[ -z "$f" || ! -e "$f" ]]; then echo 0; return; fi
            if stat -f %m "$f" >/dev/null 2>&1; then
                stat -f %m "$f"
            elif stat -c %Y "$f" >/dev/null 2>&1; then
                stat -c %Y "$f"
            else
                echo 0
            fi
        }

        __lp_bg_update_check() {
            local cache_dir="$HOME/.cache/launchpad"
            local shell_cache_dir="$cache_dir/shell_cache"
            local backoff_marker="$shell_cache_dir/update_check_backoff"
            local ready_cache="$cache_dir/global_ready"
            local ready_global="$HOME/.local/share/launchpad/global/.ready"

            mkdir -p "$shell_cache_dir" >/dev/null 2>&1 || true

            local now_s=$(date +%s 2>/dev/null || echo 0)
            local mtime_a=$(__lp_file_mtime "$ready_cache")
            local mtime_b=$(__lp_file_mtime "$ready_global")
            local newest=$(( mtime_a > mtime_b ? mtime_a : mtime_b ))

            # TTL hours env var, default 24
            local ttl_hours="\${LAUNCHPAD_GLOBAL_UPDATE_TTL_HOURS:-24}"
            # Convert to seconds cautiously
            if ! [[ "$ttl_hours" =~ ^[0-9]+$ ]]; then ttl_hours=24; fi
            local ttl_s=$(( ttl_hours * 3600 ))

            # Backoff: 60 minutes
            local backoff_mtime=$(__lp_file_mtime "$backoff_marker")
            local backoff_s=$(( 60 * 60 ))
            if (( now_s - backoff_mtime < backoff_s )); then
                return 0
            fi

            if (( newest == 0 || now_s - newest > ttl_s )); then
                : > "$backoff_marker" 2>/dev/null || true
                # Run update check in background (non-blocking)
                (LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 LAUNCHPAD_SHELL_INTEGRATION=1 ${launchpadBinary} dev:check-updates >/dev/null 2>&1 &) >/dev/null 2>&1
            fi
        }

        __lp_bg_update_check
    fi

    # Step 2.1: Check for global refresh marker and initialize newly available tools
    local refresh_marker="$HOME/.cache/launchpad/shell_cache/global_refresh_needed"
    if [[ -f "$refresh_marker" ]]; then
        # Remove the marker file
        rm -f "$refresh_marker" 2>/dev/null || true

        # Refresh command hash table to pick up new binaries
        hash -r 2>/dev/null || true

        # Rehash for zsh to pick up new commands
        if [[ -n "$ZSH_VERSION" ]]; then
            rehash 2>/dev/null || true
        fi

        # Initialize starship when it just became available (idempotent)
        if command -v starship >/dev/null 2>&1 && [[ -z "$STARSHIP_SHELL" ]]; then
            if [[ -n "$ZSH_VERSION" ]]; then
                eval "$(starship init zsh)" >/dev/null 2>&1 || true
            elif [[ -n "$BASH_VERSION" ]]; then
                eval "$(starship init bash)" >/dev/null 2>&1 || true
            fi
            if [[ "$verbose_mode" == "true" ]]; then
                printf "🌟 Initialized Starship prompt after install\n" >&2
            fi
        fi

        # Removed verbose refresh message
    fi

    # Step 2.2: If a global update notice is present, display it once and remove
    local update_notice="$HOME/.cache/launchpad/shell_cache/global_update_notice"
    if [[ -f "$update_notice" ]]; then
        # Print to stderr to avoid interfering with commands
        cat "$update_notice" >&2 || true
        rm -f "$update_notice" 2>/dev/null || true
    fi

    # If no project found, check if we need to deactivate current project
    if [[ -z "$project_dir" ]]; then
        # If we were in a project but now we're not, deactivate it
        if [[ -n "$__LAUNCHPAD_LAST_ACTIVATION_KEY" ]]; then
            # Remove project-specific paths from PATH if they exist
            if [[ -n "$LAUNCHPAD_ENV_BIN_PATH" ]]; then
                export PATH=$(echo "$PATH" | /usr/bin/sed "s|$LAUNCHPAD_ENV_BIN_PATH:||g" | /usr/bin/sed "s|:$LAUNCHPAD_ENV_BIN_PATH||g" | /usr/bin/sed "s|^$LAUNCHPAD_ENV_BIN_PATH$||g")

                # Also remove bun global bin directory (derive from env path)
                local old_env_dir=$(dirname "$LAUNCHPAD_ENV_BIN_PATH")
                if [[ -n "$old_env_dir" ]]; then
                    export PATH=$(echo "$PATH" | /usr/bin/sed "s|$old_env_dir/.bun/bin:||g" | /usr/bin/sed "s|:$old_env_dir/.bun/bin||g" | /usr/bin/sed "s|^$old_env_dir/.bun/bin$||g")
                fi
            fi

            # Show deactivation message if enabled
            if [[ "${showMessages}" == "true" ]]; then
                printf "${deactivationMessage}\\n" >&2
            fi

            unset LAUNCHPAD_CURRENT_PROJECT
            unset LAUNCHPAD_ENV_BIN_PATH
            unset LAUNCHPAD_ENV_DIR
            unset __LAUNCHPAD_LAST_ACTIVATION_KEY
            unset BUN_INSTALL
        fi

        # Ensure global paths are still available when not in a project
        # Add ~/.local/bin to PATH if not already there
        if [[ -d "$local_bin" && ":$PATH:" != *":$local_bin:"* ]]; then
            export PATH="$PATH:$local_bin"
        fi

        # Add launchpad global bin to PATH if not already there
        if [[ -d "$global_bin" && ":$PATH:" != *":$global_bin:"* ]]; then
            export PATH="$PATH:$global_bin"
        fi

        return 0
    fi

    # Step 3: For projects, activate environment (using proper MD5 hashing)
    if [[ -n "$project_dir" ]]; then
        # FAST PATH: Check if we're in the same project with cached environment
        if [[ "$LAUNCHPAD_CURRENT_PROJECT" == "$project_dir" && -n "$LAUNCHPAD_ENV_DIR" ]]; then
            # We're already in this project and environment is set - skip expensive operations
            return 0
        fi

        local env_dir=""
        local dep_file=""

        # Use cached environment if available (avoids MD5 computation)
        if [[ -n "$cached_env_dir" ]]; then
            env_dir="$cached_env_dir"
            dep_file="$cached_dep_file"
        else
            # Cache miss - compute environment directory
            local project_basename=$(basename "$project_dir")
            # Use proper MD5 hash to match existing environments
            local md5hash=$(printf "%s" "$project_dir" | LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 ${launchpadBinary} dev:md5 /dev/stdin 2>/dev/null || echo "00000000")
            local project_hash="\${project_basename}_$(echo "$md5hash" | cut -c1-8)"

            # Check for dependency file to add dependency hash
            # IMPORTANT: keep this list in sync with DEPENDENCY_FILE_NAMES in src/env.ts
            for name in "\${_dep_names[@]}"; do
                if [[ -f "$project_dir/$name" ]]; then
                    dep_file="$project_dir/$name"
                    break
                fi
            done

            env_dir="$HOME/.local/share/launchpad/envs/$project_hash"
            local dep_short=""
            if [[ -n "$dep_file" ]]; then
                dep_short=$(LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 ${launchpadBinary} dev:md5 "$dep_file" 2>/dev/null | cut -c1-8 || echo "")
                if [[ -n "$dep_short" ]]; then
                    env_dir="\${env_dir}-d\${dep_short}"
                fi
            fi

            # Write to cache for next time
            __lp_write_cache "$project_dir" "$dep_file" "$env_dir"
        fi

        # Removed verbose dependency file info message

        # Check if we're switching projects
        if [[ -n "$LAUNCHPAD_CURRENT_PROJECT" && "$LAUNCHPAD_CURRENT_PROJECT" != "$project_dir" ]]; then
            # Remove old project paths from PATH
            if [[ -n "$LAUNCHPAD_ENV_BIN_PATH" ]]; then
                export PATH=$(echo "$PATH" | /usr/bin/sed "s|$LAUNCHPAD_ENV_BIN_PATH:||g" | /usr/bin/sed "s|:$LAUNCHPAD_ENV_BIN_PATH||g" | /usr/bin/sed "s|^$LAUNCHPAD_ENV_BIN_PATH$||g")

                # Also remove old bun global bin directory (derive from old env path)
                local old_env_dir=$(dirname "$LAUNCHPAD_ENV_BIN_PATH")
                if [[ -n "$old_env_dir" ]]; then
                    export PATH=$(echo "$PATH" | /usr/bin/sed "s|$old_env_dir/.bun/bin:||g" | /usr/bin/sed "s|:$old_env_dir/.bun/bin||g" | /usr/bin/sed "s|^$old_env_dir/.bun/bin$||g")
                fi

                # Show deactivation message for old project if enabled
                if [[ "${showMessages}" == "true" ]]; then
                    printf "${deactivationMessage}\\n" >&2
                fi

                # Unset old BUN_INSTALL when switching projects
                unset BUN_INSTALL
            fi
        fi

        # Show activation message if enabled (when project changes)
        if [[ "${showMessages}" == "true" ]]; then
            if [[ "$__LAUNCHPAD_LAST_ACTIVATION_KEY" != "$project_dir" ]]; then
                printf "${activationMessage}\n" >&2
            fi
        fi
        export __LAUNCHPAD_LAST_ACTIVATION_KEY="$project_dir"

        # If environment exists, activate it
        if [[ -d "$env_dir/bin" ]]; then
            export LAUNCHPAD_CURRENT_PROJECT="$project_dir"
            export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"
            export LAUNCHPAD_ENV_DIR="$env_dir"

            # Remove project-specific path if it was already in PATH
            export PATH=$(echo "$PATH" | /usr/bin/sed "s|$env_dir/bin:||g" | /usr/bin/sed "s|:$env_dir/bin||g" | /usr/bin/sed "s|^$env_dir/bin$||g")

            # Add project-specific path first (highest priority)
            export PATH="$env_dir/bin:$PATH"

            # Set up Bun environment for this environment (if bun is present)
            # This ensures 'bun install -g' installs to the environment-specific directory
            if [[ -x "$env_dir/bin/bun" ]]; then
                export BUN_INSTALL="$env_dir/.bun"

                # Create .bun/bin directory if it doesn't exist
                mkdir -p "$env_dir/.bun/bin" 2>/dev/null || true

                # Add bun global bin directory to PATH (high priority for global installs)
                # Remove bun global bin path if it was already in PATH
                export PATH=$(echo "$PATH" | /usr/bin/sed "s|$env_dir/.bun/bin:||g" | /usr/bin/sed "s|:$env_dir/.bun/bin||g" | /usr/bin/sed "s|^$env_dir/.bun/bin$||g")
                # Add it with high priority (after project bin but before system paths)
                export PATH="$PATH:$env_dir/.bun/bin"
            fi

            # Now ensure global paths are available but with lower priority
            # Add ~/.local/bin to PATH if not already there (after project paths)
            if [[ -d "$local_bin" && ":$PATH:" != *":$local_bin:"* ]]; then
                export PATH="$PATH:$local_bin"
            fi

            # Add launchpad global bin to PATH if not already there (after project and ~/.local/bin)
            if [[ -d "$global_bin" && ":$PATH:" != *":$global_bin:"* ]]; then
                export PATH="$PATH:$global_bin"
            fi

            # NOTE: We do NOT set DYLD_LIBRARY_PATH or DYLD_FALLBACK_LIBRARY_PATH globally
            # Setting these globally causes issues with system Python and other binaries due to macOS SIP
            # Instead, our binary wrapper scripts set these variables only for binaries that need them
            # This prevents dyld errors while still allowing our managed binaries to find their libraries
        else
            # Environment not ready - still ensure global paths are available
            # Add ~/.local/bin to PATH if not already there
            if [[ -d "$local_bin" && ":$PATH:" != *":$local_bin:"* ]]; then
                export PATH="$PATH:$local_bin"
            fi

            # Add launchpad global bin to PATH if not already there
            if [[ -d "$global_bin" && ":$PATH:" != *":$global_bin:"* ]]; then
                export PATH="$PATH:$global_bin"
            fi
        fi
    fi

    # Removed verbose shell integration completion message
}

# CRITICAL: Prevent infinite loops - if we're already processing, exit immediately
if [[ "$__LAUNCHPAD_PROCESSING" == "1" ]]; then
    return 0 2>/dev/null || exit 0
fi
export __LAUNCHPAD_PROCESSING=1

# Ensure we clean up the processing flag on exit (use a more robust approach)
trap 'unset __LAUNCHPAD_PROCESSING 2>/dev/null || true' EXIT

# Basic shell integration with aggressive safeguards
# Run the environment switching logic (which handles its own timing)
__launchpad_switch_environment

# Set up directory change hooks AFTER initial processing (but only if not already set up)
if [[ -n "$ZSH_VERSION" ]]; then
    # Define the hook function
    __launchpad_chpwd() {
        # Prevent infinite recursion during hook execution
        if [[ "$__LAUNCHPAD_IN_HOOK" == "1" ]]; then
            return 0
        fi
        export __LAUNCHPAD_IN_HOOK=1

        # Only run the environment switching logic, not the full shell integration
        __launchpad_switch_environment

        # Clean up hook flag explicitly
        unset __LAUNCHPAD_IN_HOOK 2>/dev/null || true
    }

    # Ensure hook arrays exist
    if ! typeset -p chpwd_functions >/dev/null 2>&1; then
        typeset -ga chpwd_functions
    fi
    # Add the hook if not already added
    if [[ ! " \${chpwd_functions[*]} " =~ " __launchpad_chpwd " ]]; then
        chpwd_functions+=(__launchpad_chpwd)
    fi
elif [[ -n "$BASH_VERSION" ]]; then
    # Define the hook function
    __launchpad_prompt_command() {
        # Prevent infinite recursion during hook execution
        if [[ "$__LAUNCHPAD_IN_HOOK" == "1" ]]; then
            return 0
        fi
        export __LAUNCHPAD_IN_HOOK=1

        # Only run the environment switching logic, not the full shell integration
        __launchpad_switch_environment

        # Clean up hook flag explicitly
        unset __LAUNCHPAD_IN_HOOK 2>/dev/null || true
    }

    # Add to PROMPT_COMMAND if not already there
    if [[ "$PROMPT_COMMAND" != *"__launchpad_prompt_command"* ]]; then
        PROMPT_COMMAND="__launchpad_prompt_command;\$PROMPT_COMMAND"
    fi
fi

# Clean up processing flag before exit
unset __LAUNCHPAD_PROCESSING 2>/dev/null || true

# Ensure we exit cleanly and don't hang the shell
return 0 2>/dev/null || exit 0`
}

export function datadir(): string {
  return platform_data_home_default()
}

function platform_data_home_default(): string {
  return join(homedir(), '.local', 'share', 'launchpad')
}
