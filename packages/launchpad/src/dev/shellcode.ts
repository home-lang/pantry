import { join } from 'node:path'
import process from 'node:process'

export function shellcode(): string {
  return `
# Launchpad shell integration with performance optimizations
__launchpad_cache_dir=""
__launchpad_cache_timestamp=0
__launchpad_env_hash=""

# Environment variable optimization - batch export
__launchpad_set_env() {
    local env_file="$1"
    if [[ -f "$env_file" ]]; then
        # Use single eval for better performance
        eval "$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$env_file" | sed 's/^/export /')"
    fi
}

# Optimized PATH management
__launchpad_update_path() {
    local project_bin="$1"
    if [[ -d "$project_bin" ]]; then
        # Only update PATH if not already present
        if [[ ":$PATH:" != *":$project_bin:"* ]]; then
            export PATH="$project_bin:$PATH"
        fi
    fi
}

__launchpad_find_deps_file() {
    local dir="$1"
    local current_time=$(date +%s)

    # Use cache if it's less than 5 seconds old and for the same directory
    if [[ -n "$__launchpad_cache_dir" && "$__launchpad_cache_dir" == "$dir" && $((current_time - __launchpad_cache_timestamp)) -lt 5 ]]; then
        return 0
    fi

    # Clear cache for new search
    __launchpad_cache_dir=""
    __launchpad_cache_timestamp=0

    while [[ "$dir" != "/" ]]; do
        # Check multiple file patterns efficiently
        # Supported files: dependencies.yaml, dependencies.yml, deps.yaml, deps.yml,
        # pkgx.yaml, pkgx.yml, launchpad.yaml, launchpad.yml
        for pattern in "dependencies" "deps" "pkgx" "launchpad"; do
            for ext in "yaml" "yml"; do
                local file="$dir/$pattern.$ext"
                if [[ -f "$file" ]]; then
                    __launchpad_cache_dir="$dir"
                    __launchpad_cache_timestamp=$current_time
                    return 0
                fi
            done
        done
        dir="$(/usr/bin/dirname "$dir")"
    done

    return 1
}

__launchpad_chpwd() {
    local deps_file
    deps_file=$(__launchpad_find_deps_file "$PWD")

    if [[ -n "$deps_file" ]]; then
        local project_dir="$(/usr/bin/dirname "$deps_file")"

        # Check if we're entering a new project or if this is the first time
        if [[ "$LAUNCHPAD_CURRENT_PROJECT" != "$project_dir" ]]; then
            export LAUNCHPAD_CURRENT_PROJECT="$project_dir"

            # Ensure we have a valid original PATH before activation
            if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" ]]; then
                export LAUNCHPAD_ORIGINAL_PATH="$PATH"
            fi

            # Set up the environment and get the bin path
            local env_output
            env_output=$(LAUNCHPAD_ORIGINAL_PATH="$LAUNCHPAD_ORIGINAL_PATH" /usr/local/bin/launchpad dev "$project_dir" --shell 2>/dev/null | /usr/bin/grep -E '^(export|if|fi|#)')

            if [[ $? -eq 0 && -n "$env_output" ]]; then
                # Execute the environment setup
                eval "$env_output"

                # Clear command hash table to ensure commands are found in new PATH
                hash -r 2>/dev/null || true

                # Show activation message (async to avoid blocking)
                (/usr/local/bin/launchpad dev:on "$project_dir" &) 2>/dev/null || true
            fi
        fi
    else
        # No deps file found, deactivate if we were in a project
        if [[ -n "$LAUNCHPAD_CURRENT_PROJECT" ]]; then
            # Restore original PATH if we have it
            if [[ -n "$LAUNCHPAD_ORIGINAL_PATH" ]]; then
                export PATH="$LAUNCHPAD_ORIGINAL_PATH"
                unset LAUNCHPAD_ORIGINAL_PATH

                # Clear command hash table after PATH restoration
                hash -r 2>/dev/null || true
            fi

            # Show deactivation message (async to avoid blocking)
            (/usr/local/bin/launchpad dev:off &) 2>/dev/null || true

            unset LAUNCHPAD_CURRENT_PROJECT
            # Clear cache when leaving project
            __launchpad_cache_dir=""
            __launchpad_cache_timestamp=0
        fi
    fi
}

# Hook into directory changes with optimized frequency
if [[ -n "$ZSH_VERSION" ]]; then
    autoload -U add-zsh-hook
    add-zsh-hook chpwd __launchpad_chpwd
elif [[ -n "$BASH_VERSION" ]]; then
    # For bash, use a more efficient approach that doesn't run on every prompt
    __launchpad_last_pwd="$PWD"
    __launchpad_check_pwd() {
        if [[ "$PWD" != "$__launchpad_last_pwd" ]]; then
            __launchpad_last_pwd="$PWD"
            __launchpad_chpwd
        fi
    }
    PROMPT_COMMAND="__launchpad_check_pwd; $PROMPT_COMMAND"
fi

# Initialize LAUNCHPAD_ORIGINAL_PATH if not set and PATH looks corrupted
if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" && ! "$PATH" =~ "/usr/local/bin" ]]; then
    export LAUNCHPAD_ORIGINAL_PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    export PATH="$LAUNCHPAD_ORIGINAL_PATH"
fi

# Run on initial load
__launchpad_chpwd

# Clear command hash table on initial load to ensure fresh command lookup
hash -r 2>/dev/null || true
`.trim()
}

export function datadir(): string {
  return platform_data_home_default()
}

function platform_data_home_default(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '~'
  return join(homeDir, '.local', 'share', 'launchpad')
}
