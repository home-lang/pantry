import type { Command } from '../cli/types'
import { config, defaultConfig } from '../config'

function parseArgs(argv: string[]): { get?: string, json?: boolean, help?: boolean } {
  const opts: { get?: string, json?: boolean, help?: boolean } = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--help' || a === '-h') opts.help = true
    else if (a === '--json') opts.json = true
    else if (a.startsWith('--get=')) opts.get = a.slice('--get='.length)
    else if (a === '--get' && i + 1 < argv.length) opts.get = argv[++i]
  }
  return opts
}

function getByPath(obj: any, path: string): any {
  const parts = path.split('.').filter(Boolean)
  let cur: any = obj
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p]
    else return undefined
  }
  return cur
}

const command: Command = {
  name: 'config',
  description: 'Inspect Launchpad configuration (read-only)',
  async run(ctx) {
    const { get, json, help } = parseArgs(ctx.argv)

    if (help) {
      console.error('Usage: launchpad config [--get <path>] [--json]')
      console.error('Examples:')
      console.error('  launchpad config')
      console.error('  launchpad config --get installPath')
      console.error('  launchpad config --get services.php.version --json')
      return 0
    }

    if (get) {
      const val = getByPath(config, get)
      const out = val === undefined ? getByPath(defaultConfig, get) : val
      if (json) {
        console.warn(JSON.stringify(out))
      } else if (typeof out === 'object') {
        console.warn(JSON.stringify(out, null, 2))
      } else {
        console.warn(String(out))
      }
      return 0
    }

    // Print merged effective config (shallow pretty)
    const effective = { ...defaultConfig, ...config }
    if (json) {
      console.warn(JSON.stringify(effective))
    } else {
      console.warn(JSON.stringify(effective, null, 2))
    }
    return 0
  },
}

export default command
