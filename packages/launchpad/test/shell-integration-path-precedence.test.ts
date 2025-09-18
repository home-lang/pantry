import { describe, expect, it } from 'bun:test'
import { shellcode } from '../src/dev/shellcode'

describe('Shell Integration PATH Precedence', () => {
  it('includes env path precedence helper and sets LAUNCHPAD_ENV_BIN_PATH', () => {
    const code = shellcode(true)

    expect(code).toContain('export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"')
    expect(code).toContain('export PATH="$env_dir/bin:$PATH"')
  })

  it('calls precedence helper after each activation path', () => {
    const code = shellcode(true)

    // PATH cleanup and setup
    expect(code).toContain('export PATH=$(echo "$PATH" | sed "s|$env_dir/bin:||g"')
    expect(code).toContain('export PATH="$env_dir/bin:$PATH"')

    // Environment variables setup
    expect(code).toContain('export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"')
    expect(code).toContain('export LAUNCHPAD_CURRENT_PROJECT="$project_dir"')

    // Global paths added with lower priority
    expect(code).toContain('export PATH="$PATH:$local_bin"')
    expect(code).toContain('export PATH="$PATH:$global_bin"')
  })

  it('reasserts precedence on each prompt via precmd/PROMPT_COMMAND hook', () => {
    const code = shellcode(true)

    // Hook registration present for zsh
    expect(code).toContain('chpwd_functions+=(__launchpad_chpwd)')
    // Hook function definition
    expect(code).toContain('__launchpad_chpwd()')
    expect(code).toContain('__launchpad_switch_environment')
    
    // Bash hook registration
    expect(code).toContain('PROMPT_COMMAND="__launchpad_prompt_command;$PROMPT_COMMAND"')
    expect(code).toContain('__launchpad_prompt_command()')
  })
})
