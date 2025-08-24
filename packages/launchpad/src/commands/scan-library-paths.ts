import type { Command } from '../cli/types'

const cmd: Command = {
  name: 'scan-library-paths',
  description: 'Fast scan for library paths in environment directory',
  async run({ argv }) {
    const { scanLibraryPaths } = await import('../dev/path-scanner')
    const envDir = argv[0]
    try {
      const paths = await scanLibraryPaths(envDir)
      console.log(paths.join(':'))
      return 0
    }
    catch {
      return 1
    }
  },
}

export default cmd
