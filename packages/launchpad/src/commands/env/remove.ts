import type { Command } from '../../cli/types'

const cmd: Command = {
  name: 'env:remove',
  description: 'Remove a specific development environment or all environments',
  async run({ argv, options }) {
    const { removeEnvironment, removeAllEnvironments } = await import('../../env')

    // Strongly type options
    interface Opts { hash?: string, force?: boolean, verbose?: boolean, all?: boolean }
    const opts = (options ?? {}) as Opts

    const nonFlags = argv.filter(a => !a.startsWith('--'))
    const hash = typeof opts.hash === 'string' ? opts.hash : nonFlags[0]
    const force = typeof opts.force === 'boolean' ? opts.force : argv.includes('--force')
    const verbose = typeof opts.verbose === 'boolean' ? opts.verbose : argv.includes('--verbose')
    const all = typeof opts.all === 'boolean' ? opts.all : argv.includes('--all')

    try {
      if (all) {
        await removeAllEnvironments({ force, verbose })
        return 0
      }

      if (hash) {
        await removeEnvironment(hash, { force, verbose })
        return 0
      }

      console.error('Either provide a hash or use --all to remove all environments')
      console.warn('\nUsage:')
      console.warn('  launchpad env:remove <hash>')
      console.warn('  launchpad env:remove --all')
      return 1
    }
    catch (error) {
      console.error('Failed to remove environment(s):', error instanceof Error ? error.message : String(error))
      return 1
    }
  },
}

export default cmd
