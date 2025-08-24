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
  async run({ argv, options }) {
    // Strongly type options and merge with argv-parsed fallback
    interface Opts {
      term?: string
      limit?: number | string
      compact?: boolean
      ['no-programs']?: boolean
      ['no-versions']?: boolean
      ['case-sensitive']?: boolean
    }
    const optsFromOptions = (options ?? {}) as Opts
    const { term: parsedTerm, opts } = parseArgs(argv)
    const term = typeof optsFromOptions.term === 'string' ? optsFromOptions.term : parsedTerm

    if (!term) {
      console.error('Usage: launchpad search <term> [--limit N] [--compact] [--no-programs] [--no-versions] [--case-sensitive]')
      return 1
    }

    const limit = typeof optsFromOptions.limit === 'number' ? optsFromOptions.limit
      : typeof optsFromOptions.limit === 'string' ? Number(optsFromOptions.limit)
      : opts.limit ? Number(opts.limit) : 50
    const includePrograms = optsFromOptions['no-programs'] === true ? false : !opts['no-programs']
    const caseSensitive = typeof optsFromOptions['case-sensitive'] === 'boolean' ? optsFromOptions['case-sensitive'] : Boolean(opts['case-sensitive'])
    const compact = typeof optsFromOptions.compact === 'boolean' ? optsFromOptions.compact : Boolean(opts.compact)
    const showVersions = optsFromOptions['no-versions'] === true ? false : !opts['no-versions']

    const results = searchPackages(term, { limit, includePrograms, caseSensitive })
    const out = formatSearchResults(results, { showPrograms: includePrograms, showVersions, compact, searchTerm: term })
    console.log(out)
    return 0
  },
}

export default command
