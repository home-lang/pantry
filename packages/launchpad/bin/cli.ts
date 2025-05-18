#!/usr/bin/env bun
import { exec } from 'node:child_process'
import { platform } from 'node:os'
import process from 'node:process'
import { promisify } from 'node:util'
import { CAC } from 'cac'
import { version } from '../package.json'
import { create_shim, install, install_prefix, list, shim_dir } from '../src'
import { config } from '../src/config'
import { Path } from '../src/path'

const execAsync = promisify(exec)
const cli = new CAC('launchpad')

interface CliOption {
  verbose: boolean
  path?: string
  sudo?: boolean
  force?: boolean
}

// Helper to check if we're running as root/administrator
function isRoot(): boolean {
  // On Unix-like systems, root user has UID 0
  if (platform() !== 'win32') {
    return process.getuid?.() === 0
  }
  // On Windows, check if running with elevated privileges
  // (simplified - not completely accurate)
  return process.env.USERNAME?.toLowerCase() === 'administrator'
}

cli
  .command('install [packages...]', 'Install packages')
  .alias('i')
  .option('--verbose', 'Enable verbose logging')
  .option('--path <path>', 'Installation path')
  .option('--sudo', 'Use sudo for installation')
  .option('--force', 'Force reinstall even if package is already installed')
  .example('install dev node')
  .action(async (packages: string[], options?: CliOption) => {
    if (!packages.length) {
      console.error('No packages specified')
      process.exit(1)
    }

    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    if (options?.force)
      config.forceReinstall = true

    // Determine installation path
    const installPath = options?.path
      ? new Path(options.path)
      : install_prefix()

    const requiresSudo = options?.sudo || installPath.string.startsWith('/usr/local')
    const shouldAutoSudo = requiresSudo && config.autoSudo

    if (requiresSudo && !isRoot() && shouldAutoSudo) {
      // We need sudo permissions
      if (config.sudoPassword) {
        // Use stored sudo password
        const cmdline = process.argv.slice(1).join(' ')
        await execAsync(`echo "${config.sudoPassword}" | sudo -S ${process.execPath} ${cmdline}`)
        process.exit(0)
      }
      else {
        console.error('This operation requires sudo privileges. Please run with sudo.')
        process.exit(1)
      }
    }

    // Run the installation
    try {
      const installedFiles = await install(packages, installPath.string)
      console.log(`Installed ${packages.join(', ')} to ${installPath}`)
      if (config.verbose) {
        console.log('Created files:')
        installedFiles.forEach(file => console.log(`  ${file}`))
      }
    }
    catch (error) {
      console.error('Installation failed:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli
  .command('shim [packages...]', 'Create shims for packages')
  .option('--path <path>', 'Shim installation path')
  .option('--verbose', 'Enable verbose logging')
  .option('--force', 'Force creation of shims even if they already exist')
  .example('shim node')
  .action(async (packages: string[], options?: CliOption) => {
    if (!packages.length) {
      console.error('No packages specified')
      process.exit(1)
    }

    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    if (options?.force)
      config.forceReinstall = true

    // Determine shim path
    const shimPath = options?.path
      ? new Path(options.path)
      : shim_dir()

    try {
      const createdShims = await create_shim(packages, shimPath.string)
      console.log(`Created shims for ${packages.join(', ')} in ${shimPath}`)
      if (config.verbose) {
        console.log('Created shims:')
        createdShims.forEach(file => console.log(`  ${file}`))
      }
    }
    catch (error) {
      console.error('Failed to create shims:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli
  .command('list', 'List installed packages')
  .alias('ls')
  .option('--path <path>', 'Installation path')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options?: CliOption) => {
    // Override config option from CLI
    if (options?.verbose)
      config.verbose = true

    const basePath = options?.path
      ? new Path(options.path)
      : install_prefix()

    try {
      const packages = await list(basePath.string)
      if (packages.length) {
        console.log('Installed packages:')
        packages.forEach((pkg) => {
          console.log(`  ${pkg.project}@${pkg.version}`)
        })
      }
      else {
        console.log('No packages installed')
      }
    }
    catch (error) {
      console.error('Failed to list packages:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli.command('version', 'Show the version of the CLI').action(() => {
  console.log(version)
})

cli.version(version)
cli.help()
cli.parse()
