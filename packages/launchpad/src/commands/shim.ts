import type { Command } from '../cli/types'
import { config, defaultConfig } from '../config'
import { create_shim } from '../shim'

function parseArgs(argv: string[]): { pkgs: string[], opts: Record<string, string | boolean> } {
  const opts: Record<string, string | boolean> = {}
  const pkgs: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const [k, v] = a.split('=')
      const key = k.replace(/^--/, '')
      if (typeof v !== 'undefined') {
        opts[key] = v
      }
      else if (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
        i += 1
        opts[key] = argv[i]
      }
      else {
        opts[key] = true
      }
    }
    else if (a === '-v') {
      opts.verbose = true
    }
    else {
      pkgs.push(a)
    }
  }
  return { pkgs, opts }
}

const command: Command = {
  name: 'shim',
  description: 'Install packages and create shims into the shim directory',
  async run(ctx) {
    const { pkgs, opts } = parseArgs(ctx.argv)
    if (pkgs.length === 0) {
      console.error('Usage: launchpad shim <pkg...> [--verbose|-v] [--force] [--no-auto-path] [--shim-path <path>]')
      return 1
    }

    // Map flags to runtime config
    if (opts.verbose) {
      config.verbose = true
    }
    if (opts.force) {
      config.forceReinstall = true
    }
    if (opts['no-auto-path']) {
      config.autoAddToPath = false
    }
    if (typeof opts['shim-path'] === 'string') {
      config.shimPath = String(opts['shim-path'])
    }

    try {
      const basePath = (config.installPath ?? defaultConfig.installPath) ?? (process.env.HOME ? `${process.env.HOME}/.local` : '/usr/local')
      const created = await create_shim(pkgs, basePath)
      if (created.length > 0) {
        console.warn(`Created ${created.length} shims`)
        for (const s of created) {
          console.warn(`  ${s}`)
        }
      }
      return 0
    }
    catch (err) {
      console.error(err instanceof Error ? err.message : String(err))
      return 1
    }
  },
}

export default command
