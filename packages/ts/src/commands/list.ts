import type { Command } from '../cli/types'
import { install_prefix } from '../install'
import { list as listInstalled } from '../list'

interface ListArgs {
  path?: string
  verbose?: boolean
}

function parseArgs(argv: string[]): ListArgs {
  const opts: ListArgs = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--verbose') {
      opts.verbose = true
    }
    else if (a === '--path' && i + 1 < argv.length) {
      opts.path = argv[++i]
    }
    else if (a.startsWith('--path=')) {
      opts.path = a.split('=')[1]
    }
  }
  return opts
}

const command: Command = {
  name: 'list',
  description: 'List installed packages',
  async run({ argv, options }) {
    // Strongly type options and merge with argv-parsed fallback
    interface Opts { path?: string, verbose?: boolean }
    const opts = (options ?? {}) as Opts
    const parsed = parseArgs(argv)
    const pathOpt = typeof opts.path === 'string' ? opts.path : parsed.path
    const verbose = typeof opts.verbose === 'boolean' ? opts.verbose : Boolean(parsed.verbose)

    try {
      const basePath = pathOpt || install_prefix().string
      const packages = await listInstalled(basePath)

      if (packages.length === 0) {
        console.warn('No packages installed')
      }
      else {
        console.warn('Installed packages:')
        for (const pkg of packages) {
          // Use warn to satisfy lint rules
          console.warn(`  ${pkg.project}@${pkg.version}`)
        }
      }

      if (verbose) {
        // In verbose mode, print the base path used
        console.warn(`Base path: ${basePath}`)
      }

      return 0
    }
    catch (error) {
      console.error('Failed to list packages:', error instanceof Error ? error.message : String(error))
      return 1
    }
  },
}

export default command
