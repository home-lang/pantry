import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

// Helper function to find the correct launchpad binary
function getLaunchpadBinary(): string {
  // Check if we're running from a test environment
  if (process.argv[1] && (process.argv[1].includes('.test.') || process.argv[1].includes('/test/'))) {
    return 'launchpad'
  }

  // Check if we're running from CLI script in development (bin/cli.ts)
  if (process.argv[1] && process.argv[1].includes('/bin/cli.ts')) {
    return 'launchpad'
  }

  // Check if we're running from a compiled binary or Bun's internal filesystem
  if (process.argv[1] && (process.argv[1].includes('launchpad') || process.argv[1].includes('$bunfs')) && !process.argv[1].includes('.test.') && !process.argv[1].includes('.ts')) {
    // When running from Bun's compiled binary, argv[1] might be internal like /$bunfs/root/launchpad
    // In this case, we should try to find the actual binary path

    // First, try to use environment variables or find the binary in PATH
    try {
      const whichResult = spawnSync('which', ['launchpad'], { encoding: 'utf8', timeout: 1000 })
      if (whichResult.status === 0 && whichResult.stdout.trim()) {
        return whichResult.stdout.trim()
      }
    }
    catch {
      // Ignore errors from which command
    }

    // If argv[1] looks like a real path (not internal Bun filesystem), use it
    if (process.argv[1] && !process.argv[1].includes('$bunfs') && !process.argv[1].includes('/$bunfs')) {
      return process.argv[1]
    }
  }

  // Check if we have the executable path from argv0
  if (process.argv0 && process.argv0.includes('launchpad')) {
    return process.argv0
  }

  // Last resort: try to find launchpad in common installation paths
  const commonPaths = [
    '/usr/local/bin/launchpad',
    `${process.env.HOME}/.bun/bin/launchpad`,
    `${process.env.HOME}/.local/bin/launchpad`,
  ]

  for (const path of commonPaths) {
    if (existsSync(path)) {
      return path
    }
  }

  // Fall back to finding launchpad in PATH
  return 'launchpad'
}

