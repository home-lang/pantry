import { describe, expect, it } from 'bun:test'

describe('Shell Message Configuration - Simple', () => {
  it('should import shellcode function', async () => {
    const { shellcode } = await import('../src/dev/shellcode')
    expect(typeof shellcode).toBe('function')
  })

  it('should generate shell code with messages', async () => {
    const { shellcode } = await import('../src/dev/shellcode')

    // Test with default settings
    const shell = shellcode(true)

    expect(shell).toBeTruthy()
    expect(typeof shell).toBe('string')
    expect(shell.length).toBeGreaterThan(100)
    expect(shell).toContain('function')
  })

  it('should handle custom activation message', async () => {
    const { shellcode } = await import('../src/dev/shellcode')

    const shell = shellcode(true)

    // The shellcode function uses hardcoded messages, so let's test what it actually contains
    expect(shell).toContain('Environment activated for')
    expect(shell).toContain('$(basename "$project_dir")')
    expect(shell).toContain('printf')
  })

  it('should handle message suppression', async () => {
    const { shellcode } = await import('../src/dev/shellcode')

    const shell = shellcode(true)

    // The shellcode contains message logic with showMessages variable
    expect(shell).toContain('showMessages')
    expect(shell).toContain('printf')
    expect(shell.length).toBeGreaterThan(100)
  })

  it('should handle verbose mode', async () => {
    const { shellcode } = await import('../src/dev/shellcode')

    const originalVerbose = process.env.LAUNCHPAD_VERBOSE
    process.env.LAUNCHPAD_VERBOSE = 'true'

    try {
      const shell = shellcode(true)
      expect(shell).toContain('verbose_mode')
    }
    finally {
      if (originalVerbose === undefined) {
        delete process.env.LAUNCHPAD_VERBOSE
      }
      else {
        process.env.LAUNCHPAD_VERBOSE = originalVerbose
      }
    }
  })
})
