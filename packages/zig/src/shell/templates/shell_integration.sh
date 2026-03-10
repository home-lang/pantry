# Pantry Shell Integration (Zig)
# Optimized for instant cd with shell-side caching

__PANTRY_CACHE_FILE="${HOME}/.pantry/cache/shell-env.cache"

# Dependency file names to check (keep in sync with Zig detector)
__PANTRY_DEP_FILES=(
    "pantry.json" "pantry.jsonc" "pantry.yaml" "pantry.yml"
    "deps.yaml" "deps.yml" "dependencies.yaml" "dependencies.yml"
    "pkgx.yaml" "pkgx.yml" "config/deps.ts" ".config/deps.ts" "pantry.config.ts" ".config/pantry.ts" "pantry.config.js"
    "package.json" "pyproject.toml" "requirements.txt" "Cargo.toml"
    "go.mod" "Gemfile" "deno.json" "composer.json"
)

# Get file modification time (cross-platform, detect once)
if stat -f %m / >/dev/null 2>&1; then
    __pantry_mtime() { stat -f %m "$1" 2>/dev/null || echo 0; }
else
    __pantry_mtime() { stat -c %Y "$1" 2>/dev/null || echo 0; }
fi

# Remove a path component from PATH (pure bash, no sed/subprocess)
__pantry_path_remove() {
    local p=":${PATH}:" remove=":$1:"
    p="${p//$remove/:}"
    p="${p#:}"; p="${p%:}"
    PATH="$p"
}

# Find dependency file in current directory only (fast single-dir check)
__pantry_find_dep_here() {
    local dir="$1"
    for fname in "${__PANTRY_DEP_FILES[@]}"; do
        if [[ -f "$dir/$fname" ]]; then
            echo "$dir/$fname"
            return 0
        fi
    done
    return 1
}

# Shell-side cache lookup (pure shell, zero subprocesses)
# Format per line: dir|env_dir|dep_file|mtime
__pantry_cache_lookup() {
    [[ -f "$__PANTRY_CACHE_FILE" ]] || return 1
    local cached_dir env_dir dep_file cached_mtime
    while IFS='|' read -r cached_dir env_dir dep_file cached_mtime; do
        [[ "$cached_dir" == "$1" ]] || continue
        [[ -d "$env_dir/bin" ]] || return 1
        if [[ -n "$dep_file" && -f "$dep_file" ]]; then
            [[ "$(__pantry_mtime "$dep_file")" == "$cached_mtime" ]] || return 1
        fi
        REPLY="$env_dir"
        return 0
    done < "$__PANTRY_CACHE_FILE"
    return 1
}

# Write/update shell-side cache entry
__pantry_cache_write() {
    local dir="$1" env_dir="$2" dep_file="$3" mtime="$4"
    mkdir -p "${__PANTRY_CACHE_FILE%/*}" 2>/dev/null
    local tmp="${__PANTRY_CACHE_FILE}.$$"
    if [[ -f "$__PANTRY_CACHE_FILE" ]]; then
        while IFS='|' read -r d rest; do
            [[ "$d" != "$dir" ]] && echo "$d|$rest"
        done < "$__PANTRY_CACHE_FILE" | tail -49 > "$tmp"
    fi
    echo "${dir}|${env_dir}|${dep_file}|${mtime}" >> "$tmp"
    mv -f "$tmp" "$__PANTRY_CACHE_FILE" 2>/dev/null
}

# Activate an environment (set PATH + env vars)
__pantry_activate() {
    local env_dir="$1" project_dir="$2" dep_file="$3"
    [[ "$__PANTRY_DEBUG" == "1" ]] && echo "[PANTRY DEBUG] Activating: $env_dir for $project_dir" >&2

    export PANTRY_CURRENT_PROJECT="$project_dir"
    export PANTRY_ENV_BIN_PATH="$env_dir/bin"
    export PANTRY_ENV_DIR="$env_dir"
    export PANTRY_DEP_FILE="$dep_file"
    export PANTRY_DEP_MTIME="$(__pantry_mtime "$dep_file")"

    # Add env bin to PATH (avoid duplicates)
    [[ ":$PATH:" != *":$env_dir/bin:"* ]] && PATH="$env_dir/bin:$PATH"

    # Add pantry/.bin if it exists (project-local tool wrappers)
    if [[ -d "$project_dir/pantry/.bin" ]]; then
        export PANTRY_BIN_PATH="$project_dir/pantry/.bin"
        [[ ":$PATH:" != *":$PANTRY_BIN_PATH:"* ]] && PATH="$PANTRY_BIN_PATH:$PATH"
    fi

    export PATH
}

# Deactivate current environment
__pantry_deactivate() {
    [[ "$__PANTRY_DEBUG" == "1" ]] && echo "[PANTRY DEBUG] Deactivating project" >&2
    [[ -n "$PANTRY_ENV_BIN_PATH" ]] && __pantry_path_remove "$PANTRY_ENV_BIN_PATH"
    [[ -n "$PANTRY_BIN_PATH" ]] && __pantry_path_remove "$PANTRY_BIN_PATH"
    export PATH
    unset PANTRY_CURRENT_PROJECT PANTRY_ENV_BIN_PATH PANTRY_ENV_DIR PANTRY_BIN_PATH PANTRY_DEP_FILE PANTRY_DEP_MTIME __PANTRY_LAST_ACTIVATION_KEY
}

