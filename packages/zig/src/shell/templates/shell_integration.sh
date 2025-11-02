# Pantry Shell Integration (Zig)
# Fast environment switching function (optimized for Zig backend)

__pantry_switch_environment() {
    [[ "$__PANTRY_DEBUG" == "1" ]] && echo "[PANTRY DEBUG] switch_environment called, PWD=$PWD" >&2

    # SUPER FAST PATH: PWD unchanged
    if [[ "$__PANTRY_LAST_PWD" == "$PWD" ]]; then
        [[ "$__PANTRY_DEBUG" == "1" ]] && echo "[PANTRY DEBUG] PWD unchanged, returning" >&2
        return 0
    fi
    export __PANTRY_LAST_PWD="$PWD"

    # ULTRA FAST PATH: Still in project subdirectory
    if [[ -n "$PANTRY_CURRENT_PROJECT" && "$PWD" == "$PANTRY_CURRENT_PROJECT"* ]]; then
        [[ "$__PANTRY_DEBUG" == "1" ]] && echo "[PANTRY DEBUG] Still in project, returning" >&2
        return 0
    fi

    # INSTANT DEACTIVATION PATH: Left project
    if [[ -n "$PANTRY_CURRENT_PROJECT" && "$PWD" != "$PANTRY_CURRENT_PROJECT"* ]]; then
        [[ "$__PANTRY_DEBUG" == "1" ]] && echo "[PANTRY DEBUG] Deactivating project" >&2
        # Remove project paths from PATH
        if [[ -n "$PANTRY_ENV_BIN_PATH" ]]; then
            PATH=$(echo "$PATH" | sed "s|$PANTRY_ENV_BIN_PATH:||g; s|:$PANTRY_ENV_BIN_PATH||g; s|^$PANTRY_ENV_BIN_PATH$||g")
            export PATH
        fi

        # Remove pantry_modules/.bin from PATH if it exists
        if [[ -n "$PANTRY_MODULES_BIN_PATH" ]]; then
            PATH=$(echo "$PATH" | sed "s|$PANTRY_MODULES_BIN_PATH:||g; s|:$PANTRY_MODULES_BIN_PATH||g; s|^$PANTRY_MODULES_BIN_PATH$||g")
            export PATH
        fi

        # Clear environment variables
        unset PANTRY_CURRENT_PROJECT PANTRY_ENV_BIN_PATH PANTRY_ENV_DIR PANTRY_MODULES_BIN_PATH __PANTRY_LAST_ACTIVATION_KEY

        # Early return - don't check for new projects immediately after deactivation
        # This makes deactivation instant
        return 0
    fi

    # CACHE LOOKUP: Use Zig binary for fast cache lookup
    # This replaces all the shell-based caching logic with a single binary call
    [[ "$__PANTRY_DEBUG" == "1" ]] && echo "[PANTRY DEBUG] Running shell:lookup for $PWD" >&2
    local env_info
    env_info=$(pantry shell:lookup "$PWD" 2>/dev/null)

    if [[ $? -eq 0 && -n "$env_info" ]]; then
        [[ "$__PANTRY_DEBUG" == "1" ]] && echo "[PANTRY DEBUG] Cache hit: $env_info" >&2
        # Cache hit! Parse env_dir|project_dir
        local env_dir="${env_info%|*}"
        local project_dir="${env_info#*|}"

        # INSTANT ACTIVATION
        if [[ -d "$env_dir/bin" ]]; then
            [[ "$__PANTRY_SHOW_MESSAGES" == "true" && "$__PANTRY_LAST_ACTIVATION_KEY" != "$project_dir" ]] && \
                printf "\r\033[K%s\n" "$__PANTRY_ACTIVATION_MSG" >&2

            export __PANTRY_LAST_ACTIVATION_KEY="$project_dir"
            export PANTRY_CURRENT_PROJECT="$project_dir"
            export PANTRY_ENV_BIN_PATH="$env_dir/bin"
            export PANTRY_ENV_DIR="$env_dir"

            # Update PATH (remove old, add new)
            PATH=$(echo "$PATH" | sed "s|$env_dir/bin:||g; s|:$env_dir/bin||g; s|^$env_dir/bin$||g")
            PATH="$env_dir/bin:$PATH"
            export PATH

            return 0
        fi
    fi

    # CACHE MISS: Use Zig binary for project detection and installation
    # Run installation (stderr shows to user, stdout is eval'd for PATH)
    [[ "$__PANTRY_DEBUG" == "1" ]] && echo "[PANTRY DEBUG] Running shell:activate for $PWD" >&2
    local install_output
    install_output=$(pantry shell:activate "$PWD")

    if [[ $? -eq 0 && -n "$install_output" ]]; then
        [[ "$__PANTRY_DEBUG" == "1" ]] && echo "[PANTRY DEBUG] Eval'ing install output" >&2
        eval "$install_output" 2>/dev/null || true
    fi
}


# Hook registration for Zsh
if [[ -n "$ZSH_VERSION" ]]; then
    __pantry_chpwd() {
        [[ "$__PANTRY_IN_HOOK" == "1" ]] && return 0
        export __PANTRY_IN_HOOK=1
        __pantry_switch_environment
        unset __PANTRY_IN_HOOK
    }

    typeset -ga chpwd_functions 2>/dev/null || true
    [[ ! " ${chpwd_functions[*]} " =~ " __pantry_chpwd " ]] && chpwd_functions+=(__pantry_chpwd)

# Hook registration for Bash
elif [[ -n "$BASH_VERSION" ]]; then
    __pantry_prompt_command() {
        [[ "$__PANTRY_IN_HOOK" == "1" ]] && return 0
        export __PANTRY_IN_HOOK=1
        __pantry_switch_environment
        unset __PANTRY_IN_HOOK
    }

    [[ "$PROMPT_COMMAND" != *"__pantry_prompt_command"* ]] && \
        PROMPT_COMMAND="__pantry_prompt_command;$PROMPT_COMMAND"
fi

# Add global packages to PATH (user-local or system-wide)
if [[ -d "$HOME/.pantry/global/bin" ]]; then
    export PATH="$HOME/.pantry/global/bin:$PATH"
elif [[ -d "/usr/local/bin" ]]; then
    # System-wide install adds to /usr/local/bin (already in PATH typically)
    :
fi

# Initial environment check
# If cache hit: fast activation
# If cache miss: trigger installation (this handles the case where user runs pantry clean
# and reloads shell while still in project directory)
local env_info
env_info=$(pantry shell:lookup "$PWD" 2>/dev/null)
if [[ $? -eq 0 && -n "$env_info" ]]; then
    # We're in a known project - activate it from cache
    __pantry_switch_environment
else
    # Cache miss - clear __PANTRY_LAST_PWD to force re-check on next cd
    # This ensures that reloadshell after pantry clean will trigger installation
    unset __PANTRY_LAST_PWD
    # Force a check which will install deps if needed
    # This ensures deps install when opening a new terminal in a project
    __pantry_switch_environment
fi
