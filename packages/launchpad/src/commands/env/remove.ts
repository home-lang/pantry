import type { Command } from '../../cli/types'

const cmd: Command = {
  name: 'env:remove',
  description: 'Remove a specific development environment or all environments',
  async run({ argv }) {
    const { removeEnvironment, removeAllEnvironments } = await import('../../env')

    const nonFlags = argv.filter(a => !a.startsWith('--'))
    const hash = nonFlags[0]
    const force = argv.includes('--force')
    const verbose = argv.includes('--verbose')
    const all = argv.includes('--all')

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
      console.log('\nUsage:')
      console.log('  launchpad env:remove <hash>')
      console.log('  launchpad env:remove --all')
      return 1
    }
    catch (error) {
      console.error('Failed to remove environment(s):', error instanceof Error ? error.message : String(error))
      return 1
    }
  },
}

export default cmd
