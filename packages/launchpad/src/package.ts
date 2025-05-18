#!/usr/bin/env bun
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { EOL, platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { install, install_prefix } from './install'
import { ls, outdated } from './list'
import { Path } from './path'
import { get_pkgx, query_pkgx } from './pkgx'
import { uninstall } from './uninstall'

/**
 * Process command-line arguments and execute the appropriate command
 */
export async function run(args: string[] = process.argv.slice(2)): Promise<void> {
  const parsedArgs = parseArgs({
    args,
    options: {
      help: {
        type: 'boolean',
        short: 'h',
      },
      version: {
        type: 'boolean',
        short: 'v',
      },
      pin: {
        type: 'boolean',
        short: 'p',
      },
    },
    allowPositionals: true,
  })

  const positionals = parsedArgs.positionals || []

  if (parsedArgs.values.help || positionals[0] === 'help') {
    const command = spawnSync('pkgx', [
      'glow',
      'https://raw.githubusercontent.com/stacksjs/launchpad/main/README.md',
    ], { stdio: 'inherit' })

    process.exit(command.status ?? 0)
  }
  else if (parsedArgs.values.version) {
    // eslint-disable-next-line no-console
    console.log('launchpad 0.0.0+dev')
    return
  }

  const subCommand = positionals[0]
  const subCommandArgs = positionals.slice(1)

  switch (subCommand) {
    case 'install':
    case 'i':
      {
        const installDir = install_prefix().string
        const results = await install(subCommandArgs, installDir)
        // eslint-disable-next-line no-console
        console.log(results.join('\n'))
      }
      break

    case 'local-install':
    case 'li':
      if (install_prefix().string !== '/usr/local') {
        await install(subCommandArgs, Path.home().join('.local').string)
      }
      else {
        console.error('deprecated: use `launchpad install` without `sudo` instead')
      }
      break

    case 'stub':
    case 'shim':
      await shim(subCommandArgs, install_prefix().string)
      break

    case 'uninstall':
    case 'rm':
      {
        let allSuccess = true
        for (const arg of subCommandArgs) {
          if (!await uninstall(arg)) {
            allSuccess = false
          }
        }
        process.exit(allSuccess ? 0 : 1)
      }
      break

    case 'list':
    case 'ls':
      for await (const path of ls()) {
        // eslint-disable-next-line no-console
        console.log(path)
      }
      break

    case 'update':
    case 'up':
    case 'upgrade':
      await update()
      break

    case 'pin':
      console.error('\x1B[31mU EARLY! soz, not implemented\x1B[0m')
      process.exit(1)
      break

    case 'outdated':
      await outdated()
      break

    default:
      if (args.length === 0) {
        console.error('https://github.com/stacksjs/launchpad')
      }
      else {
        console.error('invalid usage')
      }
      process.exit(2)
  }
}

/**
 * Create shims (stubs) for packages
 */
export async function shim(args: string[], basePath: string): Promise<void> {
  const pkgx = get_pkgx()

  fs.mkdirSync(path.join(basePath, 'bin'), { recursive: true })

  const json = (await query_pkgx(pkgx, args))[0]

  // This is simplified from the original implementation as we're missing some functions
  for (const pkg of json.pkgs) {
    for (const bin of ['bin', 'sbin']) {
      const bin_prefix = pkg.path.join(bin)
      if (!bin_prefix.exists())
        continue

      for (const entry of fs.readdirSync(bin_prefix.string, { withFileTypes: true })) {
        if (!entry.isFile() && !entry.isSymbolicLink())
          continue

        const name = entry.name
        const quick_shim = platform() === 'darwin' && pkgx === '/usr/local/bin/pkgx'
        const interpreter = quick_shim
          ? '/usr/local/bin/pkgx'
          : '/usr/bin/env -S pkgx'

        const pkgArg = `${pkg.pkg.project}`
        const shim = `#!${interpreter} --shebang --quiet +${pkgArg} -- ${name}`

        const binPath = path.join(basePath, 'bin', name)
        if (fs.existsSync(binPath)) {
          fs.unlinkSync(binPath)
        }

        // Without the newline zsh on macOS fails to invoke the interpreter with a bad interpreter error
        fs.writeFileSync(binPath, shim + EOL, { mode: 0o755 })
        // eslint-disable-next-line no-console
        console.log(binPath)
      }
    }
  }
}

/**
 * Update packages
 */
export async function update(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Updating packages...')
  // eslint-disable-next-line no-console
  console.log('This feature is simplified in the current implementation.')

  // A simplified implementation since we're missing some of the original functions
}
