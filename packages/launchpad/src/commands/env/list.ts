import type { Command } from '../../cli/types'

const cmd: Command = {
  name: 'env:list',
  description: 'List all development environments',
  async run({ argv }) {
    const { listEnvironments } = await import('../../env')

    // Parse flags: --verbose, --format <type>
    const verbose = argv.includes('--verbose')
    let format = 'table'
    const fmtIdx = argv.indexOf('--format')
    if (fmtIdx !== -1 && argv[fmtIdx + 1]) format = argv[fmtIdx + 1]

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
