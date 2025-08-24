import type { Command } from '../../cli/types'

const cmd: Command = {
  name: 'env:list',
  description: 'List all development environments',
  async run({ argv, options }) {
    const { listEnvironments } = await import('../../env')

    // Strongly type options
    interface Opts { verbose?: boolean; format?: string }
    const opts = (options ?? {}) as Opts

    // Prefer structured options, fallback to argv flags
    const verbose = typeof opts.verbose === 'boolean' ? opts.verbose : argv.includes('--verbose')
    let format = typeof opts.format === 'string' ? opts.format : 'table'
    if (!opts.format) {
      const fmtIdx = argv.indexOf('--format')
      if (fmtIdx !== -1 && argv[fmtIdx + 1]) format = argv[fmtIdx + 1]
    }

    try {
      await listEnvironments({ verbose, format })
      return 0
    }
    catch (error) {
      console.error('Failed to list environments:', error instanceof Error ? error.message : String(error))
      return 1
    }
  },
}

export default cmd
