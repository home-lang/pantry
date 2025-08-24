/* eslint-disable no-console */
import type { Command } from '../cli/types'
import { formatPackageInfo, formatPackageNotFound, getDetailedPackageInfo, packageExists } from '../info'

function parseArgs(argv: string[]): { pkg?: string, options: Record<string, string | boolean> } {
  const options: Record<string, string | boolean> = {}
  const args: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const [k, v] = a.split('=')
      const key = k.replace(/^--/, '')
      if (typeof v !== 'undefined') {
        options[key] = v
      }
      else if (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
        options[key] = argv[++i]
      }
      else {
        options[key] = true
      }
    }
    else if (a === '-c') {
      options.compact = true
    }
    else {
      args.push(a)
    }
  }
  return { pkg: args[0], options }
}

const command: Command = {
  name: 'info',
  description: 'Show detailed info about a package',
  async run(ctx) {
    const { pkg, options } = parseArgs(ctx.argv)
    if (!pkg) {
      console.error('Usage: launchpad info <package> [--compact] [--max-versions N] [--no-versions] [--no-programs] [--no-dependencies] [--no-companions]')
      return 1
    }

    if (!packageExists(pkg)) {
      console.log(await formatPackageNotFound(pkg))
      return 1
    }

    const includeVersions = !options['no-versions']
    const maxVersions = options['max-versions'] ? Number(options['max-versions']) : 10
    const showPrograms = !options['no-programs']
    const showDependencies = !options['no-dependencies']
    const showCompanions = !options['no-companions']
    const compact = Boolean(options.compact)

    const info = getDetailedPackageInfo(pkg, { includeVersions, maxVersions })
    if (!info) {
      console.log(await formatPackageNotFound(pkg))
      return 1
    }

    const out = formatPackageInfo(info, { showVersions: includeVersions, showPrograms, showDependencies, showCompanions, compact })
    console.log(out)
    return 0
  },
}

export default command
