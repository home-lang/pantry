import { join } from 'node:path'
import process from 'node:process'
import { config } from '../config'

// Helper function to find the correct launchpad binary
function getLaunchpadBinary(): string {
  // Always use just 'launchpad' to allow local shims to work
  // The shell will find the appropriate binary in PATH (including ./launchpad)
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

  const verboseDefault = !!config.verbose

  return `
# MINIMAL LAUNCHPAD SHELL INTEGRATION - DEBUGGING VERSION
# This is a minimal version to isolate the hanging issue

# Exit early if shell integration is disabled or in test mode
if [[ "$LAUNCHPAD_DISABLE_SHELL_INTEGRATION" == "1"${testModeCheck} ]]; then
    return 0 2>/dev/null || exit 0
fi

# CRITICAL: Prevent infinite loops - if we're already processing, exit immediately
if [[ "$__LAUNCHPAD_PROCESSING" == "1" ]]; then
    return 0 2>/dev/null || exit 0
fi
export __LAUNCHPAD_PROCESSING=1

# Ensure we clean up the processing flag on exit
trap 'unset __LAUNCHPAD_PROCESSING' EXIT

# Basic shell integration with aggressive safeguards
if [[ "$LAUNCHPAD_VERBOSE" == "true" ]]; then
    printf "⏱️  [0s] Shell integration started for PWD=%s\\n" "$PWD" >&2
fi

# Step 1: Find project directory using our fast binary (with timeout)
project_dir=""
if timeout 0.5s ${launchpadBinary} dev:find-project-root "$PWD" 2>/dev/null; then
    project_dir=$(LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 timeout 0.5s ${launchpadBinary} dev:find-project-root "$PWD" 2>/dev/null || echo "")
fi

if [[ "$LAUNCHPAD_VERBOSE" == "true" ]]; then
    printf "⏱️  [0s] Project search completed: %s\\n" "\${project_dir:-none}" >&2
fi

# Step 2: If no project found, ensure global paths are available
if [[ -z "$project_dir" ]]; then
    # Add global paths if they exist
    global_bin="$HOME/.local/share/launchpad/global/bin"
    if [[ -d "$global_bin" && ":$PATH:" != *":$global_bin:"* ]]; then
        export PATH="$global_bin:$PATH"
        if [[ "$LAUNCHPAD_VERBOSE" == "true" ]]; then
            printf "⏱️  [0s] Global paths activated\\n" >&2
        fi
    fi
    return 0 2>/dev/null || exit 0
fi

# Step 3: For projects, activate environment (simplified, no hanging operations)
if [[ -n "$project_dir" ]]; then
    project_basename=$(basename "$project_dir")
    # Simple hash without calling external binary
    project_hash="\${project_basename}_$(echo "$project_dir" | cksum | cut -d' ' -f1)"
    env_dir="$HOME/.local/share/launchpad/envs/$project_hash"

    # If environment exists, activate it
    if [[ -d "$env_dir/bin" ]]; then
        export LAUNCHPAD_CURRENT_PROJECT="$project_dir"
        export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"
        export PATH="$env_dir/bin:$PATH"

        if [[ "$LAUNCHPAD_VERBOSE" == "true" ]]; then
            printf "✅ Environment activated for %s\\n" "$project_basename" >&2
        fi
    fi
fi

return 0 2>/dev/null || exit 0`
}

export function datadir(): string {
  return platform_data_home_default()
}

function platform_data_home_default(): string {
  return join(process.env.HOME || '~', '.local', 'share', 'launchpad')
}
