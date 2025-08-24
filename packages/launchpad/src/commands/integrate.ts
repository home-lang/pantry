import type { Command } from '../cli/types'

const cmd: Command = {
  name: 'integrate',
  description: 'Install or uninstall shell integration hooks',
  async run({ argv }) {
    const { default: integrate } = await import('../dev/integrate')

    const uninstall = argv.includes('--uninstall')
    const dryrun = argv.includes('--dry-run')

    const operation = uninstall ? 'uninstall' : 'install'

    try {
      await integrate(operation, { dryrun })
      return 0
    }
    catch (error) {
      console.error('Failed to integrate shell hooks:', error instanceof Error ? error.message : String(error))
      return 1
    }
  },
}

export default cmd
