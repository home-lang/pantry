import type { Command } from '../../cli/types'

const cmd: Command = {
  name: 'env:clean',
  description: 'Clean up old or unused development environments',
  async run({ argv, options }) {
    const { cleanEnvironments } = await import('../../env')

    // Strongly type options
    interface Opts { dryRun?: boolean; force?: boolean; verbose?: boolean; olderThan?: number | string }
    const opts = (options ?? {}) as Opts

    const dryRun = typeof opts.dryRun === 'boolean' ? opts.dryRun : argv.includes('--dry-run')
    const force = typeof opts.force === 'boolean' ? opts.force : argv.includes('--force')
    const verbose = typeof opts.verbose === 'boolean' ? opts.verbose : argv.includes('--verbose')

    let olderThan = typeof opts.olderThan === 'number' ? String(opts.olderThan)
      : typeof opts.olderThan === 'string' ? opts.olderThan
      : '30'
    if (!opts.olderThan) {
      const idx = argv.indexOf('--older-than')
      if (idx !== -1 && argv[idx + 1])
        olderThan = argv[idx + 1]
    }

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
