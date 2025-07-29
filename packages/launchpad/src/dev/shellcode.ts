import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

// Helper function to find the correct launchpad binary
function getLaunchpadBinary(): string {
  // Check if we're running from a test environment
  if (typeof process !== 'undefined' && process.argv?.[1] && (process.argv[1].includes('.test.') || process.argv[1].includes('/test/'))) {
    return 'launchpad'
  }

  // Check if we're running from CLI script in development (bin/cli.ts)
  if (typeof process !== 'undefined' && process.argv?.[1] && process.argv[1].includes('/bin/cli.ts')) {
    // In development mode, return the full path to ensure we use the dev version
    return process.argv[1]
  }

  // Check if we're running from a compiled binary or Bun's internal filesystem
  if (typeof process !== 'undefined' && process.argv?.[1] && (process.argv[1].includes('launchpad') || process.argv[1].includes('$bunfs')) && !process.argv[1].includes('.test.') && !process.argv[1].includes('.ts')) {
    // When running from Bun's compiled binary, argv[1] might be internal like /$bunfs/root/launchpad
    // In this case, we should try to find the actual binary path

    // First, try common installation paths before using 'which' to avoid dev environment issues
    const installationPaths = [
      '/usr/local/bin/launchpad',
      `${process.env.HOME}/.bun/bin/launchpad`,
      `${process.env.HOME}/.local/bin/launchpad`,
    ]

    for (const installPath of installationPaths) {
      if (existsSync(installPath)) {
        return installPath
      }
    }

    // If no installation found, try 'which' as fallback with short timeout
    try {
      const whichResult = spawnSync('which', ['launchpad'], { encoding: 'utf8', timeout: 500 })
      if (whichResult.status === 0 && whichResult.stdout.trim()) {
        const whichPath = whichResult.stdout.trim()
        // Avoid relative paths from development environments
        if (!whichPath.startsWith('./') && !whichPath.includes('/packages/')) {
          return whichPath
        }
      }
    }
    catch {
      // Ignore errors from which command
    }

    // If argv[1] looks like a real path (not internal Bun filesystem), use it
    if (typeof process !== 'undefined' && process.argv?.[1] && !process.argv[1].includes('$bunfs') && !process.argv[1].includes('/$bunfs')) {
      return process.argv[1]
    }
  }

  // Check if we have the executable path from argv0
  if (typeof process !== 'undefined' && process.argv0 && process.argv0.includes('launchpad')) {
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

export function shellcode(testMode: boolean = false): string {
  // Use the same launchpad binary that's currently running
  const launchpadBinary = getLaunchpadBinary()
  const grepFilter = '/usr/bin/grep -v \'^$\' 2>/dev/null'

  const testModeCheck = testMode ? '' : ' || "$NODE_ENV" == "test"'

  // Use default shell message configuration
  const showMessages = (typeof process !== 'undefined' && process.env?.LAUNCHPAD_SHOW_ENV_MESSAGES !== 'false') ? 'true' : 'false'
  const activationMessage = ((typeof process !== 'undefined' && process.env?.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE) || '✅ Environment activated for \\033[3m$(basename "$project_dir")\\033[0m').replace('{path}', '$(basename "$project_dir")')
  const deactivationMessage = (typeof process !== 'undefined' && process.env?.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE) || 'Environment deactivated'

  return `
# Launchpad shell integration - Performance Optimized
# Exit early if shell integration is disabled or in test mode
if [[ "$LAUNCHPAD_DISABLE_SHELL_INTEGRATION" == "1"${testModeCheck} ]]; then
    return 0 2>/dev/null || exit 0
fi

# Additional safety check - exit if this is being called during CLI operations
if [[ "$*" == *"--version"* || "$*" == *"--help"* ]]; then
    return 0 2>/dev/null || exit 0
fi

# Performance optimization: aggressive caching with global path caching
__launchpad_cache_dir=""
__launchpad_cache_timestamp=0
__launchpad_setup_in_progress=""
__launchpad_timeout_count=0
__launchpad_env_ready_cache=""
__launchpad_env_ready_timestamp=0
__launchpad_global_setup_done=""

# Global path caching variables
__launchpad_global_paths_cache=""
__launchpad_global_paths_timestamp=0

# Ultra-fast environment activation cache (survives shell restarts)
__launchpad_persistent_cache_dir="$HOME/.cache/launchpad/shell_cache"
mkdir -p "$__launchpad_persistent_cache_dir" 2>/dev/null

# Environment variable optimization - batch export
__launchpad_set_env() {
    local env_file="$1"
    if [[ -f "$env_file" ]]; then
        # Use single eval for better performance
        eval "$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$env_file" | sed 's/^/export /')" 2>/dev/null || true
    fi
}

# Optimized PATH management with duplicate prevention
__launchpad_update_path() {
    local project_bin="$1"
    if [[ -d "$project_bin" ]]; then
        # Only update PATH if not already present
        if [[ ":$PATH:" != *":$project_bin:"* ]]; then
            export PATH="$project_bin:$PATH"
        fi
    fi
}

# Fast library path update for quick activation (no expensive find operations)
__launchpad_update_library_paths_fast() {
    local env_dir="$1"

    if [[ ! -d "$env_dir" ]]; then
        return 0
    fi

    # Build library paths from direct lib directories only (fast path)
    local lib_paths=""

    # Add direct lib directories only
    for lib_dir in "$env_dir/lib" "$env_dir/lib64"; do
        if [[ -d "$lib_dir" ]]; then
            if [[ -z "$lib_paths" ]]; then
                lib_paths="$lib_dir"
            else
                lib_paths="$lib_paths:$lib_dir"
            fi
        fi
    done

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

        # Handle existing library paths correctly
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

# Comprehensive library path management with deduplication
__launchpad_update_library_paths() {
    local env_dir="$1"

    if [[ ! -d "$env_dir" ]]; then
        return 0
    fi

    # Build library paths from environment directories
    local lib_paths=""

    # Add direct lib directories first
    for lib_dir in "$env_dir/lib" "$env_dir/lib64"; do
        if [[ -d "$lib_dir" ]]; then
            # Avoid duplicate paths in library path variables
            if [[ ":$lib_paths:" != *":$lib_dir:"* ]]; then
                if [[ -z "$lib_paths" ]]; then
                    lib_paths="$lib_dir"
                else
                    lib_paths="$lib_paths:$lib_dir"
                fi
            fi
        fi
    done

    # Scan for package-specific library directories efficiently
    if [[ -d "$env_dir" ]]; then
        # Filter out known non-package directories early
        while IFS= read -r -d '' domain_dir; do
            local domain_name=$(basename "$domain_dir")

            # Skip known non-package directories
            if [[ "$domain_name" != "bin" && "$domain_name" != "sbin" && "$domain_name" != "lib" && "$domain_name" != "lib64" && "$domain_name" != "share" && "$domain_name" != "include" && "$domain_name" != "etc" && "$domain_name" != "pkgs" && "$domain_name" != ".tmp" && "$domain_name" != ".cache" ]]; then
                # Find version directories and check for lib directories
                for version_dir in $(find "$domain_dir" -maxdepth 1 -name "v*" -type d 2>/dev/null); do
                    if [[ -d "$version_dir" ]]; then
                        for lib_dir in "$version_dir/lib" "$version_dir/lib64"; do
                            if [[ -d "$lib_dir" ]]; then
                                # Avoid duplicate paths in library path variables
                                if [[ ":$lib_paths:" != *":$lib_dir:"* ]]; then
                                    if [[ -z "$lib_paths" ]]; then
                                        lib_paths="$lib_dir"
                                    else
                                        lib_paths="$lib_paths:$lib_dir"
                                    fi
                                fi
                            fi
                        done
                    fi
                done
            fi
        done < <(find "$env_dir" -maxdepth 1 -type d -print0 2>/dev/null)
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

        # Handle existing library paths correctly
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

# Optimized global setup (run once per shell session)
__launchpad_setup_global_deps() {
    # Skip if already done in this shell session
    if [[ -n "$__launchpad_global_setup_done" ]]; then
        return 0
    fi

    # Check the standard global environment
    local global_env_dir="$HOME/.local/share/launchpad/global"
    if [[ -d "$global_env_dir/bin" ]]; then
        __launchpad_update_path "$global_env_dir/bin"
    fi
    if [[ -d "$global_env_dir/sbin" ]]; then
        __launchpad_update_path "$global_env_dir/sbin"
    fi

    # Setup library paths for global dependencies
    __launchpad_update_library_paths "$global_env_dir"

    # Mark global setup as complete
    __launchpad_global_setup_done="1"
}

# Fast global path cache (cached for entire shell session)
__launchpad_global_paths_cache=""
__launchpad_global_paths_loaded=""

# Fast global path management for quick activation (no expensive find operations)
__launchpad_ensure_global_path_fast() {
    # Skip if already loaded in this shell session
    if [[ -n "$__launchpad_global_paths_loaded" ]]; then
        return 0
    fi

    # Add standard global environment to PATH if it exists (fast path only)
    local global_env_dir="$HOME/.local/share/launchpad/global"
    if [[ -d "$global_env_dir/bin" ]]; then
        __launchpad_update_path "$global_env_dir/bin"
    fi
    if [[ -d "$global_env_dir/sbin" ]]; then
        __launchpad_update_path "$global_env_dir/sbin"
    fi

    # Mark as loaded for this shell session
    __launchpad_global_paths_loaded="1"

    # Always ensure critical system paths are available
    __launchpad_ensure_system_path
}

# Ultra-fast global path management with aggressive caching
__launchpad_ensure_global_path() {
    local current_time=$(date +%s)

    # Use cached global paths if they're less than 10 minutes old
    if [[ -n "$__launchpad_global_paths_cache" && $((current_time - __launchpad_global_paths_timestamp)) -lt 600 ]]; then
        # Apply cached paths quickly without expensive filesystem operations
        for cached_path in $__launchpad_global_paths_cache; do
            __launchpad_update_path "$cached_path"
        done
        __launchpad_ensure_system_path
        return 0
    fi

    # Rebuild global paths cache (expensive operation)
    local global_paths=""
    local global_env_dir="$HOME/.local/share/launchpad/global"

    # Discover all available global paths
    if [[ -d "$global_env_dir" ]]; then
        # Find global binary directories efficiently
        while IFS= read -r -d '' domain_dir; do
            local domain_name=$(basename "$domain_dir")

            # Skip known non-package directories
            if [[ "$domain_name" != "bin" && "$domain_name" != "sbin" && "$domain_name" != "lib" && "$domain_name" != "lib64" && "$domain_name" != "share" && "$domain_name" != "include" && "$domain_name" != "etc" && "$domain_name" != "pkgs" && "$domain_name" != ".tmp" && "$domain_name" != ".cache" ]]; then
                # Find version directories
                for version_dir in $(find "$domain_dir" -maxdepth 1 -name "v*" -type d 2>/dev/null | sort -V | tail -1); do
                    if [[ -d "$version_dir/bin" ]]; then
                        global_paths="$global_paths $version_dir/bin"
                    fi
                    if [[ -d "$version_dir/sbin" ]]; then
                        global_paths="$global_paths $version_dir/sbin"
                    fi
                done
            fi
        done < <(find "$global_env_dir" -maxdepth 1 -type d -print0 2>/dev/null)

        # Add standard global binary directories
        if [[ -d "$global_env_dir/bin" ]]; then
            global_paths="$global_paths $global_env_dir/bin"
        fi
        if [[ -d "$global_env_dir/sbin" ]]; then
            global_paths="$global_paths $global_env_dir/sbin"
        fi
    fi

    # Cache the discovered paths for future use
    __launchpad_global_paths_cache="$global_paths"
    __launchpad_global_paths_timestamp="$current_time"

    # Apply the discovered paths
    for global_path in $global_paths; do
        __launchpad_update_path "$global_path"
    done

    # Always ensure critical system paths are available
    __launchpad_ensure_system_path
}

# Optimized dependency file finder with aggressive caching
__launchpad_find_deps_file() {
    local dir="$1"
    local current_time=$(date +%s)

    # Use very aggressive cache (10 minutes for most directories, 2 hours for dev/test)
    local deps_cache_duration=600  # 10 minutes default
    if [[ "$dir" == *"test"* || "$dir" == *"launchpad"* || "$NODE_ENV" == "test" ]]; then
        deps_cache_duration=7200  # 2 hours for test/development environments
    fi

    if [[ -n "$__launchpad_cache_dir" && "$__launchpad_cache_dir" == "$dir" && $((current_time - __launchpad_cache_timestamp)) -lt $deps_cache_duration ]]; then
        echo "$__launchpad_cache_dir"
        return 0
    fi

    # Clear cache for new search
    __launchpad_cache_dir=""
    __launchpad_cache_timestamp=0

    while [[ "$dir" != "/" ]]; do
        # Check Launchpad-specific dependency files first (highest priority)
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

        # Check Node.js/JavaScript projects
        if [[ -f "$dir/package.json" ]]; then
            __launchpad_cache_dir="$dir"
            __launchpad_cache_timestamp=$current_time
            echo "$dir"
            return 0
        fi

        # Check Python projects
        for file in "pyproject.toml" "requirements.txt" "setup.py" "Pipfile" "Pipfile.lock"; do
            if [[ -f "$dir/$file" ]]; then
                __launchpad_cache_dir="$dir"
                __launchpad_cache_timestamp=$current_time
                echo "$dir"
                return 0
            fi
        done

        # Check Rust projects
        if [[ -f "$dir/Cargo.toml" ]]; then
            __launchpad_cache_dir="$dir"
            __launchpad_cache_timestamp=$current_time
            echo "$dir"
            return 0
        fi

        # Check Go projects
        for file in "go.mod" "go.sum"; do
            if [[ -f "$dir/$file" ]]; then
                __launchpad_cache_dir="$dir"
                __launchpad_cache_timestamp=$current_time
                echo "$dir"
                return 0
            fi
        done

        # Check Ruby projects
        if [[ -f "$dir/Gemfile" ]]; then
            __launchpad_cache_dir="$dir"
            __launchpad_cache_timestamp=$current_time
            echo "$dir"
            return 0
        fi

        # Check Deno projects
        for file in "deno.json" "deno.jsonc"; do
            if [[ -f "$dir/$file" ]]; then
                __launchpad_cache_dir="$dir"
                __launchpad_cache_timestamp=$current_time
                echo "$dir"
                return 0
            fi
        done

        # Check GitHub Actions
        for file in "action.yml" "action.yaml"; do
            if [[ -f "$dir/$file" ]]; then
                __launchpad_cache_dir="$dir"
                __launchpad_cache_timestamp=$current_time
                echo "$dir"
                return 0
            fi
        done

        # Check Kubernetes/Docker projects
        for file in "skaffold.yaml" "skaffold.yml"; do
            if [[ -f "$dir/$file" ]]; then
                __launchpad_cache_dir="$dir"
                __launchpad_cache_timestamp=$current_time
                echo "$dir"
                return 0
            fi
        done

        # Check version control files
        for file in ".nvmrc" ".node-version" ".ruby-version" ".python-version" ".terraform-version"; do
            if [[ -f "$dir/$file" ]]; then
                __launchpad_cache_dir="$dir"
                __launchpad_cache_timestamp=$current_time
                echo "$dir"
                return 0
            fi
        done

        # Check package manager files
        for file in "yarn.lock" "bun.lockb" ".yarnrc"; do
            if [[ -f "$dir/$file" ]]; then
                __launchpad_cache_dir="$dir"
                __launchpad_cache_timestamp=$current_time
                echo "$dir"
                return 0
            fi
        done

        dir="$(/usr/bin/dirname "$dir")"
    done

    return 1
}

# Ultra-fast project change handler with aggressive caching
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

            # Ultra-fast activation: compute environment path and check if ready
            local project_hash
            project_hash=$(echo -n "$project_dir" | sha256sum 2>/dev/null | cut -d' ' -f1 | cut -c1-8) || project_hash="default"
            local env_dir="$HOME/.local/share/launchpad/envs/$project_hash"

            # Check persistent cache first (instant activation)
            local cache_file="$__launchpad_persistent_cache_dir/env_cache_$(echo -n "$env_dir" | sha256sum 2>/dev/null | cut -d' ' -f1 | cut -c1-16)"
            local current_time=$(date +%s)
            local cache_duration=1800  # 30 minutes for shell integration

            # Use longer cache durations for test environments
            if [[ "$project_dir" == *"test"* || "$project_dir" == *"launchpad"* || "$NODE_ENV" == "test" ]]; then
                cache_duration=3600  # 1 hour for test and development environments
            fi

            if [[ -f "$cache_file" ]]; then
                local cache_file_time=$(stat -c %Y "$cache_file" 2>/dev/null || stat -f %m "$cache_file" 2>/dev/null || echo 0)
                if [[ $((current_time - cache_file_time)) -lt $cache_duration && -d "$env_dir/bin" ]]; then
                    # Instant activation from persistent cache
                    export PATH="$env_dir/bin:$LAUNCHPAD_ORIGINAL_PATH"
                    __launchpad_update_library_paths_fast "$env_dir"
                    __launchpad_ensure_global_path_fast
                    __launchpad_ensure_system_path
                    hash -r 2>/dev/null || true

                    if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-${showMessages}\}" != "false" ]]; then
                        printf "${activationMessage}\\n" >&2
                    fi
                    return 0
                fi
            fi

            # If environment exists and has binaries, activate quickly
            # use glob expansion which is faster than ls
            if [[ -d "$env_dir/bin" ]] && [[ -n $(echo "$env_dir/bin"/*) && $(echo "$env_dir/bin"/*) != "$env_dir/bin/*" ]] && [[ -d "$env_dir/pkgs" || -f "$env_dir/.launchpad_ready" ]]; then
                export PATH="$env_dir/bin:$LAUNCHPAD_ORIGINAL_PATH"
                __launchpad_update_library_paths_fast "$env_dir"
                __launchpad_ensure_global_path_fast
                __launchpad_ensure_system_path
                hash -r 2>/dev/null || true

                # Update persistent cache
                mkdir -p "$(dirname "$cache_file")" 2>/dev/null
                touch "$cache_file" 2>/dev/null

                if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-${showMessages}\}" != "false" ]]; then
                    printf "${activationMessage}\\n" >&2
                fi
                return 0
            fi

            # Continue with setup

            # Mark setup as in progress
            __launchpad_setup_in_progress="$project_dir"

                        # Show immediate feedback
            if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-${showMessages}\}" != "false" ]]; then
                printf "🔧 Setting up environment for \\033[3m$(basename "$project_dir")\\033[0m...\\r" >&2
            fi

            # Optimize environment setup with shorter timeout and shell-only mode
            local env_output
            local setup_exit_code=0

            # Ensure global dependencies are available first
            __launchpad_setup_global_deps

                                    # Run environment setup without timeout - let it take as long as needed
            local temp_file=$(mktemp)

            # Run with real-time progress display - show progress on stderr, capture shell code on stdout
            if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-${showMessages}\}" != "false" ]]; then
                # Show progress in real-time while capturing output
                ${launchpadBinary} dev "$project_dir" --shell > "$temp_file"
            else
                # Quiet mode - suppress all output
                ${launchpadBinary} dev "$project_dir" --shell --quiet > "$temp_file" 2>/dev/null
            fi
            setup_exit_code=$?

            # Extract shell code from output
            env_output=$(cat "$temp_file" | ${grepFilter})
            rm -f "$temp_file" 2>/dev/null || true

            # Clear the in-progress flag
            __launchpad_setup_in_progress=""

            if [[ $setup_exit_code -eq 130 ]]; then
                # User interrupted with Ctrl+C
                if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-${showMessages}\}" != "false" ]]; then
                    printf "\\r\\033[K⚠️  Environment setup cancelled\\n" >&2
                fi
                return 130
            elif [[ $setup_exit_code -eq 0 ]]; then
                # Success

                # Execute the environment setup if we have output
                if [[ -n "$env_output" ]]; then
                    eval "$env_output" 2>/dev/null || true
                fi

                # Ensure global dependencies are still in PATH after project setup
                __launchpad_ensure_global_path
                __launchpad_ensure_system_path

                # Clear command hash table to ensure commands are found in new PATH
                hash -r 2>/dev/null || true

                # Create persistent cache file for instant future activation
                touch "$cache_file" 2>/dev/null

                # Show clean activation message
                if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-${showMessages}\}" != "false" ]]; then
                    printf "\\r\\033[K${activationMessage}\\n" >&2
                fi
            else
                # Setup failed - try basic activation if environment exists
                if [[ -d "$env_dir/bin" ]]; then
                    __launchpad_update_path "$env_dir/bin"
                    __launchpad_update_library_paths "$env_dir"
                    __launchpad_ensure_global_path
                    __launchpad_ensure_system_path
                    hash -r 2>/dev/null || true

                    if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-${showMessages}\}" != "false" ]]; then
                        printf "\\r\\033[K${activationMessage}\\n" >&2
                    fi
                else
                    # Clear any progress message on failure
                    if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-${showMessages}\}" != "false" ]]; then
                        printf "\\r\\033[K" >&2
                    fi
                fi
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

            # Clean up library path variables completely
            unset LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH
            unset LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH
            unset LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH

            # Show deactivation message
            if [[ "\$\{LAUNCHPAD_SHOW_ENV_MESSAGES:-${showMessages}\}" != "false" ]]; then
                printf "${deactivationMessage}\\n" >&2
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

# Optimized hook setup (only if shell integration is enabled)
if [[ "$LAUNCHPAD_DISABLE_SHELL_INTEGRATION" != "1" ]]; then
    if [[ -n "$ZSH_VERSION" ]]; then
        autoload -U add-zsh-hook
        add-zsh-hook chpwd __launchpad_chpwd
    elif [[ -n "$BASH_VERSION" ]]; then
        # For bash, use a more efficient approach
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
fi

# Initialize LAUNCHPAD_ORIGINAL_PATH if not set
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

# Ensure critical system paths are always in PATH with bash validation
__launchpad_ensure_system_path() {
    local system_paths="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

    # Use POSIX-compatible loop
    local OLD_IFS="$IFS"
    IFS=':'
    for sys_dir in $system_paths; do
        if [[ -d "$sys_dir" && ":$PATH:" != *":$sys_dir:"* ]]; then
            export PATH="$PATH:$sys_dir"
        fi
    done
    IFS="$OLD_IFS"

    # ensure system bash is accessible and prioritize system bash if needed
    if ! bash --version >/dev/null 2>&1; then
        # Try to find a working bash
        for bash_path in /bin/bash /usr/bin/bash /usr/local/bin/bash; do
            if [[ -x "$bash_path" ]]; then
                if [[ ":$PATH:" != *":$(dirname "$bash_path"):"* ]]; then
                    export PATH="$(dirname "$bash_path"):$PATH"
                fi
                break
            fi
        done
    fi
}

# Always ensure system paths are available
__launchpad_ensure_system_path

# One-time setup on shell initialization
__launchpad_setup_global_deps
__launchpad_ensure_global_path

# Clear command hash table on initial load
hash -r 2>/dev/null || true

# Run on initial load (interactive shells only)
if [[ $- == *i* && "$LAUNCHPAD_DISABLE_SHELL_INTEGRATION" != "1" ]]; then
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
