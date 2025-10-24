import type { Command } from '../cli/types'
import { startService } from '../services'

function parseArgs(argv: string[]): { service?: string } {
  const args = argv.filter(a => !a.startsWith('--'))
  return { service: args[0] }
}

const cmd: Command = {
  name: 'start',
  description: 'Start a service',
  async run({ argv, options }): Promise<number> {
    interface Opts { service?: string }
    const o = (options ?? {}) as Opts
    const { service: parsedService } = parseArgs(argv)
    const service = typeof o.service === 'string' ? o.service : parsedService
    if (!service) {
      console.error('No service specified')
      return 1
    }
    const success = await startService(service)
    return success ? 0 : 1
  },
}

export default cmd
