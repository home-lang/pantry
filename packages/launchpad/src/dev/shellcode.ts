import { join } from 'node:path'
import process from 'node:process'

export function shellcode(): string {
  // Use absolute path to avoid PATH resolution issues
  const setupCommand = 'LAUNCHPAD_ORIGINAL_PATH="$LAUNCHPAD_ORIGINAL_PATH" /usr/local/bin/launchpad dev "$project_dir" --shell --quiet 2>/dev/null'
  const grepFilter = '/usr/bin/grep -E \'^(export|if|fi|#)\' 2>/dev/null'

  return `
# Launchpad shell integration with no background jobs
__launchpad_cache_dir=""
__launchpad_cache_timestamp=0
__launchpad_setup_in_progress=""
__launchpad_timeout_count=0

# Environment variable optimization - batch export
__launchpad_set_env() {
    local env_file="$1"
    if [[ -f "$env_file" ]]; then
        # Use single eval for better performance
        eval "$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$env_file" | sed 's/^/export /')" 2>/dev/null || true
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

    # Use cache if it's less than 30 seconds old and for the same directory
    if [[ -n "$__launchpad_cache_dir" && "$__launchpad_cache_dir" == "$dir" && $((current_time - __launchpad_cache_timestamp)) -lt 30 ]]; then
        echo "$__launchpad_cache_dir"
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
                    echo "$dir"
                    return 0
                fi
            done
        done
        dir="$(/usr/bin/dirname "$dir")"
    done

    return 1
}

__launchpad_chpwd() {
    local project_dir
    project_dir=$(__launchpad_find_deps_file "$PWD")

    if [[ -n "$project_dir" ]]; then
        # Check if we're entering a new project or if this is the first time
        if [[ "$LAUNCHPAD_CURRENT_PROJECT" != "$project_dir" ]]; then
            export LAUNCHPAD_CURRENT_PROJECT="$project_dir"

            # Ensure we have a valid original PATH before activation
            if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" ]]; then
                export LAUNCHPAD_ORIGINAL_PATH="$PATH"
            fi

            # Check if setup is already in progress to avoid duplicate work
            if [[ "$__launchpad_setup_in_progress" == "$project_dir" ]]; then
                return 0
            fi

            # Skip setup if we've had too many timeouts recently
            if [[ $__launchpad_timeout_count -gt 3 ]]; then
                if [[ "\${LAUNCHPAD_SHOW_ENV_MESSAGES:-true}" != "false" ]]; then
                    echo "⚡ Environment setup temporarily disabled due to timeouts" >&2
                fi
                return 0
            fi

            # Mark setup as in progress
            __launchpad_setup_in_progress="$project_dir"

            # Set up the environment with aggressive timeout and error suppression
            local env_output
            local setup_exit_code=0

            # Use a shorter timeout - no background jobs
            {
                env_output=$(${setupCommand} | ${grepFilter})
                setup_exit_code=$?
            } 2>/dev/null

            # Clear the in-progress flag
            __launchpad_setup_in_progress=""

            if [[ $setup_exit_code -eq 124 ]]; then
                # Timeout occurred (exit code 124 from timeout command)
                __launchpad_timeout_count=$(((__launchpad_timeout_count + 1)))
                if [[ "\${LAUNCHPAD_SHOW_ENV_MESSAGES:-true}" != "false" ]]; then
                    echo "⚠️  Environment setup timed out for $(basename "$project_dir")" >&2
                fi
                return 0
            elif [[ $setup_exit_code -eq 0 && -n "$env_output" ]]; then
                # Success - reset timeout counter
                __launchpad_timeout_count=0

                # Execute the environment setup
                eval "$env_output" 2>/dev/null || true

                # Clear command hash table to ensure commands are found in new PATH
                hash -r 2>/dev/null || true

                # Show activation message synchronously (no background jobs)
                if [[ "\${LAUNCHPAD_SHOW_ENV_MESSAGES:-true}" != "false" ]]; then
                    /usr/local/bin/launchpad dev:on "$project_dir" --shell-safe 2>/dev/null || true
                fi
            else
                # Setup failed but not due to timeout - try to set up basic environment silently
                local project_hash
                project_hash=$(echo -n "$project_dir" | sha256sum 2>/dev/null | cut -d' ' -f1 | cut -c1-8) || project_hash="default"
                local env_dir="$HOME/.local/share/launchpad/launchpad_$project_hash"

                if [[ -d "$env_dir/bin" ]]; then
                    __launchpad_update_path "$env_dir/bin"
                    hash -r 2>/dev/null || true

                    # Show activation message only if environment already exists
                    if [[ "\${LAUNCHPAD_SHOW_ENV_MESSAGES:-true}" != "false" ]]; then
                        /usr/local/bin/launchpad dev:on "$project_dir" --shell-safe 2>/dev/null || true
                    fi
                fi
                # If no environment exists, be completely silent
            fi
        fi
    else
        # No deps file found, deactivate if we were in a project
        if [[ -n "$LAUNCHPAD_CURRENT_PROJECT" ]]; then
            # Restore original PATH if we have it
            if [[ -n "$LAUNCHPAD_ORIGINAL_PATH" ]]; then
                export PATH="$LAUNCHPAD_ORIGINAL_PATH"

                # Clear command hash table after PATH restoration
                hash -r 2>/dev/null || true
            fi

            # Show deactivation message synchronously (no background jobs)
            if [[ "\${LAUNCHPAD_SHOW_ENV_MESSAGES:-true}" != "false" ]]; then
                /usr/local/bin/launchpad dev:off 2>/dev/null || true
            fi

            unset LAUNCHPAD_CURRENT_PROJECT
            unset LAUNCHPAD_ENV_BIN_PATH
            unset LAUNCHPAD_PROJECT_DIR

            # Clear cache when leaving project
            __launchpad_cache_dir=""
            __launchpad_cache_timestamp=0

            # Reset timeout counter when leaving projects
            __launchpad_timeout_count=0
        fi
    fi
}

# Optimized hook setup with reduced frequency checking
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

    # Only add to PROMPT_COMMAND if not already present
    if [[ "$PROMPT_COMMAND" != *"__launchpad_check_pwd"* ]]; then
        PROMPT_COMMAND="__launchpad_check_pwd; $PROMPT_COMMAND"
    fi
fi

# Initialize LAUNCHPAD_ORIGINAL_PATH if not set and PATH looks corrupted
if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" && ! "$PATH" =~ "/usr/local/bin" ]]; then
    export LAUNCHPAD_ORIGINAL_PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    export PATH="$LAUNCHPAD_ORIGINAL_PATH"
fi

# Run on initial load (but only if we're in an interactive shell)
if [[ $- == *i* ]]; then
    __launchpad_chpwd
fi

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
