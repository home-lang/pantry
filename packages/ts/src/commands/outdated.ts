import type { Command } from '../cli/types'

const cmd: Command = {
  name: 'outdated',
  description: 'Check for outdated packages',
  async run() {
    const { outdated } = await import('../list')
    await outdated()
    return 0
  },
}

export default cmd
