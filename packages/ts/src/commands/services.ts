import type { Command } from '../cli/types'
import process from 'node:process'

const cmd: Command = {
  name: 'services',
  aliases: ['service'],
  description: 'List all services and their status',
  async run({ argv }) {
    // Delegate to status without a service name
    const mod = await import('./status')
    return mod.default.run({ argv, env: process.env })
  },
}

export default cmd
