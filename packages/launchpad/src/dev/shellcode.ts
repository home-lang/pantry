import { existsSync } from 'node:fs'
import path, { join } from 'node:path'
import process from 'node:process'
import { config } from '../config'

export function shellcode(): string {
  return `
# Launchpad shell integration
__launchpad_find_deps_file() {
    local dir="$1"
    while [[ "$dir" != "/" ]]; do
        for file in "$dir/dependencies.yaml" "$dir/dependencies.yml" "$dir/deps.yaml" "$dir/deps.yml" "$dir/pkgx.yaml" "$dir/pkgx.yml" "$dir/launchpad.yaml" "$dir/launchpad.yml"; do
            if [[ -f "$file" ]]; then
                echo "$file"
    return 0
    fi
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

            # Set up the environment and get the bin path
            local env_output
            env_output=$(/usr/local/bin/launchpad dev:dump "$project_dir" --shell 2>/dev/null | /usr/bin/grep -E '^(export|if|fi|#)')

            if [[ $? -eq 0 && -n "$env_output" ]]; then
                # Execute the environment setup
                eval "$env_output"

                # Clear command hash table to ensure commands are found in new PATH
                hash -r 2>/dev/null || true

                # Show activation message
                /usr/local/bin/launchpad dev:on "$project_dir" || true
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

            # Show deactivation message
            /usr/local/bin/launchpad dev:off || true

                        unset LAUNCHPAD_CURRENT_PROJECT
        fi
    fi
}

# Hook into directory changes
if [[ -n "$ZSH_VERSION" ]]; then
    autoload -U add-zsh-hook
    add-zsh-hook chpwd __launchpad_chpwd
elif [[ -n "$BASH_VERSION" ]]; then
    PROMPT_COMMAND="__launchpad_chpwd; $PROMPT_COMMAND"
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
