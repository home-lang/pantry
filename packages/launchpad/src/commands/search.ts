/* eslint-disable no-console */
import type { Command } from '../cli/types'
import { formatSearchResults, searchPackages } from '../search'

function parseArgs(argv: string[]): { term?: string, opts: Record<string, string | boolean> } {
  const opts: Record<string, string | boolean> = {}
  const args: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const [k, v] = a.split('=')
      const key = k.replace(/^--/, '')
      if (typeof v !== 'undefined') {
        opts[key] = v
      }
      else if (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
        opts[key] = argv[++i]
      }
      else {
        opts[key] = true
      }
    }
    else if (a === '-c') {
      opts.compact = true
    }
    else {
      args.push(a)
    }
  }
  return { term: args[0], opts }
}

const command: Command = {
  name: 'search',
  description: 'Search for packages by name, domain, description, or program',
  async run(ctx) {
    const { term, opts } = parseArgs(ctx.argv)
    if (!term) {
      console.error('Usage: launchpad search <term> [--limit N] [--compact] [--no-programs] [--no-versions] [--case-sensitive]')
      return 1
    }

    const limit = opts.limit ? Number(opts.limit) : 50
    const includePrograms = !opts['no-programs']
    const caseSensitive = Boolean(opts['case-sensitive'])
    const compact = Boolean(opts.compact)
    const showVersions = !opts['no-versions']

    const results = searchPackages(term, { limit, includePrograms, caseSensitive })
    const out = formatSearchResults(results, { showPrograms: includePrograms, showVersions, compact, searchTerm: term })
    console.log(out)
    return 0
  },
}

export default command
