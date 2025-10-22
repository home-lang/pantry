import type { Command } from '../cli/types'
import process from 'node:process'

const cmd: Command = {
  name: 'find-project-root',
  description: 'Find project root directory (fast detection with shell fallback)',
  async run({ argv }) {
    const { findProjectRoot } = await import('../dev/benchmark')
    const path = await import('node:path')

    const startDir = argv[0] ? path.resolve(argv[0]) : process.cwd()
    try {
      const result = findProjectRoot(startDir)
      if (result) {
        // eslint-disable-next-line no-console
        console.log(result)
        return 0
      }
      return 1
    }
    catch {
      return 1
    }
  },
}

export default cmd
