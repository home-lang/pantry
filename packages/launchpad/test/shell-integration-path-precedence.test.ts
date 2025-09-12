import { describe, expect, it } from 'bun:test'
import { shellcode } from '../src/dev/shellcode'

describe('Shell Integration PATH Precedence', () => {
  it('sets LAUNCHPAD_ENV_BIN_PATH correctly', () => {
    const code = shellcode(true)

    // Check for environment bin path export
    expect(code).toContain('export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"')
  })

  it('manages PATH correctly for environment activation', () => {
    const code = shellcode(true)

    // Check for PATH management
    expect(code).toContain('export PATH="$env_dir/bin:$PATH"')
    
    // Check for environment bin path export
    expect(code).toContain('export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"')
    
    // Check for PATH cleanup on deactivation
    expect(code).toContain('export PATH=$(echo "$PATH" | sed "s|$LAUNCHPAD_ENV_BIN_PATH:||g"')
  })

  it('sets up directory change hooks for zsh and bash', () => {
    const code = shellcode(true)

    // Check for zsh hook registration
    expect(code).toContain('chpwd_functions+=(__launchpad_chpwd)')
    
    // Check for bash PROMPT_COMMAND hook
    expect(code).toContain('PROMPT_COMMAND="__launchpad_prompt_command')
    
    // Check that hooks call the environment switching function
    expect(code).toContain('__launchpad_switch_environment')
  })
})
