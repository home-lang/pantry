import type { Command } from '../../cli/types'

const cmd: Command = {
  name: 'env:clean',
  description: 'Clean up old or unused development environments',
  async run({ argv }) {
    const { cleanEnvironments } = await import('../../env')

    const dryRun = argv.includes('--dry-run')
    const force = argv.includes('--force')
    const verbose = argv.includes('--verbose')

    let olderThan = '30'
    const idx = argv.indexOf('--older-than')
    if (idx !== -1 && argv[idx + 1])
      olderThan = argv[idx + 1]

    try {
      await cleanEnvironments({
        dryRun,
        olderThanDays: Number.parseInt(olderThan, 10),
        force,
        verbose,
      })
      return 0
    }
    catch (error) {
      console.error('Failed to clean environments:', error instanceof Error ? error.message : String(error))
      return 1
    }
  },
}

export default cmd