__pantry_switch_environment() {
    [[ "$__PANTRY_DEBUG" == "1" ]] && echo "[PANTRY DEBUG] switch_environment called, PWD=$PWD" >&2

    # SUPER FAST PATH: PWD unchanged
    [[ "$__PANTRY_LAST_PWD" == "$PWD" ]] && return 0
    __PANTRY_LAST_PWD="$PWD"

    # ULTRA FAST PATH: Still in same project (exact match or subdirectory)
    if [[ -n "$PANTRY_CURRENT_PROJECT" ]]; then
        if [[ "$PWD" == "$PANTRY_CURRENT_PROJECT" || "$PWD" == "$PANTRY_CURRENT_PROJECT/"* ]]; then
            # Still in project - check if dep file changed
            if [[ -n "$PANTRY_DEP_FILE" && -f "$PANTRY_DEP_FILE" ]]; then
                local m="$(__pantry_mtime "$PANTRY_DEP_FILE")"
                [[ "$m" == "$PANTRY_DEP_MTIME" ]] && return 0
                # Dep file changed - deactivate and re-detect below
                __pantry_deactivate
            else
                return 0
            fi
        else
            # Left the project - instant deactivation (no subprocess!)
            __pantry_deactivate
            return 0
        fi
    fi

    # SHELL-SIDE CACHE: Check for this dir first (covers subdirs cached from parent lookups)
    if __pantry_cache_lookup "$PWD"; then
        local dep_file
        dep_file=$(__pantry_find_dep_here "$PWD") || dep_file=""
        __pantry_activate "$REPLY" "$PWD" "${dep_file:-}"
        return 0
    fi

    # Quick single-dir check: any dep file here?
    local dep_file
    dep_file=$(__pantry_find_dep_here "$PWD")
    if [[ $? -ne 0 ]]; then
        # No dep file in current dir - still check binary (walks parent dirs)
        # but only if we haven't already checked recently (avoid repeated lookups)
        [[ "$__PANTRY_LAST_NO_ENV" == "$PWD" ]] && return 0
    fi

    # BINARY LOOKUP: Walks up parent dirs, checks Zig-side cache (~50ms, first visit)
    [[ "$__PANTRY_DEBUG" == "1" ]] && echo "[PANTRY DEBUG] Running shell:lookup for $PWD" >&2
    local lookup_result
    lookup_result=$(pantry shell:lookup "$PWD" 2>/dev/null)

    if [[ $? -eq 0 && -n "$lookup_result" ]]; then
        local env_dir="${lookup_result%%|*}"
        local project_dir="${lookup_result#*|}"
        if [[ -d "$env_dir/bin" ]]; then
            # Cache this dir AND the project root for fast lookups
            local mtime="0"
            [[ -n "$dep_file" ]] && mtime="$(__pantry_mtime "$dep_file")"
            __pantry_cache_write "$PWD" "$env_dir" "${dep_file:-}" "$mtime"
            [[ "$PWD" != "$project_dir" ]] && __pantry_cache_write "$project_dir" "$env_dir" "${dep_file:-}" "$mtime"
            __pantry_activate "$env_dir" "${project_dir:-$PWD}" "${dep_file:-}"
            return 0
        fi
    fi

    # No env found but dep file exists - auto-install unless PANTRY_NO_AUTO_INSTALL is set
    if [[ -n "$dep_file" && -z "$PANTRY_NO_AUTO_INSTALL" ]]; then
        if pantry install 2>&1; then
            # Retry lookup after install
            lookup_result=$(pantry shell:lookup "$PWD" 2>/dev/null)
            if [[ $? -eq 0 && -n "$lookup_result" ]]; then
                local env_dir="${lookup_result%%|*}"
                local project_dir="${lookup_result#*|}"
                if [[ -d "$env_dir/bin" ]]; then
                    local mtime="$(__pantry_mtime "$dep_file")"
                    __pantry_cache_write "$PWD" "$env_dir" "$dep_file" "$mtime"
                    [[ "$PWD" != "$project_dir" ]] && __pantry_cache_write "$project_dir" "$env_dir" "$dep_file" "$mtime"
                    __pantry_activate "$env_dir" "${project_dir:-$PWD}" "$dep_file"
                    return 0
                fi
            fi
        fi
    fi

    # Remember this dir to skip repeated lookups
    __PANTRY_LAST_NO_ENV="$PWD"
}


# Hook registration for Zsh
if [[ -n "$ZSH_VERSION" ]]; then
    __pantry_chpwd() {
        [[ "$__PANTRY_IN_HOOK" == "1" ]] && return 0
        __PANTRY_IN_HOOK=1
        __pantry_switch_environment
        unset __PANTRY_IN_HOOK
    }

    typeset -ga chpwd_functions 2>/dev/null || true
    [[ ! " ${chpwd_functions[*]} " =~ " __pantry_chpwd " ]] && chpwd_functions+=(__pantry_chpwd)

# Hook registration for Bash
elif [[ -n "$BASH_VERSION" ]]; then
    __pantry_prompt_command() {
        [[ "$__PANTRY_IN_HOOK" == "1" ]] && return 0
        __PANTRY_IN_HOOK=1
        __pantry_switch_environment
        unset __PANTRY_IN_HOOK
    }

    [[ "$PROMPT_COMMAND" != *"__pantry_prompt_command"* ]] && \
        PROMPT_COMMAND="__pantry_prompt_command;$PROMPT_COMMAND"
fi

# Add global packages to PATH
[[ -d "$HOME/.local/share/pantry/global/bin" ]] && \
    [[ ":$PATH:" != *":$HOME/.local/share/pantry/global/bin:"* ]] && \
    PATH="$HOME/.local/share/pantry/global/bin:$PATH" && export PATH

# Initial environment check on shell start
__pantry_switch_environment
