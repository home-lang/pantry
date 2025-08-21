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
  // Replace {path} with shell-evaluated basename
  const activationMessage = (config.shellActivationMessage || '✅ Environment activated for {path}')
    .replace('{path}', '$(basename "$project_dir")')
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

# Portable timeout helper: uses timeout, gtimeout (macOS), or no-timeout fallback
lp_timeout() {
    local duration="$1"; shift
    if command -v timeout >/dev/null 2>&1; then
        timeout "$duration" "$@"
    elif command -v gtimeout >/dev/null 2>&1; then
        gtimeout "$duration" "$@"
    else
        "$@"
    fi
}

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

# Set up directory change hooks for zsh and bash (do this first, before any processing guards)
    if [[ -n "$ZSH_VERSION" ]]; then
    # zsh hook
    # Ensure hook arrays exist
    if ! typeset -p chpwd_functions >/dev/null 2>&1; then
        typeset -ga chpwd_functions
    fi
    if ! typeset -p precmd_functions >/dev/null 2>&1; then
        typeset -ga precmd_functions
    fi
    
    __launchpad_chpwd() {
        # Prevent infinite recursion during hook execution
        if [[ "$__LAUNCHPAD_IN_HOOK" == "1" ]]; then
        return 0
        fi
        export __LAUNCHPAD_IN_HOOK=1

        # Note: trap cleanup removed due to zsh compatibility issues

        # Only run the environment switching logic, not the full shell integration
        __launchpad_switch_environment

        # Clean up hook flag explicitly
        unset __LAUNCHPAD_IN_HOOK 2>/dev/null || true
    }

    # Add the hook if not already added
    if [[ ! " \${chpwd_functions[*]} " =~ " __launchpad_chpwd " ]]; then
        chpwd_functions+=(__launchpad_chpwd)
    fi

    # Optionally enable a precmd-based refresh if explicitly requested
    if [[ "$LAUNCHPAD_USE_PRECMD" == "1" ]]; then
        __launchpad_precmd() {
            # Prevent infinite recursion during hook execution
            if [[ "$__LAUNCHPAD_IN_HOOK" == "1" ]]; then
                return 0
            fi
            export __LAUNCHPAD_IN_HOOK=1

            # Reuse the same environment switching/refresh logic
            __launchpad_switch_environment

            # Clean up hook flag explicitly
            unset __LAUNCHPAD_IN_HOOK 2>/dev/null || true
        }

        # Add the precmd hook if not already added
        if [[ ! " \${precmd_functions[*]} " =~ " __launchpad_precmd " ]]; then
            precmd_functions+=(__launchpad_precmd)
        fi
    fi