export function shellcode(): string {
  // Use the same launchpad binary that's currently running
  const launchpadBinary = getLaunchpadBinary()
  const grepFilter = '/usr/bin/grep -v \'^$\' 2>/dev/null'

  return `
# Launchpad shell integration with progress indicators
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

# Dynamic library path management
__launchpad_update_library_paths() {
    local env_dir="$1"

    # Build library paths from environment
    local lib_paths=""

    # Add lib directories from the environment
    for lib_dir in "$env_dir/lib" "$env_dir/lib64"; do
        if [[ -d "$lib_dir" ]]; then
            if [[ -z "$lib_paths" ]]; then
                lib_paths="$lib_dir"
            else
                lib_paths="$lib_paths:$lib_dir"
            fi
        fi
    done

    # Add lib directories from all packages in the environment
    if [[ -d "$env_dir" ]]; then
        for domain_dir in "$env_dir"/*; do
            if [[ -d "$domain_dir" && "$(basename "$domain_dir")" != "bin" && "$(basename "$domain_dir")" != "sbin" && "$(basename "$domain_dir")" != "lib" && "$(basename "$domain_dir")" != "lib64" && "$(basename "$domain_dir")" != "share" && "$(basename "$domain_dir")" != "include" && "$(basename "$domain_dir")" != "etc" && "$(basename "$domain_dir")" != "pkgs" && "$(basename "$domain_dir")" != ".tmp" && "$(basename "$domain_dir")" != ".cache" ]]; then
                # Use find to avoid glob expansion issues
                while IFS= read -r -d '' version_dir; do
                    if [[ -d "$version_dir" ]]; then
                        for lib_dir in "$version_dir/lib" "$version_dir/lib64"; do
                            if [[ -d "$lib_dir" ]]; then
                                if [[ -z "$lib_paths" ]]; then
                                    lib_paths="$lib_dir"
                                else
                                    # Avoid duplicates
                                    if [[ ":$lib_paths:" != *":$lib_dir:"* ]]; then
                                        lib_paths="$lib_paths:$lib_dir"
                                    fi
                                fi
                            fi
                        done
                    fi
                done < <(find "$domain_dir" -maxdepth 1 -name "v*" -type d -print0 2>/dev/null)
            fi
        done
    fi

    # Set up library path environment variables if we have paths
    if [[ -n "$lib_paths" ]]; then
        # Store original values if not already stored
        if [[ -z "$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH" ]]; then
            export LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH="$DYLD_LIBRARY_PATH"
        fi
        if [[ -z "$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH" ]]; then
            export LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH="$DYLD_FALLBACK_LIBRARY_PATH"
        fi
        if [[ -z "$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH" ]]; then
            export LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH="$LD_LIBRARY_PATH"
        fi

        # Set library paths with fallbacks to original values
        if [[ -n "$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH" ]]; then
            export DYLD_LIBRARY_PATH="$lib_paths:$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH"
        else
            export DYLD_LIBRARY_PATH="$lib_paths"
        fi

        if [[ -n "$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH" ]]; then
            export DYLD_FALLBACK_LIBRARY_PATH="$lib_paths:$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH"
        else
            export DYLD_FALLBACK_LIBRARY_PATH="$lib_paths:/usr/local/lib:/lib:/usr/lib"
        fi

        if [[ -n "$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH" ]]; then
            export LD_LIBRARY_PATH="$lib_paths:$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH"
        else
            export LD_LIBRARY_PATH="$lib_paths"
        fi
    fi
}

# Setup global dependencies (from multiple possible locations)
__launchpad_setup_global_deps() {
    # Check the standard global environment
    local global_env_dir="$HOME/.local/share/launchpad/global"
    if [[ -d "$global_env_dir/bin" ]]; then
        __launchpad_update_path "$global_env_dir/bin"
    fi
    if [[ -d "$global_env_dir/sbin" ]]; then
        __launchpad_update_path "$global_env_dir/sbin"
    fi
    if [[ -d "$global_env_dir" ]]; then
        __launchpad_update_library_paths "$global_env_dir"
    fi

    # Check for global dependencies from ~/.dotfiles (most common case)
    local dotfiles_env_pattern="$HOME/.local/share/launchpad/.dotfiles_*"
    for dotfiles_env in $dotfiles_env_pattern; do
        if [[ -d "$dotfiles_env/bin" ]]; then
            __launchpad_update_path "$dotfiles_env/bin"
        fi
        if [[ -d "$dotfiles_env/sbin" ]]; then
            __launchpad_update_path "$dotfiles_env/sbin"
        fi
        if [[ -d "$dotfiles_env" ]]; then
            __launchpad_update_library_paths "$dotfiles_env"
        fi
    done

    # Also check for any other manually activated global dependency environments
    # Use launchpad to detect environments created with global: true flag
    local launchpad_envs_dir="$HOME/.local/share/launchpad"
    if [[ -d "$launchpad_envs_dir" ]] && command -v ${launchpadBinary} >/dev/null 2>&1; then
        # Get list of environments with global dependencies by checking for known patterns
        # that indicate global installations (environments named after global dependency files)
        for env_dir in "$launchpad_envs_dir"/*; do
            # Skip if not a directory or if it's already processed above
            if [[ ! -d "$env_dir" ]] || [[ "$env_dir" == *"/global"* ]] || [[ "$env_dir" == *"/.dotfiles_"* ]]; then
                continue
            fi

            # Skip regular project environments (they have specific hashes)
            local env_name=$(basename "$env_dir")
            if [[ "$env_name" =~ ^launchpad_[a-f0-9]{8}$ ]]; then
                continue
            fi

            # Include environments that match global dependency file patterns
            # These would be created from running 'launchpad dev path/to/global-deps.yaml'
            local bin_dir="$env_dir/bin"
            if [[ -d "$bin_dir" ]] && [[ -n "$(ls -A "$bin_dir" 2>/dev/null)" ]]; then
                # This is likely a global environment based on the naming pattern
                # (non-project environments with actual binaries)
                __launchpad_update_path "$bin_dir"
                if [[ -d "$env_dir/sbin" ]]; then
                    __launchpad_update_path "$env_dir/sbin"
                fi
                __launchpad_update_library_paths "$env_dir"
            fi
        done
    fi
}

# Ensure global dependencies are always in PATH
__launchpad_ensure_global_path() {
    # Add standard global environment to PATH if it exists
    local global_env_dir="$HOME/.local/share/launchpad/global"
    if [[ -d "$global_env_dir/bin" ]]; then
        __launchpad_update_path "$global_env_dir/bin"
    fi
    if [[ -d "$global_env_dir/sbin" ]]; then
        __launchpad_update_path "$global_env_dir/sbin"
    fi

    # Ensure global dependencies from ~/.dotfiles are in PATH
    local dotfiles_env_pattern="$HOME/.local/share/launchpad/.dotfiles_*"
    for dotfiles_env in $dotfiles_env_pattern; do
        if [[ -d "$dotfiles_env/bin" ]]; then
            __launchpad_update_path "$dotfiles_env/bin"
        fi
        if [[ -d "$dotfiles_env/sbin" ]]; then
            __launchpad_update_path "$dotfiles_env/sbin"
        fi
    done

    # Also ensure any other manually activated global environments are in PATH
    local launchpad_envs_dir="$HOME/.local/share/launchpad"
    if [[ -d "$launchpad_envs_dir" ]]; then
        for env_dir in "$launchpad_envs_dir"/*; do
            # Skip if not a directory or if it's already processed above
            if [[ ! -d "$env_dir" ]] || [[ "$env_dir" == *"/global"* ]] || [[ "$env_dir" == *"/.dotfiles_"* ]]; then
                continue
            fi

            # Skip regular project environments (they have specific hashes)
            local env_name=$(basename "$env_dir")
            if [[ "$env_name" =~ ^launchpad_[a-f0-9]{8}$ ]]; then
                continue
            fi

            # Include environments that were created from global dependency files
            local bin_dir="$env_dir/bin"
            if [[ -d "$bin_dir" ]] && [[ -n "$(ls -A "$bin_dir" 2>/dev/null)" ]]; then
                # This is likely a global environment based on the naming pattern
                __launchpad_update_path "$bin_dir"
                if [[ -d "$env_dir/sbin" ]]; then
                    __launchpad_update_path "$env_dir/sbin"
                fi
            fi
        done
    fi

    # Always ensure critical system paths are available
    __launchpad_ensure_system_path
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

            # Fast path: Check if environment is already ready
            local project_hash
            project_hash=$(echo -n "$project_dir" | sha256sum 2>/dev/null | cut -d' ' -f1 | cut -c1-8) || project_hash="default"
            local env_dir="$HOME/.local/share/launchpad/launchpad_$project_hash"

            # If environment exists and has binaries, activate quickly
            if [[ -d "$env_dir/bin" && -n "$(ls -A "$env_dir/bin" 2>/dev/null)" ]]; then
                export PATH="$env_dir/bin:$LAUNCHPAD_ORIGINAL_PATH"
                __launchpad_update_library_paths "$env_dir"
                __launchpad_ensure_global_path
                hash -r 2>/dev/null || true

                if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-true\}" != "false" ]]; then
                    ${launchpadBinary} dev:on "$project_dir" --shell-safe >&2 2>/dev/null || printf "✅ Environment activated for \\033[3m$(basename "$project_dir")\\033[0m\\n" >&2
                fi
                return 0
            fi

            # Skip setup if we've had too many timeouts recently
            if [[ $__launchpad_timeout_count -gt 3 ]]; then
                if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-true\}" != "false" ]]; then
                    echo "⚡ Environment setup temporarily disabled due to timeouts" >&2
                fi
                return 0
            fi

            # Mark setup as in progress
            __launchpad_setup_in_progress="$project_dir"

            # Set up the environment with progress indicators
            local env_output
            local setup_exit_code=0
            local activation_needed=false

            # Ensure global dependencies are available first
            __launchpad_setup_global_deps

            # Show initial progress message
            if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-true\}" != "false" ]]; then
                printf "🔧 Setting up project environment for $(basename "$project_dir")..." >&2
            fi

            # Run installation and capture output for simplified progress
            local temp_output=$(mktemp)
            if LAUNCHPAD_SHELL_INTEGRATION=1 LAUNCHPAD_ORIGINAL_PATH="$LAUNCHPAD_ORIGINAL_PATH" ${launchpadBinary} dev "$project_dir" > "$temp_output" 2>&1; then
                # Show simplified progress based on what happened
                if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-true\}" != "false" ]]; then
                    if grep -q "cached" "$temp_output"; then
                        printf "\\r📦 Using cached dependencies..." >&2
                    elif grep -q "Download" "$temp_output"; then
                        printf "\\r📦 Installing dependencies..." >&2
                    fi
                fi
                rm -f "$temp_output" 2>/dev/null || true
                # Installation succeeded, now get shell environment quietly
                local temp_file=$(mktemp)
                if LAUNCHPAD_SHELL_INTEGRATION=1 LAUNCHPAD_ORIGINAL_PATH="$LAUNCHPAD_ORIGINAL_PATH" ${launchpadBinary} dev "$project_dir" --shell > "$temp_file" 2>/dev/null; then
                    # Extract shell code from stdout for evaluation
                    if [[ -s "$temp_file" ]]; then
                        env_output=$(cat "$temp_file" | ${grepFilter})
                        if [[ -n "$env_output" ]]; then
                            activation_needed=true
                        fi
                    fi
                    setup_exit_code=0
                else
                    setup_exit_code=$?
                fi
                rm -f "$temp_file" 2>/dev/null || true
            else
                setup_exit_code=$?
                rm -f "$temp_output" 2>/dev/null || true
            fi

            # Clear the in-progress flag
            __launchpad_setup_in_progress=""

            if [[ $setup_exit_code -eq 124 ]]; then
                # Timeout occurred (exit code 124 from timeout command)
                __launchpad_timeout_count=$(((__launchpad_timeout_count + 1)))
                if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-true\}" != "false" ]]; then
                    echo "⚠️  Environment setup timed out for $(basename "$project_dir")" >&2
                fi
                return 0
            elif [[ $setup_exit_code -eq 0 ]]; then
                # Success - reset timeout counter
                __launchpad_timeout_count=0

                # Execute the environment setup if we have output
                if [[ -n "$env_output" ]]; then
                    eval "$env_output" 2>/dev/null || true
                fi

                # Ensure global dependencies are still in PATH after project setup
                __launchpad_ensure_global_path

                # Clear command hash table to ensure commands are found in new PATH
                hash -r 2>/dev/null || true

                # Show clean activation message that replaces any previous output
                if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-true\}" != "false" ]]; then
                    # Use carriage return to replace any previous output
                    printf "\\r\\033[K" >&2
                    ${launchpadBinary} dev:on "$project_dir" --shell-safe >&2 2>/dev/null || printf "✅ Environment activated for \\033[3m$(basename "$project_dir")\\033[0m\\n" >&2
                fi
            else
                # Setup failed but not due to timeout - try to set up basic environment silently
                local project_hash
                project_hash=$(echo -n "$project_dir" | sha256sum 2>/dev/null | cut -d' ' -f1 | cut -c1-8) || project_hash="default"
                local env_dir="$HOME/.local/share/launchpad/launchpad_$project_hash"

                if [[ -d "$env_dir/bin" ]]; then
                    __launchpad_update_path "$env_dir/bin"
                    __launchpad_update_library_paths "$env_dir"

                    # Ensure global dependencies are available
                    __launchpad_ensure_global_path

                    hash -r 2>/dev/null || true

                    # Show activation message only if environment already exists
                    if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-true\}" != "false" ]]; then
                        printf "\\r\\033[K" >&2
                        ${launchpadBinary} dev:on "$project_dir" --shell-safe >&2 2>/dev/null || printf "✅ Environment activated for \\033[3m$(basename "$project_dir")\\033[0m\\n" >&2
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

                # Re-add global dependencies to PATH even when deactivating
                __launchpad_ensure_global_path

                # Clear command hash table after PATH restoration
                hash -r 2>/dev/null || true
            fi

            # Restore original library paths
            if [[ -n "$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH" ]]; then
                export DYLD_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH"
            else
                unset DYLD_LIBRARY_PATH
            fi
            if [[ -n "$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH" ]]; then
                export DYLD_FALLBACK_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH"
            else
                unset DYLD_FALLBACK_LIBRARY_PATH
            fi
            if [[ -n "$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH" ]]; then
                export LD_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH"
            else
                unset LD_LIBRARY_PATH
            fi

            # Show deactivation message synchronously (no background jobs)
            if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-true\}" != "false" ]]; then
                printf "\\r\\033[K" >&2
                ${launchpadBinary} dev:off >&2 2>/dev/null || printf "⚪ Environment deactivated\\n" >&2
            fi

            unset LAUNCHPAD_CURRENT_PROJECT
            unset LAUNCHPAD_ENV_BIN_PATH
            unset LAUNCHPAD_PROJECT_DIR
            unset LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH
            unset LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH
            unset LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH

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

# Initialize LAUNCHPAD_ORIGINAL_PATH if not set and ensure basic system paths are always available
if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" ]]; then
    # Store the current PATH as original if it looks valid
    if [[ "$PATH" =~ "/usr/bin" && "$PATH" =~ "/bin" ]]; then
        export LAUNCHPAD_ORIGINAL_PATH="$PATH"
    else
        # PATH looks corrupted, use standard system paths
        export LAUNCHPAD_ORIGINAL_PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
        export PATH="$LAUNCHPAD_ORIGINAL_PATH"
    fi
fi

# Ensure critical system paths are always in PATH (for basic commands like bash, grep, etc.)
__launchpad_ensure_system_path() {
    local system_paths="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

    # Use POSIX-compatible loop instead of bash arrays
    local OLD_IFS="$IFS"
    IFS=':'
    for sys_dir in $system_paths; do
        if [[ -d "$sys_dir" && ":$PATH:" != *":$sys_dir:"* ]]; then
            export PATH="$PATH:$sys_dir"
        fi
    done
    IFS="$OLD_IFS"
}

# Always ensure system paths are available
__launchpad_ensure_system_path

# Call global setup functions on load
__launchpad_setup_global_deps
__launchpad_ensure_global_path

# Clear command hash table on initial load to ensure fresh command lookup
hash -r 2>/dev/null || true

# Run on initial load (but only if we're in an interactive shell)
if [[ $- == *i* ]]; then
    __launchpad_chpwd
fi
`.trim()
}

export function datadir(): string {
  return platform_data_home_default()
}

function platform_data_home_default(): string {
  return join(process.env.HOME || '~', '.local', 'share', 'launchpad')
}
