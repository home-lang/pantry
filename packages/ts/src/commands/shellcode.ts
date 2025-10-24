/* eslint-disable no-console */
import type { Command } from '../cli/types'

const command: Command = {
  name: 'shellcode',
  description: 'Generate shell integration code',
  async run({ argv }) {
    const testMode = argv.includes('--test-mode')
    // Use computed dynamic import to prevent Bun from pre-parsing this module at CLI startup
    const mod = await import('../dev/shellcode')
    const { shellcode } = mod as { shellcode: (testMode?: boolean) => string }
    console.log(shellcode(testMode))
    return 0
  },
}

export default command
