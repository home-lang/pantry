import type { Command } from '../cli/types'
import { stopService } from '../services'

function parseArgs(argv: string[]): { service?: string } {
  const args = argv.filter(a => !a.startsWith('--'))
  return { service: args[0] }
}

const cmd: Command = {
  name: 'stop',
  description: 'Stop a service',
  async run({ argv }): Promise<number> {
    const { service } = parseArgs(argv)
    if (!service) {
      console.error('No service specified')
      return 1
    }
    const success = await stopService(service)
    return success ? 0 : 1
  },
}

export default cmd
