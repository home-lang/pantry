#!/usr/bin/env bun
import { exec } from 'node:child_process'
import fs from 'node:fs'
import { platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { CAC } from 'cac'
import { version } from '../package.json'
import { create_shim, install, install_bun, install_prefix, list, shim_dir } from '../src'
import { config } from '../src/config'
import { datadir, dump, integrate, shell_escape, shellcode, sniff } from '../src/dev'
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

// Helper function to ensure pkgx is installed
async function ensurePkgxInstalled(installPath: Path): Promise<void> {
  try {
    // Check if pkgx is already available
    const { stdout } = await execAsync('command -v pkgx', { encoding: 'utf8' })
    if (stdout.trim()) {
      return // pkgx is already installed
    }
  }
  catch {
    // pkgx is not installed, proceed with installation
  }

  console.log('pkgx not found. Installing pkgx first...')

  try {
    // Create the necessary directories
    fs.mkdirSync(path.join(installPath.string, 'bin'), { recursive: true })

    // Download and install pkgx using curl
    const installScript = `curl -fsSL https://pkgx.sh | PKGX_INSTALL_ROOT=${installPath.string} bash`

    if (installPath.string.startsWith('/usr/local') && !isRoot()) {
      // Need sudo for this path
      console.log('This installation path requires sudo privileges.')
      await execAsync(`sudo bash -c '${installScript}'`)
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
      console.warn('You may need to restart your shell or run: source ~/.bashrc (or ~/.zshrc)')
    }
  }
  catch (error) {
    throw new Error(`Failed to install pkgx: ${error instanceof Error ? error.message : error}`)
  }
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

    // Skip sudo logic for now to avoid issues - let the individual install functions handle permissions
    // const requiresSudo = options?.sudo || installPath.string.startsWith('/usr/local')
    // const shouldAutoSudo = requiresSudo && config.autoSudo

    // if (requiresSudo && !isRoot() && shouldAutoSudo) {
    //   // We need sudo permissions
    //   if (config.sudoPassword) {
    //     // Use stored sudo password
    //     const args = process.argv.slice(1).map(arg => `"${arg}"`).join(' ')
    //     await execAsync(`echo "${config.sudoPassword}" | sudo -S "${process.execPath}" ${args}`)
    //     process.exit(0)
    //   }
    //   else {
    //     console.error('This operation requires sudo privileges. Please run with sudo.')
    //     process.exit(1)
    //   }
    // }

    // Ensure pkgx is installed before proceeding
    try {
      await ensurePkgxInstalled(installPath)
    }
    catch (error) {
      console.error('Failed to ensure pkgx is installed:', error instanceof Error ? error.message : error)
      process.exit(1)
    }

    // Run the installation
    try {
      const installedFiles = await install(packages, installPath.string)
      console.log(`Installed ${Array.isArray(packages) ? packages.join(', ') : packages} to ${installPath.string}`)
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

    // Determine installation path
    const installPath = options?.path
      ? new Path(options.path)
      : install_prefix()

    // Ensure pkgx is installed before proceeding
    try {
      await ensurePkgxInstalled(installPath)
    }
    catch (error) {
      console.error('Failed to ensure pkgx is installed:', error instanceof Error ? error.message : error)
      process.exit(1)
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

cli
  .command('bun', 'Install Bun from the official GitHub releases')
  .option('--path <path>', 'Installation path')
  .option('--verbose', 'Enable verbose logging')
  .option('--force', 'Force reinstall even if already installed')
  .option('--version <version>', 'Specific version to install')
  .option('--no-auto-path', 'Do not automatically add to PATH')
  .action(async (options?: CliOption & { 'auto-path'?: boolean, 'version'?: string }) => {
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

    try {
      // Check if bun is already installed and not forced
      if (!config.forceReinstall) {
        try {
          const { stdout } = await execAsync('command -v bun', { encoding: 'utf8' })
          if (stdout && !options?.force) {
            console.log(`Bun is already installed at ${stdout.trim()}`)
            console.log('Use --force to reinstall')
            return
          }
        }
        catch {
          // Not installed, continue with installation
        }
      }

      console.log('Installing Bun...')

      // Install Bun
      const createdFiles = await install_bun(installPath.string, options?.version)
      console.log(`Bun has been installed to ${path.join(installPath.string, 'bin')}`)

      if (config.verbose) {
        console.log('Created files:')
        createdFiles.forEach(file => console.log(`  ${file}`))
      }

      // Check if the bin directory is in PATH and add it if necessary
      const binDir = path.join(installPath.string, 'bin')
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
          console.warn(`To use the bun command, add it to your PATH:`)
          console.warn(`  echo 'export PATH="${binDir}:$PATH"' >> ~/.zshrc  # or your shell config file`)
        }
      }

      // Verify installation if possible
      if (isInPath(binDir)) {
        try {
          const { stdout } = await execAsync('bun --version', { encoding: 'utf8' })
          console.log('✅ Bun has been successfully installed!')
          console.log(`Version: ${stdout.trim()}`)
        }
        catch {
          console.log('✅ Bun has been installed but unable to determine version')
        }
      }
    }
    catch (error) {
      console.error('Failed to install Bun:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli
  .command('zsh', 'Install zsh shell')
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

    // Ensure pkgx is installed before proceeding
    try {
      await ensurePkgxInstalled(installPath)
    }
    catch (error) {
      console.error('Failed to ensure pkgx is installed:', error instanceof Error ? error.message : error)
      process.exit(1)
    }

    try {
      // Check if zsh is already installed and not forced
      if (!config.forceReinstall) {
        try {
          const { stdout } = await execAsync('command -v zsh', { encoding: 'utf8' })
          if (stdout && !options?.force) {
            console.log(`zsh is already installed at ${stdout.trim()}`)
            console.log('Use --force to reinstall')
            return
          }
        }
        catch {
          // Not installed, continue with installation
        }
      }

      console.log('Installing zsh...')

      // Install zsh using the existing install function
      const installedFiles = await install(['zsh'], installPath.string)
      console.log(`zsh has been installed to ${installPath.string}`)

      if (config.verbose) {
        console.log('Created files:')
        installedFiles.forEach(file => console.log(`  ${file}`))
      }

      // Check if the bin directory is in PATH and add it if necessary
      const binDir = path.join(installPath.string, 'bin')
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
          console.warn(`To use the zsh command, add it to your PATH:`)
          console.warn(`  echo 'export PATH="${binDir}:$PATH"' >> ~/.zshrc  # or your shell config file`)
        }
      }

      // Verify installation if possible
      if (isInPath(binDir)) {
        try {
          const { stdout } = await execAsync('zsh --version', { encoding: 'utf8' })
          console.log('✅ zsh has been successfully installed!')
          console.log(`Version: ${stdout.trim()}`)
        }
        catch {
          console.log('✅ zsh has been installed but unable to determine version')
        }
      }

      console.log('')
      console.log('To make zsh your default shell, run:')
      console.log(`  chsh -s ${path.join(binDir, 'zsh')}`)
      console.log('')
      console.log('Or if you want to use the system zsh:')
      console.log('  chsh -s /bin/zsh')
    }
    catch (error) {
      console.error('Failed to install zsh:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

// Dev environment commands
cli
  .command('dev:integrate', 'Integrate dev hooks into shell configuration')
  .option('--verbose', 'Enable verbose logging')
  .option('--dry-run', 'Show what would be done without making changes')
  .action(async (options?: CliOption & { 'dry-run'?: boolean }) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    const dryRun = options?.['dry-run'] || false

    try {
      await integrate('install', { dryrun: dryRun })
    }
    catch (error) {
      console.error('Failed to integrate dev hooks:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli
  .command('dev:deintegrate', 'Remove dev hooks from shell configuration')
  .option('--verbose', 'Enable verbose logging')
  .option('--dry-run', 'Show what would be done without making changes')
  .action(async (options?: CliOption & { 'dry-run'?: boolean }) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    const dryRun = options?.['dry-run'] || false

    try {
      await integrate('uninstall', { dryrun: dryRun })
    }
    catch (error) {
      console.error('Failed to deintegrate dev hooks:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli
  .command('dev:status', 'Check if dev environment is active in current directory')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options?: CliOption) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    try {
      const isActive = checkDevStatusSimple()
      if (isActive) {
        console.log('✅ Dev environment is active')
        process.exit(0)
      }
      else {
        console.log('❌ Dev environment is not active')
        process.exit(1)
      }
    }
    catch (error) {
      console.error('Failed to check dev status:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli
  .command('dev:ls', 'List all active dev environments')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options?: CliOption) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    try {
      const activeEnvs = await listActiveDevEnvs()
      if (activeEnvs.length > 0) {
        console.log('Active dev environments:')
        activeEnvs.forEach(env => console.log(`  ${env}`))
      }
      else {
        console.log('No active dev environments found')
      }
    }
    catch (error) {
      console.error('Failed to list dev environments:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli
  .command('dev:off', 'Deactivate dev environment in current directory')
  .option('--verbose', 'Enable verbose logging')
  .action(async (options?: CliOption) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    try {
      const deactivated = await deactivateDevEnv()
      if (deactivated) {
        console.log('✅ Dev environment deactivated')
      }
      else {
        console.log('❌ No active dev environment found')
        process.exit(1)
      }
    }
    catch (error) {
      console.error('Failed to deactivate dev environment:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli
  .command('dev:on [directory]', 'Activate dev environment in directory')
  .option('--verbose', 'Enable verbose logging')
  .action(async (directory?: string, options?: CliOption) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    const targetDir = directory ? path.resolve(directory) : process.cwd()

    try {
      const activated = await activateDevEnv(targetDir)
      if (activated) {
        console.log(`✅ Dev environment activated in ${targetDir}`)
      }
      else {
        console.log('❌ No development files found in directory')
        process.exit(1)
      }
    }
    catch (error) {
      console.error('Failed to activate dev environment:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli
  .command('dev:shellcode', 'Output shell integration code')
  .action(() => {
    console.log(shellcode())
  })

cli
  .command('dev:dump [directory]', 'Output environment setup for dev environment')
  .option('--verbose', 'Enable verbose logging')
  .option('--dry-run', 'Show packages without generating environment')
  .option('--quiet', 'Suppress package output')
  .action(async (directory?: string, options?: CliOption & { 'dry-run'?: boolean, 'quiet'?: boolean }) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    const targetDir = directory ? path.resolve(directory) : process.cwd()
    const dryRun = options?.['dry-run'] || false
    const quiet = options?.quiet || false

    try {
      await dump(targetDir, { dryrun: dryRun, quiet })
    }
    catch (error) {
      console.error('Failed to dump dev environment:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

cli.command('version', 'Show the version of the CLI').action(() => {
  console.log(version)
})

cli.version(version)
cli.help()
cli.parse()

// Simple helper functions for dev commands using imported dev functions

function getDataDir(): string {
  const xdgDataHome = process.env.XDG_DATA_HOME
  if (xdgDataHome) {
    return path.join(xdgDataHome, 'pkgx', 'dev')
  }

  const home = process.env.HOME || process.env.USERPROFILE
  if (!home) {
    throw new Error('Could not determine home directory')
  }

  switch (platform()) {
    case 'darwin':
      return path.join(home, 'Library', 'Application Support', 'pkgx', 'dev')
    case 'win32': {
      const localAppData = process.env.LOCALAPPDATA
      if (localAppData) {
        return path.join(localAppData, 'pkgx', 'dev')
      }
      return path.join(home, 'AppData', 'Local', 'pkgx', 'dev')
    }
    default:
      return path.join(home, '.local', 'share', 'pkgx', 'dev')
  }
}

async function integrateDevHooks(op: 'install' | 'uninstall', { dryRun }: { dryRun: boolean }): Promise<void> {
  const home = process.env.HOME || process.env.USERPROFILE
  if (!home) {
    throw new Error('Could not determine home directory')
  }

  const hookLine = 'eval "$(launchpad dev:shellcode)"  # https://github.com/pkgxdev/dev'

  const shellFiles = [
    path.join(home, '.zshrc'),
    path.join(home, '.bashrc'),
    path.join(home, '.bash_profile'),
  ].filter(file => fs.existsSync(file))

  // If no shell files exist, create .zshrc on macOS
  if (shellFiles.length === 0 && platform() === 'darwin') {
    shellFiles.push(path.join(home, '.zshrc'))
  }

  if (shellFiles.length === 0) {
    throw new Error('No shell configuration files found')
  }

  let operatedAtLeastOnce = false

  for (const shellFile of shellFiles) {
    try {
      let content = ''
      if (fs.existsSync(shellFile)) {
        content = fs.readFileSync(shellFile, 'utf8')
      }

      const hasHook = content.includes('# https://github.com/pkgxdev/dev')

      if (op === 'install') {
        if (hasHook) {
          console.log(`Hook already integrated: ${shellFile}`)
          continue
        }

        if (!dryRun) {
          const newContent = content.endsWith('\n') ? content : `${content}\n`
          fs.writeFileSync(shellFile, `${newContent}\n${hookLine}\n`)
        }

        console.log(`${shellFile} << \`${hookLine}\``)
        operatedAtLeastOnce = true
      }
      else if (op === 'uninstall') {
        if (!hasHook) {
          continue
        }

        const lines = content.split('\n')
        const filteredLines = lines.filter(line => !line.includes('# https://github.com/pkgxdev/dev'))

        if (!dryRun) {
          fs.writeFileSync(shellFile, filteredLines.join('\n'))
        }

        console.log(`Removed hook: ${shellFile}`)
        operatedAtLeastOnce = true
      }
    }
    catch (error) {
      console.warn(`Failed to process ${shellFile}:`, error instanceof Error ? error.message : error)
    }
  }

  if (dryRun && operatedAtLeastOnce) {
    console.log('This was a dry-run. Nothing was changed.')
  }
  else if (op === 'install' && operatedAtLeastOnce) {
    console.log('Now restart your terminal for `dev` hooks to take effect')
  }
  else if (op === 'uninstall' && !operatedAtLeastOnce) {
    console.log('Nothing to deintegrate found')
  }
}

async function checkDevStatus(): Promise<boolean> {
  const cwd = process.cwd()
  const dataDir = getDataDir()
  const activationFile = path.join(dataDir, cwd.slice(1), 'dev.pkgx.activated')

  return fs.existsSync(activationFile)
}

async function listActiveDevEnvs(): Promise<string[]> {
  const dataDir = getDataDir()
  const activeEnvs: string[] = []

  if (!fs.existsSync(dataDir)) {
    return activeEnvs
  }

  function walkDir(dir: string, basePath: string = ''): void {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = path.join(basePath, entry.name)

        if (entry.isFile() && entry.name === 'dev.pkgx.activated') {
          activeEnvs.push(`/${path.dirname(relativePath)}`)
        }
        else if (entry.isDirectory()) {
          walkDir(fullPath, relativePath)
        }
      }
    }
    catch {
      // Ignore errors reading directories
    }
  }

  walkDir(dataDir)
  return activeEnvs
}

async function deactivateDevEnv(): Promise<boolean> {
  let dir = process.cwd()
  const dataDir = getDataDir()

  while (dir !== '/' && dir !== '.') {
    const activationFile = path.join(dataDir, dir.slice(1), 'dev.pkgx.activated')

    if (fs.existsSync(activationFile)) {
      fs.unlinkSync(activationFile)
      console.log(`Deactivated dev environment: ${dir}`)
      return true
    }

    dir = path.dirname(dir)
  }

  return false
}

async function activateDevEnv(targetDir: string): Promise<boolean> {
  // Import sniff function to detect development files
  const { default: sniff } = await import('../src/dev/sniff.ts')

  try {
    const { pkgs } = await sniff({ string: targetDir })

    if (pkgs.length === 0) {
      return false
    }

    const dataDir = getDataDir()
    const activationDir = path.join(dataDir, targetDir.slice(1))
    const activationFile = path.join(activationDir, 'dev.pkgx.activated')

    // Create directory structure
    fs.mkdirSync(activationDir, { recursive: true })

    // Create activation file
    fs.writeFileSync(activationFile, '')

    console.log(`Detected packages: ${pkgs.map(pkg => `${pkg.project}@${pkg.constraint}`).join(' ')}`)
    return true
  }
  catch (error) {
    console.warn('Failed to sniff directory:', error instanceof Error ? error.message : error)
    return false
  }
}

async function dumpDevEnv(targetDir: string, { dryRun, quiet }: { dryRun: boolean, quiet: boolean }): Promise<void> {
  // Import sniff function to detect development files
  const { default: sniff } = await import('../src/dev/sniff.ts')

  try {
    const { pkgs, env } = await sniff({ string: targetDir })

    if (pkgs.length === 0 && Object.keys(env).length === 0) {
      console.error('no devenv detected')
      process.exit(1)
    }

    if (dryRun) {
      const pkgspecs = pkgs.map(pkg => `+${pkg.project}@${pkg.constraint}`)
      console.log(pkgspecs.join(' '))
      return
    }

    let envOutput = ''

    if (pkgs.length > 0) {
      // For now, just output the package names - in a full implementation,
      // this would call pkgx to get the actual environment variables
      const pkgspecs = pkgs.map(pkg => `+${pkg.project}@${pkg.constraint}`)

      if (!quiet) {
        console.error(`%c${pkgspecs.join(' ')}`, 'color: green')
      }

      // Simulate environment setup - in reality this would call pkgx
      for (const pkg of pkgs) {
        envOutput += `# Package: ${pkg.project}@${pkg.constraint}\n`
      }
    }

    // Add any additional env that we sniffed
    for (const [key, value] of Object.entries(env)) {
      envOutput += `${key}=${shellEscape(value)}\n`
    }

    envOutput = envOutput.trim()

    let undo = ''
    for (const envln of envOutput.trim().split('\n')) {
      if (!envln || envln.startsWith('#'))
        continue

      const [key] = envln.split('=', 2)
      undo += `    if [ "$${key}" ]; then
      export ${key}="$${key}"
    else
      unset ${key}
    fi\n`
    }

    const byeByeMsg = pkgs.map(pkg => `-${pkg.project}@${pkg.constraint}`).join(' ')

    console.log(`
  eval "_pkgx_dev_try_bye() {
    suffix=\"\${PWD#\"${targetDir}\"}\"
    [ \"\$PWD\" = \"${targetDir}\$suffix\" ] && return 1
    echo -e \"\\033[31m${byeByeMsg}\\033[0m\" >&2
    ${undo.trim()}
    unset -f _pkgx_dev_try_bye
  }"

  set -a
  ${envOutput}
  set +a`)
  }
  catch (error) {
    console.error('Failed to sniff directory:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

function shellEscape(str: string): string {
  // Simple shell escaping - wrap in single quotes and escape any single quotes
  return `'${str.replace(/'/g, '\'"\'"\'')}'`
}

function generateShellcode(): string {
  // Find the launchpad command
  const launchpadCmd = process.argv[1] || 'launchpad'
  const dataDir = getDataDir()

  return `
_pkgx_chpwd_hook() {
  if ! type _pkgx_dev_try_bye >/dev/null 2>&1 || _pkgx_dev_try_bye; then
    dir="$PWD"
    while [ "$dir" != / -a "$dir" != . ]; do
      if [ -f "${dataDir}/$dir/dev.pkgx.activated" ]; then
        eval "$(${launchpadCmd} dev:dump)" "$dir"
        break
      fi
      dir="$(dirname "$dir")"
    done
  fi
}

dev() {
  case "$1" in
  off)
    if type -f _pkgx_dev_try_bye >/dev/null 2>&1; then
      dir="$PWD"
      while [ "$dir" != / -a "$dir" != . ]; do
        if [ -f "${dataDir}/$dir/dev.pkgx.activated" ]; then
          rm "${dataDir}/$dir/dev.pkgx.activated"
          break
        fi
        dir="$(dirname "$dir")"
      done
      PWD=/ _pkgx_dev_try_bye
    else
      echo "no devenv" >&2
    fi;;
  ''|on)
    if [ "$2" ]; then
      "${launchpadCmd}" dev:on "$@"
    elif ! type -f _pkgx_dev_try_bye >/dev/null 2>&1; then
      mkdir -p "${dataDir}$PWD"
      touch "${dataDir}$PWD/dev.pkgx.activated"
      eval "$(${launchpadCmd} dev:dump)"
    else
      echo "devenv already active" >&2
    fi;;
  *)
    "${launchpadCmd}" dev:"$@";;
  esac
}

if [ -n "$ZSH_VERSION" ] && [ $(emulate) = zsh ]; then
  eval 'typeset -ag chpwd_functions

        if [[ -z "\${chpwd_functions[(r)_pkgx_chpwd_hook]+1}" ]]; then
          chpwd_functions=( _pkgx_chpwd_hook \${chpwd_functions[@]} )
        fi

        if [ "$TERM_PROGRAM" != Apple_Terminal ]; then
          _pkgx_chpwd_hook
        fi'
elif [ -n "$BASH_VERSION" ] && [ "$POSIXLY_CORRECT" != y ] ; then
  eval 'cd() {
          builtin cd "$@" || return
          _pkgx_chpwd_hook
        }
        _pkgx_chpwd_hook'
else
  POSIXLY_CORRECT=y
  echo "launchpad: dev: warning: unsupported shell" >&2
fi
`.trim()
}
