import { describe, expect, it } from 'bun:test'
import { shellcode } from '../src/dev/shellcode'

describe('Shell Integration PATH Precedence', () => {
  it('includes env path precedence helper and sets LAUNCHPAD_ENV_BIN_PATH', () => {
    const code = shellcode(true)

    expect(code).toContain('__launchpad_ensure_env_path_priority()')
    expect(code).toContain('export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"')
  })

  it('calls precedence helper after each activation path', () => {
    const code = shellcode(true)

    // Cached fast path
    expect(code).toContain('export PATH="$env_dir/bin:$LAUNCHPAD_ORIGINAL_PATH"')
    expect(code).toContain('__launchpad_ensure_env_path_priority')

    // Fast activation path when env exists
    expect(code).toContain('export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"')

    // Post-setup success path
    expect(code).toContain('export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"')

    // Fallback activation on setup failure
    expect(code).toContain('__launchpad_update_path "$env_dir/bin"')
    expect(code).toContain('__launchpad_ensure_env_path_priority')
  })

  it('reasserts precedence on each prompt via precmd/PROMPT_COMMAND hook', () => {
    const code = shellcode(true)

    // Hook registration present
    expect(code).toContain('add-zsh-hook precmd __launchpad_auto_refresh_check')
    // Auto-refresh function should invoke path precedence helper
    expect(code).toContain('__launchpad_auto_refresh_check()')
    expect(code).toContain('__launchpad_ensure_env_path_priority')
  })
})
