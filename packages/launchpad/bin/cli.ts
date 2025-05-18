#!/usr/bin/env bun
import { exec } from 'node:child_process'
import fs from 'node:fs'
import { platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { CAC } from 'cac'
import { version } from '../package.json'
import { create_shim, install, install_prefix, list, shim_dir } from '../src'
import { config } from '../src/config'
import { Path } from '../src/path'
import { check_pkgx_autoupdate, configure_pkgx_autoupdate } from '../src/pkgx'
import { addToPath, isInPath } from '../src/utils'

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
  .command('pkgx', 'Install pkgx itself')
  .option('--path <path>', 'Installation path')
  .option('--verbose', 'Enable verbose logging')
  .option('--force', 'Force reinstall even if already installed')
  .option('--no-auto-path', 'Do not automatically add to PATH')
  .action(async (options?: CliOption & { 'auto-path'?: boolean }) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    if (options?.force)
      config.forceReinstall = true

    if (options?.['auto-path'] === false)
      config.autoAddToPath = false

    // Determine installation path
    const installPath = options?.path
      ? new Path(options.path)
      : install_prefix()

    // Check if pkgx is already installed and not forced
    if (!config.forceReinstall) {
      try {
        const { stdout } = await execAsync('command -v pkgx', { encoding: 'utf8' })
        if (stdout && !options?.force) {
          console.log(`pkgx is already installed at ${stdout.trim()}`)
          console.log('Use --force to reinstall')
          return
        }
      }
      catch {
        // Not installed, continue with installation
      }
    }

    try {
      console.log('Installing pkgx...')

      // Create the necessary directories
      fs.mkdirSync(path.join(installPath.string, 'bin'), { recursive: true })

      // Download and install pkgx using curl
      const installScript = `curl -fsSL https://pkgx.sh | PKGX_INSTALL_ROOT=${installPath.string} bash`

      if (installPath.string.startsWith('/usr/local') && !isRoot()) {
        // Need sudo for this path
        console.log('This installation path requires sudo privileges.')

        if (config.autoSudo) {
          if (config.sudoPassword) {
            await execAsync(`echo "${config.sudoPassword}" | sudo -S bash -c '${installScript}'`)
          }
          else {
            await execAsync(`sudo bash -c '${installScript}'`)
          }
        }
        else {
          console.error('Please run with sudo or run:')
          console.error(`sudo bash -c 'curl -fsSL https://pkgx.sh | PKGX_INSTALL_ROOT=${installPath.string} bash'`)
          process.exit(1)
        }
      }
      else {
        // Normal install, no sudo needed
        await execAsync(installScript)
      }

      console.log('✅ pkgx has been successfully installed!')

      // Check if pkgx is in PATH after installation
      try {
        const { stdout } = await execAsync('command -v pkgx', { encoding: 'utf8' })
        console.log(`pkgx is now available at: ${stdout.trim()}`)
      }
      catch {
        console.warn('pkgx is installed but not in your PATH.')
        console.warn(`Make sure ${path.join(installPath.string, 'bin')} is in your PATH.`)
      }
    }
    catch (error) {
      console.error('Failed to install pkgx:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli
  .command('shim [packages...]', 'Create shims for packages')
  .option('--path <path>', 'Shim installation path')
  .option('--verbose', 'Enable verbose logging')
  .option('--force', 'Force creation of shims even if they already exist')
  .option('--no-auto-path', 'Do not automatically add to PATH')
  .example('shim node')
  .action(async (packages: string[], options?: CliOption & { 'auto-path'?: boolean }) => {
    if (!packages.length) {
      console.error('No packages specified')
      process.exit(1)
    }

    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    if (options?.force)
      config.forceReinstall = true

    if (options?.['auto-path'] === false)
      config.autoAddToPath = false

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

cli
  .command('dev', 'Install the dev package (pkgx dev)')
  .option('--path <path>', 'Installation path')
  .option('--verbose', 'Enable verbose logging')
  .option('--force', 'Force reinstall even if already installed')
  .option('--no-auto-path', 'Do not automatically add to PATH')
  .action(async (options?: CliOption & { 'auto-path'?: boolean }) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    if (options?.force)
      config.forceReinstall = true

    if (options?.['auto-path'] === false)
      config.autoAddToPath = false

    // Make sure pkgx is installed first
    let pkgxInstalled = false
    try {
      const { stdout } = await execAsync('command -v pkgx', { encoding: 'utf8' })
      if (stdout.trim()) {
        pkgxInstalled = true
      }
    }
    catch {
      // Not installed
    }

    // Install pkgx if needed
    if (!pkgxInstalled) {
      console.log('pkgx is not installed. Installing pkgx first...')

      // Determine installation path
      const installPath = options?.path
        ? new Path(options.path)
        : install_prefix()

      try {
        const installScript = `curl -fsSL https://pkgx.sh | PKGX_INSTALL_ROOT=${installPath.string} bash`

        if (installPath.string.startsWith('/usr/local') && !isRoot()) {
          // Need sudo for this path
          console.log('This installation path requires sudo privileges.')

          if (config.autoSudo) {
            if (config.sudoPassword) {
              await execAsync(`echo "${config.sudoPassword}" | sudo -S bash -c '${installScript}'`)
            }
            else {
              await execAsync(`sudo bash -c '${installScript}'`)
            }
          }
          else {
            console.error('Please run with sudo or install pkgx first')
            process.exit(1)
          }
        }
        else {
          // Normal install, no sudo needed
          await execAsync(installScript)
        }

        console.log('✅ pkgx has been successfully installed!')
      }
      catch (error) {
        console.error('Failed to install pkgx:', error instanceof Error ? error.message : error)
        process.exit(1)
      }
    }

    // Now install the dev package by creating a shim
    try {
      console.log('Installing dev package...')

      // Determine shim path
      const shimPath = options?.path
        ? new Path(options.path)
        : shim_dir()

      // Create bin directory if it doesn't exist
      const binDir = path.join(shimPath.string, 'bin')
      fs.mkdirSync(binDir, { recursive: true })

      // Create the dev script
      const devBinPath = path.join(binDir, 'dev')

      // Check if dev already exists and we're not forcing reinstall
      if (fs.existsSync(devBinPath) && !config.forceReinstall) {
        console.log('dev is already installed')
        console.log('Use --force to reinstall')
        return
      }

      // Create the dev shim directly
      const devScript = `#!/bin/sh
exec pkgx -q dev "$@"
`
      // Write the script
      fs.writeFileSync(devBinPath, devScript, { mode: 0o755 })

      console.log(`Created dev script at ${devBinPath}`)

      // Check if binDir is in PATH and add it if necessary
      if (!isInPath(binDir)) {
        if (config.autoAddToPath) {
          console.log(`Adding ${binDir} to your PATH...`)

          const added = addToPath(binDir)
          if (added) {
            console.log(`Added ${binDir} to your PATH.`)
            console.log('You may need to restart your terminal or source your shell configuration.')

            // Provide a specific command to source the configuration file
            const shell = process.env.SHELL || ''
            if (shell.includes('zsh')) {
              console.log('Run this command to update your PATH in the current session:')
              console.log('  source ~/.zshrc')
            }
            else if (shell.includes('bash')) {
              console.log('Run this command to update your PATH in the current session:')
              console.log('  source ~/.bashrc  # or ~/.bash_profile')
            }
          }
          else {
            console.warn(`Could not add ${binDir} to your PATH automatically.`)
            console.warn(`Please add it manually to your shell configuration file:`)
            console.warn(`  echo 'export PATH="${binDir}:$PATH"' >> ~/.zshrc  # or your shell config file`)
          }
        }
        else {
          console.warn(`Note: ${binDir} is not in your PATH.`)
          console.warn(`To use the dev command, add it to your PATH:`)
          console.warn(`  echo 'export PATH="${binDir}:$PATH"' >> ~/.zshrc  # or your shell config file`)
        }
      }

      // Verify installation if possible
      if (isInPath(binDir)) {
        try {
          const { stdout } = await execAsync('dev --version', { encoding: 'utf8' })
          console.log('✅ dev has been successfully installed!')
          console.log(`Version: ${stdout.trim()}`)
        }
        catch {
          console.log('✅ dev has been installed but unable to determine version')
        }
      }

      console.log('', 'RESET')
      console.log('To activate dev in a project:')
      console.log('  cd your-project')
      console.log('  dev .')
    }
    catch (error) {
      console.error('Failed to install dev:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli
  .command('autoupdate', 'Check if pkgx automatic updates are enabled')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options?: CliOption) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    try {
      const autoUpdateEnabled = await check_pkgx_autoupdate()
      console.log(`pkgx auto-update is ${autoUpdateEnabled ? 'enabled' : 'disabled'}`)
    }
    catch (error) {
      console.error('Failed to check auto-update settings:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli
  .command('autoupdate:enable', 'Enable pkgx automatic updates')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options?: CliOption) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    try {
      const success = await configure_pkgx_autoupdate(true)
      if (success) {
        console.log('pkgx auto-update has been enabled')
      }
      else {
        console.error('Failed to enable pkgx auto-update')
        process.exit(1)
      }
    }
    catch (error) {
      console.error('Failed to enable auto-update:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli
  .command('autoupdate:disable', 'Disable pkgx automatic updates')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options?: CliOption) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    try {
      const success = await configure_pkgx_autoupdate(false)
      if (success) {
        console.log('pkgx auto-update has been disabled')
      }
      else {
        console.error('Failed to disable pkgx auto-update')
        process.exit(1)
      }
    }
    catch (error) {
      console.error('Failed to disable auto-update:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli.command('version', 'Show the version of the CLI').action(() => {
  console.log(version)
})

cli.version(version)
cli.help()
cli.parse()
