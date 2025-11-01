# Pantry Shell Integration (Zig)
# Fast environment switching function (optimized for Zig backend)

__pantry_switch_environment() {
    # SUPER FAST PATH: PWD unchanged
    if [[ "$__PANTRY_LAST_PWD" == "$PWD" ]]; then
        return 0
    fi
    export __PANTRY_LAST_PWD="$PWD"

    # ULTRA FAST PATH: Still in project subdirectory
    if [[ -n "$PANTRY_CURRENT_PROJECT" && "$PWD" == "$PANTRY_CURRENT_PROJECT"* ]]; then
        return 0
    fi

    # INSTANT DEACTIVATION PATH: Left project
    if [[ -n "$PANTRY_CURRENT_PROJECT" && "$PWD" != "$PANTRY_CURRENT_PROJECT"* ]]; then
        # Show deactivation message
        [[ "$__PANTRY_SHOW_MESSAGES" == "true" ]] && printf "%s\n" "$__PANTRY_DEACTIVATION_MSG" >&2

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
        unset PANTRY_CURRENT_PROJECT PANTRY_ENV_BIN_PATH PANTRY_ENV_DIR PANTRY_MODULES_BIN_PATH
        return 0
    fi

    # CACHE LOOKUP: Use Zig binary for fast cache lookup
    # This replaces all the shell-based caching logic with a single binary call
    local env_info
    env_info=$(pantry shell:lookup "$PWD" 2>/dev/null)

    if [[ $? -eq 0 && -n "$env_info" ]]; then
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
    local install_output
    install_output=$(pantry shell:activate "$PWD")

    if [[ $? -eq 0 && -n "$install_output" ]]; then
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
if [[ -d "$HOME/.local/share/pantry/global/bin" ]]; then
    export PATH="$HOME/.local/share/pantry/global/bin:$PATH"
elif [[ -d "/usr/local/share/pantry/bin" ]]; then
    export PATH="/usr/local/share/pantry/bin:$PATH"
fi

# Initial environment check
__pantry_switch_environment
