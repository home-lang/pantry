import type { Command } from '../cli/types'
import { stopService } from '../services'

function parseArgs(argv: string[]): { service?: string } {
  const args = argv.filter(a => !a.startsWith('--'))
  return { service: args[0] }
}

const cmd: Command = {
  name: 'stop',
  description: 'Stop a service',
  async run({ argv, options }): Promise<number> {
    interface Opts { service?: string }
    const o = (options ?? {}) as Opts
    const { service: parsedService } = parseArgs(argv)
    const service = typeof o.service === 'string' ? o.service : parsedService
    if (!service) {
      console.error('No service specified')
      return 1
    }
    const success = await stopService(service)
    return success ? 0 : 1
  },
}

export default cmd
