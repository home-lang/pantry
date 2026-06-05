# Pantry Shell Integration (Zig)
# Optimized for instant cd with shell-side caching
#
# Routing rule: this integration ONLY ever invokes `pantry install`. It never
# calls `bun install`, `npm install`, etc. directly. `pantry install` is the
# router — it handles pantry system deps (zig, redis, etc.), workspaces, and
# delegates to the appropriate JS package manager (bun/pnpm/yarn/npm) for npm
# deps via deps/js_delegate.zig. If you see "bun install" running after a cd,
# that is pantry's delegate, not this script.

__PANTRY_CACHE_FILE="${HOME}/.pantry/cache/shell-env.cache"

# Dependency file names to check. MUST be a superset of the Zig detector's list
# (src/deps/detector.zig) — the parent-walk fast path below treats "none of
# these anywhere up the tree" as "definitely not a pantry project, skip the
# binary", so a name the detector knows but this list omits would wrongly skip.
__PANTRY_DEP_FILES=(
    "pantry.json" "pantry.jsonc" "pantry.yaml" "pantry.yml"
    "deps.yaml" "deps.yml" "dependencies.yaml" "dependencies.yml"
    "pkgx.yaml" "pkgx.yml" "config/deps.ts" ".config/deps.ts" "pantry.config.ts" ".config/pantry.ts" "pantry.config.js"
    "package.json" "package.jsonc" "zig.json" "pyproject.toml" "requirements.txt" "Cargo.toml"
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

# Prepend a path component, removing any existing copies first so activation
# can repair stale PATH order in already-integrated shells.
__pantry_path_prepend() {
    local dir="$1"
    [[ -z "$dir" ]] && return 0
    local p=":${PATH}:" remove=":$dir:"
    while [[ "$p" == *"$remove"* ]]; do
        p="${p//$remove/:}"
    done
    p="${p#:}"; p="${p%:}"
    if [[ -n "$p" ]]; then
        PATH="$dir:$p"
    else
        PATH="$dir"
    fi
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

# Return 0 if any dependency file exists in $1 or an ancestor (pure shell, no
# subprocess). Used as a cheap guard: if nothing matches up the tree there is no
# pantry project, so we can skip the ~25ms `pantry shell:lookup` entirely. ~25
# builtin `[[ -f ]]` stats per level, depth-capped — well under a process fork.
__pantry_find_dep_up() {
    local dir="$1" depth=0 fname
    while (( depth < 16 )); do
        for fname in "${__PANTRY_DEP_FILES[@]}"; do
            [[ -f "$dir/$fname" ]] && return 0
        done
        [[ "$dir" == "/" || -z "$dir" ]] && break
        dir="${dir%/*}"; [[ -z "$dir" ]] && dir="/"
        (( depth++ ))
    done
    return 1
}

# OPT-IN gate for auto-activation. Returns 0 only if the nearest deps file
# (walking up from $1) sets `autoActivate: true` — matched across YAML
# (`autoActivate: true`), JSON/JSONC (`"autoActivate": true`) and TS configs.
# Projects that don't opt in are ignored by the cd hook entirely.
__pantry_autocd_enabled() {
    local dir="$1" depth=0 fname
    while (( depth < 16 )); do
        for fname in "${__PANTRY_DEP_FILES[@]}"; do
            if [[ -f "$dir/$fname" ]]; then
                grep -qiE '^[[:space:]]*"?autoActivate"?[[:space:]]*:[[:space:]]*"?true"?' "$dir/$fname" 2>/dev/null
                return $?
            fi
        done
        [[ "$dir" == "/" || -z "$dir" ]] && break
        dir="${dir%/*}"; [[ -z "$dir" ]] && dir="/"
        (( depth++ ))
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
    [[ "${__PANTRY_DEBUG:-}" == "1" ]] && echo "[PANTRY DEBUG] Activating: $env_dir for $project_dir" >&2

    export PANTRY_CURRENT_PROJECT="$project_dir"
    export PANTRY_ENV_BIN_PATH="$env_dir/bin"
    export PANTRY_ENV_DIR="$env_dir"
    export PANTRY_DEP_FILE="$dep_file"
    export PANTRY_DEP_MTIME="$(__pantry_mtime "$dep_file")"

    # Add env bin to PATH, moving any existing copy to the front.
    [[ -d "$env_dir/bin" ]] && __pantry_path_prepend "$env_dir/bin"

    # Add pantry/.bin if it exists, moving any existing copy to the front.
    if [[ -d "$project_dir/pantry/.bin" ]]; then
        export PANTRY_BIN_PATH="$project_dir/pantry/.bin"
        __pantry_path_prepend "${PANTRY_BIN_PATH:-}"
    fi

    export PATH
}

__pantry_project_dir_from_dep_file() {
    local dep_file="$1"
    [[ -n "$dep_file" ]] || return 1
    local project_dir="${dep_file%/*}"
    [[ "$project_dir" == "$dep_file" ]] && project_dir="$PWD"
    echo "$project_dir"
}

__pantry_activate_installed_project() {
    local dep_file="$1"
    local project_dir
    project_dir=$(__pantry_project_dir_from_dep_file "$dep_file") || return 1
    [[ -d "$project_dir/pantry/.bin" ]] || return 1
    __pantry_activate "$project_dir/pantry" "$project_dir" "$dep_file"
}

# Deactivate current environment
__pantry_deactivate() {
    [[ "${__PANTRY_DEBUG:-}" == "1" ]] && echo "[PANTRY DEBUG] Deactivating project" >&2
    [[ -n "${PANTRY_ENV_BIN_PATH:-}" ]] && __pantry_path_remove "${PANTRY_ENV_BIN_PATH:-}"
    [[ -n "${PANTRY_BIN_PATH:-}" ]] && __pantry_path_remove "${PANTRY_BIN_PATH:-}"
    export PATH
    unset PANTRY_CURRENT_PROJECT PANTRY_ENV_BIN_PATH PANTRY_ENV_DIR PANTRY_BIN_PATH PANTRY_DEP_FILE PANTRY_DEP_MTIME __PANTRY_LAST_ACTIVATION_KEY
}

# Auto-install dependencies for a freshly-entered project.
#
# Clean by default: prints a single transient status line while installing and
# a one-line confirmation on success — never the full installer log. The full
# output is captured to ~/.pantry/last-install.log and only surfaced (tail) on
# failure, so the prompt stays quiet when things just work.
#
# Escape hatches:
#   PANTRY_VERBOSE=1 / __PANTRY_VERBOSE="true"  stream the full install log
#   PANTRY_INSTALL_TIMEOUT=<seconds>            cap install time (needs `timeout`)
#   PANTRY_NO_AUTO_INSTALL=1                     skip auto-install entirely (caller-checked)
__pantry_auto_install() {
    local dep_file="$1"
    local project_dir name rc=0 tty=0
    project_dir=$(__pantry_project_dir_from_dep_file "$dep_file") || project_dir="$PWD"
    name="${project_dir##*/}"
    [[ -t 2 ]] && tty=1

    # Verbose: stream everything straight through, unchanged.
    if [[ "${__PANTRY_VERBOSE:-}" == "true" || -n "${PANTRY_VERBOSE:-}" ]]; then
        pantry install 2>&1
        return $?
    fi

    local log="${HOME}/.pantry/last-install.log"
    mkdir -p "${HOME}/.pantry" 2>/dev/null

    # Transient "setting up" line (cleared before any result is printed).
    [[ $tty -eq 1 ]] && printf '\r\033[Kpantry: setting up %s…' "$name" >&2

    if [[ -n "${PANTRY_INSTALL_TIMEOUT:-}" ]] && command -v timeout >/dev/null 2>&1; then
        timeout "$PANTRY_INSTALL_TIMEOUT" pantry install >"$log" 2>&1; rc=$?
    else
        pantry install >"$log" 2>&1; rc=$?
    fi

    # Clear the transient status line.
    [[ $tty -eq 1 ]] && printf '\r\033[K' >&2

    if [[ $rc -eq 0 ]]; then
        printf 'pantry: %s ready\n' "$name" >&2
        return 0
    fi

    if [[ $rc -eq 124 ]]; then
        printf 'pantry: setup of %s timed out after %ss\n' "$name" "${PANTRY_INSTALL_TIMEOUT:-?}" >&2
    else
        printf 'pantry: setup of %s failed (exit %d)\n' "$name" "$rc" >&2
    fi
    # Brief context, not a wall of text — full log stays on disk.
    [[ -s "$log" ]] && tail -n 12 "$log" >&2
    printf 'pantry: full log %s — re-run with PANTRY_VERBOSE=1 or `pantry install`\n' "$log" >&2
    return $rc
}

__pantry_switch_environment() {
    [[ "${__PANTRY_DEBUG:-}" == "1" ]] && echo "[PANTRY DEBUG] switch_environment called, PWD=$PWD" >&2

    # SUPER FAST PATH: PWD unchanged
    [[ "${__PANTRY_LAST_PWD:-}" == "$PWD" ]] && return 0
    __PANTRY_LAST_PWD="$PWD"

    # ULTRA FAST PATH: Still in same project (exact match or subdirectory)
    if [[ -n "${PANTRY_CURRENT_PROJECT:-}" ]]; then
        if [[ "$PWD" == "${PANTRY_CURRENT_PROJECT:-}" || "$PWD" == "${PANTRY_CURRENT_PROJECT:-}/"* ]]; then
            # Still in project - check if dep file changed
            if [[ -n "${PANTRY_DEP_FILE:-}" && -f "${PANTRY_DEP_FILE:-}" ]]; then
                local m="$(__pantry_mtime "${PANTRY_DEP_FILE:-}")"
                [[ "$m" == "${PANTRY_DEP_MTIME:-}" ]] && return 0
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

    # OPT-IN GATE: only auto-activate projects that explicitly enable it with
    # `autoActivate: true` in their deps file. Without it, plain `cd` never
    # activates uninvited — ensure we're deactivated and stop here.
    if ! __pantry_autocd_enabled "$PWD"; then
        [[ -n "${PANTRY_CURRENT_PROJECT:-}" ]] && __pantry_deactivate
        __PANTRY_LAST_NO_ENV="$PWD"
        return 0
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
        # No dep file in current dir.
        # Skip the immediately-repeated lookup memo first (cheapest).
        [[ "${__PANTRY_LAST_NO_ENV:-}" == "$PWD" ]] && return 0
        # PURE-SHELL GUARD: if no dependency file exists in this dir or any
        # ancestor, there is no pantry project here — skip the ~25ms binary
        # `shell:lookup` entirely. This makes `cd`-ing into ordinary, non-project
        # directories (home, /tmp, ~/Downloads, …) effectively free.
        if ! __pantry_find_dep_up "$PWD"; then
            __PANTRY_LAST_NO_ENV="$PWD"
            return 0
        fi
    fi

    # BINARY LOOKUP: Walks up parent dirs, checks Zig-side cache (~50ms, first visit)
    [[ "${__PANTRY_DEBUG:-}" == "1" ]] && echo "[PANTRY DEBUG] Running shell:lookup for $PWD" >&2
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

    # If the regular env cache is cold but this project is already installed,
    # activate project-local wrappers directly. A plain `pantry install` creates
    # pantry/.bin but does not always populate the shell env cache.
    if __pantry_activate_installed_project "${dep_file:-}"; then
        return 0
    fi

    # No env found but dep file exists - auto-install unless PANTRY_NO_AUTO_INSTALL is set
    if [[ -n "$dep_file" && -z "${PANTRY_NO_AUTO_INSTALL:-}" ]]; then
        if __pantry_auto_install "$dep_file"; then
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
            if __pantry_activate_installed_project "$dep_file"; then
                return 0
            fi
        fi
    fi

    # Remember this dir to skip repeated lookups
    __PANTRY_LAST_NO_ENV="$PWD"
}


# Hook registration for Zsh
if [[ -n "${ZSH_VERSION:-}" ]]; then
    __pantry_chpwd() {
        [[ "${__PANTRY_IN_HOOK:-}" == "1" ]] && return 0
        __PANTRY_IN_HOOK=1
        __pantry_switch_environment
        unset __PANTRY_IN_HOOK
    }

    typeset -ga chpwd_functions 2>/dev/null || true
    [[ ! " ${chpwd_functions[*]} " =~ " __pantry_chpwd " ]] && chpwd_functions+=(__pantry_chpwd)

# Hook registration for Bash
elif [[ -n "${BASH_VERSION:-}" ]]; then
    __pantry_prompt_command() {
        [[ "${__PANTRY_IN_HOOK:-}" == "1" ]] && return 0
        __PANTRY_IN_HOOK=1
        __pantry_switch_environment
        unset __PANTRY_IN_HOOK
    }

    [[ "${PROMPT_COMMAND:-}" != *"__pantry_prompt_command"* ]] && \
        PROMPT_COMMAND="__pantry_prompt_command;${PROMPT_COMMAND:-}"
fi

# Add global packages to PATH
[[ -d "$HOME/.local/share/pantry/global/bin" ]] && \
    __pantry_path_prepend "$HOME/.local/share/pantry/global/bin" && export PATH

# Re-prepend the active project's bins, repairing PATH order.
# Mirrors __pantry_activate's order so project-local wrappers win: env bin
# first, then pantry/.bin on top. Idempotent (prepend strips existing copies).
__pantry_repair_path() {
    [[ -d "${PANTRY_ENV_BIN_PATH:-}" ]] && __pantry_path_prepend "${PANTRY_ENV_BIN_PATH}"
    [[ -d "${PANTRY_BIN_PATH:-}" ]] && __pantry_path_prepend "${PANTRY_BIN_PATH}"
    export PATH
}

# Initial environment check on shell start.
#
# A re-sourced rc (e.g. the common `reloadshell`/`source ~/.zshrc`) re-runs any
# `export PATH="<global tool>:$PATH"` lines, prepending global dirs AHEAD of an
# already-active project's bins. Across a `source` (not `exec`) our env vars and
# the __PANTRY_LAST_PWD memo persist, so __pantry_switch_environment would hit
# its fast paths and return without repairing PATH order — leaving the global
# tool shadowing the project's pinned one. So if a project is already active for
# this PWD, repair PATH order explicitly before re-detecting.
if [[ -n "${PANTRY_CURRENT_PROJECT:-}" \
      && ( "$PWD" == "${PANTRY_CURRENT_PROJECT}" || "$PWD" == "${PANTRY_CURRENT_PROJECT}"/* ) ]]; then
    __pantry_repair_path
fi

# One-shot update notice + background check (per shell session, never on `cd`).
#
# This deliberately runs ONLY at shell start, not inside __pantry_switch_environment,
# so the `cd` hot path stays untouched. Cost: one `[[ -s ]]` test plus, at most,
# a single fully-detached `pantry dev:check-updates` spawn — which self-throttles
# to ~once/day, so most starts do no network at all. Opt out: PANTRY_NO_UPDATE_CHECK=1.
__pantry_update_check() {
    [[ -n "${PANTRY_NO_UPDATE_CHECK:-}" ]] && return 0
    [[ -n "${__PANTRY_UPDATE_CHECKED:-}" ]] && return 0
    __PANTRY_UPDATE_CHECKED=1

    # Surface an update found by a previous background check (one line, once).
    local marker="${HOME}/.pantry/.update-available"
    if [[ -s "$marker" ]]; then
        local v; v=$(<"$marker")
        [[ -n "$v" ]] && printf 'pantry: v%s available — run `pantry upgrade`\n' "$v" >&2
    fi

    # Kick off today's check fully detached: the `( … & )` subshell orphans the
    # child so there is no job-control noise and the prompt never waits on it.
    command -v pantry >/dev/null 2>&1 && ( pantry dev:check-updates >/dev/null 2>&1 & ) >/dev/null 2>&1
}

# Force a full re-evaluation on shell start / re-source (the per-shell PWD memo
# may have persisted across a `source`), then run the detector.
unset __PANTRY_LAST_PWD
__pantry_switch_environment
__pantry_update_check
