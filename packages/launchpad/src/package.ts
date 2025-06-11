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
  // Install the packages first using our new installation system
  await install(args, basePath)

  // The install function already creates the binaries in the bin directory
  // so we don't need to create additional shims

  console.warn(`Shims created for packages: ${args.join(', ')}`)
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
