import type { Command } from '../cli/types'

const cmd: Command = {
  name: 'update',
  description: 'Update packages to newer versions',
  async run({ argv }) {
    const { update } = await import('../package')
    const { config } = await import('../config')

    const packages: string[] = []
    let latest = false
    let dryRun = false

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i]
      if (arg === '--latest')
        latest = true
      else if (arg === '--dry-run')
        dryRun = true
      else if (arg === '--verbose')
        config.verbose = true
      else if (!arg.startsWith('--'))
        packages.push(arg)
    }

    await update(packages.length > 0 ? packages : undefined, { latest, dryRun })
    return 0
  },
}

export default cmd