elif [[ -n "$BASH_VERSION" ]]; then
    # bash hook using PROMPT_COMMAND
    __launchpad_prompt_command() {
        # Prevent infinite recursion during hook execution
        if [[ "$__LAUNCHPAD_IN_HOOK" == "1" ]]; then
            return 0
        fi
        export __LAUNCHPAD_IN_HOOK=1

        # Note: trap cleanup removed due to zsh compatibility issues

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

    if [[ "$verbose_mode" == "true" && "$__lp_should_verbose_print" == "1" ]]; then
        printf "⏱️  [0ms] Shell integration started for PWD=%s\\n" "$PWD" >&2
    fi

    # Step 1: Find project directory using our fast binary (with portable timeout)
    local project_dir=""
    if lp_timeout 1s ${launchpadBinary} dev:find-project-root "$PWD" >/dev/null 2>&1; then
        project_dir=$(LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 lp_timeout 1s ${launchpadBinary} dev:find-project-root "$PWD" 2>/dev/null || echo "")
    fi

    # Verbose: show project detection result
    if [[ "$verbose_mode" == "true" && "$__lp_should_verbose_print" == "1" ]]; then
        if [[ -n "$project_dir" ]]; then
            printf "📁 Project detected: %s\n" "$project_dir" >&2
        else
            printf "📁 No project detected (global mode)\n" >&2
        fi
    fi

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

        # Show refresh message if verbose
        if [[ "$verbose_mode" == "true" ]]; then
            printf "🔄 Shell environment refreshed for newly installed tools\n" >&2
        fi
    fi

    # If no project found, check if we need to deactivate current project
    if [[ -z "$project_dir" ]]; then
        # If we were in a project but now we're not, deactivate it
        if [[ -n "$LAUNCHPAD_CURRENT_PROJECT" && -n "$LAUNCHPAD_ENV_BIN_PATH" ]]; then
            # Remove project-specific paths from PATH
            export PATH=$(echo "$PATH" | sed "s|$LAUNCHPAD_ENV_BIN_PATH:||g" | sed "s|:$LAUNCHPAD_ENV_BIN_PATH||g" | sed "s|^$LAUNCHPAD_ENV_BIN_PATH$||g")

            # Show deactivation message if enabled (only once per deactivation)
            if [[ "${showMessages}" == "true" && -n "$__LAUNCHPAD_LAST_ACTIVATION_KEY" ]]; then
                printf "${deactivationMessage}\\n" >&2
            fi

            # Verbose: deactivated environment
            if [[ "$verbose_mode" == "true" && "$__lp_should_verbose_print" == "1" ]]; then
                printf "⚪ Deactivated environment\n" >&2
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
        local md5hash=$(printf "%s" "$project_dir" | LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 lp_timeout 2s ${launchpadBinary} dev:md5 /dev/stdin 2>/dev/null || echo "00000000")
        local project_hash="\${project_basename}_$(echo "$md5hash" | cut -c1-8)"

        # Check for dependency file to add dependency hash
        local dep_file=""
        for name in "dependencies.yaml" "deps.yaml" "pkgx.yaml" "package.json"; do
            if [[ -f "$project_dir/$name" ]]; then
                dep_file="$project_dir/$name"
                break
            fi
        done

        local env_dir="$HOME/.local/share/launchpad/envs/$project_hash"
        if [[ -n "$dep_file" ]]; then
            local dep_short=$(LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 lp_timeout 2s ${launchpadBinary} dev:md5 "$dep_file" 2>/dev/null | cut -c1-8 || echo "")
        if [[ -n "$dep_short" ]]; then
            env_dir="\${env_dir}-d\${dep_short}"
        fi
        fi

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

        # If environment exists, activate it
        if [[ -d "$env_dir/bin" ]]; then
            export LAUNCHPAD_CURRENT_PROJECT="$project_dir"
                    export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"
            export PATH="$env_dir/bin:$PATH"

            # Show activation message if enabled (only when env changes)
            if [[ "${showMessages}" == "true" ]]; then
                if [[ "$__LAUNCHPAD_LAST_ACTIVATION_KEY" != "$env_dir" ]]; then
                    printf "${activationMessage}\\n" >&2
                fi
            fi
            export __LAUNCHPAD_LAST_ACTIVATION_KEY="$env_dir"

            # Verbose: show activated env path
            if [[ "$verbose_mode" == "true" && "$__lp_should_verbose_print" == "1" ]]; then
                printf "✅ Activated environment: %s\n" "$env_dir" >&2
            fi
        else
            # Install dependencies synchronously but with timeout to avoid hanging
            # Use LAUNCHPAD_SHELL_INTEGRATION=1 to enable proper progress display
            if LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 LAUNCHPAD_SHELL_INTEGRATION=1 lp_timeout 30s ${launchpadBinary} install "$project_dir"; then
                if [[ "$verbose_mode" == "true" ]]; then
                    printf "📦 Installed project dependencies (on-demand)\n" >&2
                fi
                # If install succeeded, try to activate the environment
                if [[ -d "$env_dir/bin" ]]; then
                    export LAUNCHPAD_CURRENT_PROJECT="$project_dir"
                    export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"
                    export PATH="$env_dir/bin:$PATH"

                    # Show activation message if enabled
                    if [[ "${showMessages}" == "true" ]]; then
                        printf "${activationMessage}\\n" >&2
                    fi

                    # Verbose: show activated env path after install
                    if [[ "$verbose_mode" == "true" && "$__lp_should_verbose_print" == "1" ]]; then
                        printf "✅ Activated environment after install: %s\n" "$env_dir" >&2
                    fi
                fi
            fi
        fi
    fi

    # Show completion time if verbose
    if [[ "$verbose_mode" == "true" && "$__lp_should_verbose_print" == "1" ]]; then
        local end_time=$(lp_now_ms)
        # Only print if both are integers
        if [[ "$start_time" =~ ^[0-9]+$ && "$end_time" =~ ^[0-9]+$ ]]; then
            local elapsed=$(( end_time - start_time ))
            if [[ "$elapsed" -ge 0 ]]; then
                printf "⏱️  [%sms] Shell integration completed\n" "$elapsed" >&2
            fi
        fi
    fi
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

# Clean up processing flag before exit
unset __LAUNCHPAD_PROCESSING 2>/dev/null || true

return 0 2>/dev/null || exit 0`
}

export function datadir(): string {
  return platform_data_home_default()
}

function platform_data_home_default(): string {
  return join(process.env.HOME || '~', '.local', 'share', 'launchpad')
}
