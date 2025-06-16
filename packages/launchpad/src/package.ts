#!/usr/bin/env bun
/* eslint-disable no-console */
import { spawnSync } from 'node:child_process'
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
        console.log(path)
      }
      break

    case 'update':
    case 'up':
    case 'upgrade':
      await update(subCommandArgs)
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
export async function update(packages?: string[], options?: { latest?: boolean, dryRun?: boolean }): Promise<void> {
  if (packages && packages.length > 0) {
    // Update specific packages
    await updateSpecificPackages(packages, options)
  }
  else {
    // Update all packages
    await updateAllPackages(options)
  }
}

/**
 * Update specific packages
 */
async function updateSpecificPackages(packages: string[], options?: { latest?: boolean, dryRun?: boolean }): Promise<void> {
  const { getLatestVersion, getPackageInfo } = await import('./install')
  const { list } = await import('./list')

  const installPath = install_prefix().string
  const installedPackages = await list(installPath)

  console.log(`🔍 Checking for updates to ${packages.join(', ')}...`)

  const packagesToUpdate: { name: string, currentVersion: string, latestVersion: string }[] = []

  for (const packageName of packages) {
    const packageInfo = getPackageInfo(packageName)

    if (!packageInfo) {
      console.warn(`⚠️  Package '${packageName}' not found in registry`)
      continue
    }

    const installedPackage = installedPackages.find(p =>
      p.project === packageInfo.domain || p.project === packageName,
    )

    if (!installedPackage) {
      console.log(`📦 ${packageName} is not installed - use 'launchpad install ${packageName}' instead`)
      continue
    }

    const latestVersion = getLatestVersion(packageName)

    if (!latestVersion) {
      console.warn(`⚠️  Could not determine latest version for ${packageName}`)
      continue
    }

    const currentVersion = installedPackage.version.toString()

    if (options?.latest || currentVersion !== latestVersion) {
      packagesToUpdate.push({
        name: packageName,
        currentVersion,
        latestVersion,
      })
    }
    else {
      console.log(`✅ ${packageName} is already up to date (${currentVersion})`)
    }
  }

  if (packagesToUpdate.length === 0) {
    console.log('🎉 All specified packages are up to date!')
    return
  }

  if (options?.dryRun) {
    console.log('\n🔍 Packages that would be updated:')
    packagesToUpdate.forEach((pkg) => {
      console.log(`  • ${pkg.name}: ${pkg.currentVersion} → ${pkg.latestVersion}`)
    })
    return
  }

  console.log(`\n🚀 Updating ${packagesToUpdate.length} package(s)...`)

  const packagesToInstall = packagesToUpdate.map(pkg =>
    options?.latest ? pkg.name : `${pkg.name}@${pkg.latestVersion}`,
  )

  const results = await install(packagesToInstall, installPath)

  if (results.length > 0) {
    console.log(`\n🎉 Successfully updated ${packagesToUpdate.length} package(s):`)
    packagesToUpdate.forEach((pkg) => {
      console.log(`  ✅ ${pkg.name}: ${pkg.currentVersion} → ${pkg.latestVersion}`)
    })
  }
  else {
    console.log('⚠️  No packages were updated')
  }
}

/**
 * Update all installed packages
 */
async function updateAllPackages(options?: { latest?: boolean, dryRun?: boolean }): Promise<void> {
  const { getLatestVersion } = await import('./install')
  const { list } = await import('./list')

  const installPath = install_prefix().string
  const installedPackages = await list(installPath)

  if (installedPackages.length === 0) {
    console.log('📭 No packages installed')
    return
  }

  console.log(`🔍 Checking ${installedPackages.length} installed packages for updates...`)

  const packagesToUpdate: { name: string, currentVersion: string, latestVersion: string }[] = []

  for (const pkg of installedPackages) {
    const latestVersion = getLatestVersion(pkg.project)

    if (!latestVersion) {
      console.warn(`⚠️  Could not determine latest version for ${pkg.project}`)
      continue
    }

    const currentVersion = pkg.version.toString()

    if (options?.latest || currentVersion !== latestVersion) {
      packagesToUpdate.push({
        name: pkg.project,
        currentVersion,
        latestVersion,
      })
    }
  }

  if (packagesToUpdate.length === 0) {
    console.log('🎉 All packages are up to date!')
    return
  }

  if (options?.dryRun) {
    console.log(`\n🔍 ${packagesToUpdate.length} package(s) would be updated:`)
    packagesToUpdate.forEach((pkg) => {
      console.log(`  • ${pkg.name}: ${pkg.currentVersion} → ${pkg.latestVersion}`)
    })
    return
  }

  console.log(`\n🚀 Updating ${packagesToUpdate.length} package(s)...`)

  const packagesToInstall = packagesToUpdate.map(pkg =>
    options?.latest ? pkg.name : `${pkg.name}@${pkg.latestVersion}`,
  )

  const results = await install(packagesToInstall, installPath)

  if (results.length > 0) {
    console.log(`\n🎉 Successfully updated ${packagesToUpdate.length} package(s)`)
  }
  else {
    console.log('⚠️  No packages were updated')
  }
}
