/* eslint-disable no-console */
import type { Command } from '../cli/types'
import { formatCategoriesList, formatPackagesByCategory, formatTagSearchResults, getAvailableCategories, getPackagesByCategory, searchPackagesByTag } from '../tags'

function parseArgs(argv: string[]): { cmd?: 'list' | 'search', term?: string, options: Record<string, string | boolean> } {
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

  // Interpret subcommands
  let cmd: 'list' | 'search' | undefined
  let term: string | undefined
  if (args[0] === 'search') {
    cmd = 'search'
    term = args[1]
  }
  else {
    cmd = 'list'
  }
  return { cmd, term, options }
}

const command: Command = {
  name: 'tags',
  description: 'List package categories (tags) or search by tag',
  async run(ctx) {
    const { cmd, term, options } = parseArgs(ctx.argv)
    const compact = Boolean(options.compact)

    if (cmd === 'search') {
      if (!term) {
        console.error('Usage: launchpad tags search <term> [--compact] [--no-group]')
        return 1
      }
      const groupByCategory = !options['no-group']
      const pkgs = searchPackagesByTag(term)
      console.log(formatTagSearchResults(term, pkgs, { compact, groupByCategory }))
      return 0
    }

    // List categories or packages in a category
    const category = typeof options.category === 'string' ? String(options.category) : undefined
    if (category) {
      const showPrograms = !options['no-programs']
      const showVersions = !options['no-versions']
      const pkgs = getPackagesByCategory(category)
      console.log(formatPackagesByCategory(category, pkgs, { compact, showPrograms, showVersions }))
      return 0
    }

    // Default: list categories
    const cats = getAvailableCategories()
    console.log(formatCategoriesList(cats))
    return 0
  },
}

export default command
