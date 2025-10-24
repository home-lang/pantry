import type { Command } from '../cli/types'
import { enableService } from '../services'

function parseArgs(argv: string[]): { service?: string } {
  const args = argv.filter(a => !a.startsWith('--'))
  return { service: args[0] }
}

const cmd: Command = {
  name: 'enable',
  description: 'Enable a service for auto-start on boot',
  async run({ argv }): Promise<number> {
    const { service } = parseArgs(argv)
    if (!service) {
      console.error('No service specified')
      return 1
    }
    const success = await enableService(service)
    return success ? 0 : 1
  },
}

export default cmd
