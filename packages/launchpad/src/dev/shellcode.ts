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
# This is a minimal version to isolate the hanging issue

# Exit early if shell integration is disabled or explicit test mode
if [[ "$LAUNCHPAD_DISABLE_SHELL_INTEGRATION" == "1" || "$LAUNCHPAD_TEST_MODE" == "1" ]]; then
    return 0 2>/dev/null || exit 0
fi

# Skip shell integration during initial shell startup to avoid interfering with prompt initialization
# This prevents conflicts with starship and other prompt systems during .zshrc loading
if [[ "$LAUNCHPAD_SKIP_INITIAL_INTEGRATION" == "1" ]]; then
    return 0 2>/dev/null || exit 0
fi

# PATH helper: prepend a directory if not already present
__lp_prepend_path() {
    local dir="$1"
    if [[ -n "$dir" && -d "$dir" ]]; then
        case ":$PATH:" in
            *":$dir:"*) : ;;
            *) PATH="$dir:$PATH"; export PATH ;;
        esac
    fi
}

# Ensure Launchpad global bin is on PATH early (for globally installed tools)
__lp_prepend_path "$HOME/.local/share/launchpad/global/bin"

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

# Environment switching function (called by hooks)
__launchpad_switch_environment() {
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

    # Removed verbose shell integration start message

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
        "yarn.lock" "bun.lockb" ".yarnrc"
    )

    # Step 1: Find project directory using our fast binary (no artificial timeout)
    local project_dir=""
    if ${launchpadBinary} dev:find-project-root "$PWD" >/dev/null 2>&1; then
        project_dir=$(LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 ${launchpadBinary} dev:find-project-root "$PWD" 2>/dev/null || echo "")
    fi

    # Fallback: If binary didn't detect a project, scan upwards for known dependency files
    if [[ -z "$project_dir" ]]; then
        local __dir="$PWD"
        while [[ "$__dir" != "/" ]]; do
            for name in "\${_dep_names[@]}"; do
                if [[ -f "$__dir/$name" ]]; then
                    project_dir="$__dir"
                    break
                fi
            done
            if [[ -n "$project_dir" ]]; then
                break
            fi
            __dir="$(dirname "$__dir")"
        done
    fi

    # Removed verbose project detection message

    # Step 2: Always ensure global paths are available (even in projects)
    # Use ~/.local/bin first, then launchpad global bin to ensure proper path priority
    local local_bin="$HOME/.local/bin"
    local global_bin="$HOME/.local/share/launchpad/global/bin"

    # Add ~/.local/bin to PATH if not already there
    if [[ -d "$local_bin" && ":$PATH:" != *":$local_bin:"* ]]; then
        export PATH="$local_bin:$PATH"
    fi

    # Add launchpad global bin to PATH if not already there
    if [[ -d "$global_bin" && ":$PATH:" != *":$global_bin:"* ]]; then
        export PATH="$global_bin:$PATH"
    fi

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
                LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 LAUNCHPAD_SHELL_INTEGRATION=1 ${launchpadBinary} dev:check-updates >/dev/null 2>&1 &
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
                export PATH=$(echo "$PATH" | sed "s|$LAUNCHPAD_ENV_BIN_PATH:||g" | sed "s|:$LAUNCHPAD_ENV_BIN_PATH||g" | sed "s|^$LAUNCHPAD_ENV_BIN_PATH$||g")
            fi

            # Show deactivation message if enabled
            if [[ "${showMessages}" == "true" ]]; then
                printf "${deactivationMessage}\\n" >&2
            fi

            unset LAUNCHPAD_CURRENT_PROJECT
            unset LAUNCHPAD_ENV_BIN_PATH
            unset __LAUNCHPAD_LAST_ACTIVATION_KEY
        fi
        return 0
    fi

    # Step 3: For projects, activate environment (using proper MD5 hashing)
    if [[ -n "$project_dir" ]]; then
        local project_basename=$(basename "$project_dir")
        # Use proper MD5 hash to match existing environments
        local md5hash=$(printf "%s" "$project_dir" | LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 ${launchpadBinary} dev:md5 /dev/stdin 2>/dev/null || echo "00000000")
        local project_hash="\${project_basename}_$(echo "$md5hash" | cut -c1-8)"

        # Check for dependency file to add dependency hash
        # IMPORTANT: keep this list in sync with DEPENDENCY_FILE_NAMES in src/env.ts
        local dep_file=""
        for name in "\${_dep_names[@]}"; do
            if [[ -f "$project_dir/$name" ]]; then
                dep_file="$project_dir/$name"
                break
            fi
        done

        local env_dir="$HOME/.local/share/launchpad/envs/$project_hash"
        local dep_short=""
        if [[ -n "$dep_file" ]]; then
            dep_short=$(LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 ${launchpadBinary} dev:md5 "$dep_file" 2>/dev/null | cut -c1-8 || echo "")
            if [[ -n "$dep_short" ]]; then
                env_dir="\${env_dir}-d\${dep_short}"
            fi
        fi

        # Removed verbose dependency file info message

        # Check if we're switching projects
        if [[ -n "$LAUNCHPAD_CURRENT_PROJECT" && "$LAUNCHPAD_CURRENT_PROJECT" != "$project_dir" ]]; then
            # Remove old project paths from PATH
            if [[ -n "$LAUNCHPAD_ENV_BIN_PATH" ]]; then
                export PATH=$(echo "$PATH" | sed "s|$LAUNCHPAD_ENV_BIN_PATH:||g" | sed "s|:$LAUNCHPAD_ENV_BIN_PATH||g" | sed "s|^$LAUNCHPAD_ENV_BIN_PATH$||g")

                # Show deactivation message for old project if enabled
                if [[ "${showMessages}" == "true" ]]; then
                    printf "${deactivationMessage}\\n" >&2
                fi
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
            export PATH="$env_dir/bin:$PATH"
            # Removed verbose activated environment path message
            # Ensure dynamic linker can find Launchpad-managed libraries (macOS/Linux)
            # Build a list of library directories from the active environment and global install
            __lp_add_unique_colon_path() {
                # $1=varname $2=value
                local __var_name="$1"; shift
                local __val="$1"; shift
                if [[ -z "$__val" ]]; then return 0; fi
                local __cur=""
                # Portable indirection via eval (works in bash and zsh)
                eval "__cur=\\$\${__var_name}"
                case ":$__cur:" in
                    *":$__val:"*) : ;; # already present
                    *)
                        if [[ -n "$__cur" ]]; then
                            eval "export \${__var_name}=\"$__val:\\$\${__var_name}\""
                        else
                            eval "export \${__var_name}=\"$__val\""
                        fi
                    ;;
                esac
            }

            # Collect candidate lib dirs
            local __lp_libs=()
            # Env-level libs
            if [[ -d "$env_dir/php.net" ]]; then
                while IFS= read -r d; do __lp_libs+=("$d/lib"); done < <(find "$env_dir/php.net" -maxdepth 2 -type d -name 'v*' 2>/dev/null)
            fi
            for dom in curl.se openssl.org zlib.net gnu.org/readline; do
                if [[ -d "$env_dir/$dom" ]]; then
                    while IFS= read -r d; do __lp_libs+=("$d/lib"); done < <(find "$env_dir/$dom" -maxdepth 2 -type d -name 'v*' 2>/dev/null)
                fi
            done
            # Global-level libs
            local __lp_global="$HOME/.local/share/launchpad/global"
            for dom in curl.se openssl.org zlib.net gnu.org/readline; do
                if [[ -d "$__lp_global/$dom" ]]; then
                    while IFS= read -r d; do __lp_libs+=("$d/lib"); done < <(find "$__lp_global/$dom" -maxdepth 2 -type d -name 'v*' 2>/dev/null)
                fi
            done

            # Export DYLD and LD paths (prepend Launchpad libs)
            for libdir in "\${__lp_libs[@]}"; do
                if [[ -d "$libdir" ]]; then
                    __lp_add_unique_colon_path DYLD_LIBRARY_PATH "$libdir"
                    __lp_add_unique_colon_path DYLD_FALLBACK_LIBRARY_PATH "$libdir"
                    __lp_add_unique_colon_path LD_LIBRARY_PATH "$libdir"
                fi
            done
        else
            # Environment not ready - user can run 'launchpad install <project>' manually when needed
            :
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
  return join(process.env.HOME || '~', '.local', 'share', 'launchpad')
}
