import type { Command } from '../cli/types'

const cmd: Command = {
  name: 'scan-global-paths',
  description: 'Fast scan for global binary paths',
  async run({ argv }) {
    const { scanGlobalPaths } = await import('../dev/path-scanner')
    const globalDir = argv[0]
    try {
      const paths = await scanGlobalPaths(globalDir)
      console.log(paths.join(' '))
      return 0
    }
    catch {
      return 1
    }
  },
}

export default cmd
