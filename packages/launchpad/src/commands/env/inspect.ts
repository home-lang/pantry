import type { Command } from '../../cli/types'

const cmd: Command = {
  name: 'env:inspect',
  description: 'Inspect a specific development environment',
  async run({ argv }) {
    const { inspectEnvironment } = await import('../../env')

    const nonFlags = argv.filter(a => !a.startsWith('--'))
    const hash = nonFlags[0]
    if (!hash) {
      console.error('Usage: launchpad env:inspect <hash> [--verbose] [--show-stubs]')
      return 1
    }

    const verbose = argv.includes('--verbose')
    const showStubs = argv.includes('--show-stubs')

    try {
      await inspectEnvironment(hash, { verbose, showStubs })
      return 0
    }
    catch (error) {
      console.error('Failed to inspect environment:', error instanceof Error ? error.message : String(error))
      return 1
    }
  },
}

export default cmd
