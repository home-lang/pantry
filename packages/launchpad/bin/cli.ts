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

  console.log('pkgx not found. Installing pkgx from GitHub releases...')

  try {
    await downloadAndInstallPkgx(installPath)
    console.log('✅ pkgx has been successfully installed!')

    // Check if pkgx is in PATH after installation
    try {
      const { stdout } = await execAsync('command -v pkgx', { encoding: 'utf8' })
      console.log(`pkgx is now available at: ${stdout.trim()}`)
    }
    catch {
      const binDir = path.join(installPath.string, 'bin')
      console.warn('pkgx is installed but not in your PATH.')
      console.warn(`Make sure ${binDir} is in your PATH.`)
      console.warn('You may need to restart your shell or run: source ~/.bashrc (or ~/.zshrc)')
    }
  }
  catch (error) {
    throw new Error(`Failed to install pkgx: ${error instanceof Error ? error.message : error}`)
  }
}

// Helper function to download and install pkgx from GitHub releases
async function downloadAndInstallPkgx(installPath: Path): Promise<void> {
  const version = '2.7.0'
  const os = platform()
  const arch = process.arch

  // Determine the correct binary filename
  let binaryName: string
  if (os === 'darwin') {
    if (arch === 'arm64') {
      binaryName = `pkgx-${version}+darwin+aarch64.tar.gz`
    }
    else {
      binaryName = `pkgx-${version}+darwin+x86-64.tar.gz`
    }
  }
  else if (os === 'linux') {
    if (arch === 'arm64') {
      binaryName = `pkgx-${version}+linux+aarch64.tar.gz`
    }
    else {
      binaryName = `pkgx-${version}+linux+x86-64.tar.gz`
    }
  }
  else if (os === 'win32') {
    binaryName = `pkgx-${version}+windows+x86-64.zip`
  }
  else {
    throw new Error(`Unsupported platform: ${os}`)
  }

  const downloadUrl = `https://github.com/pkgxdev/pkgx/releases/download/v${version}/${binaryName}`
  const binDir = path.join(installPath.string, 'bin')
  const tempDir = path.join(installPath.string, '.tmp')
  const tempFile = path.join(tempDir, binaryName)

  // Create necessary directories
  fs.mkdirSync(binDir, { recursive: true })
  fs.mkdirSync(tempDir, { recursive: true })

  if (config.verbose) {
    console.log(`Downloading: ${downloadUrl}`)
    console.log(`To: ${tempFile}`)
  }

  try {
    // Download the binary using system curl (avoiding broken shims)
    let curlCmd = 'curl'
    // Try to find system curl in common locations
    const systemCurlPaths = ['/usr/bin/curl', '/bin/curl', '/usr/local/bin/curl']
    for (const curlPath of systemCurlPaths) {
      if (fs.existsSync(curlPath)) {
        curlCmd = curlPath
        break
      }
    }

    await execAsync(`${curlCmd} -fsSL "${downloadUrl}" -o "${tempFile}"`)

    // Extract the archive
    if (binaryName.endsWith('.tar.gz')) {
      await execAsync(`tar -xzf "${tempFile}" -C "${tempDir}"`)
    }
    else if (binaryName.endsWith('.zip')) {
      await execAsync(`unzip -q "${tempFile}" -d "${tempDir}"`)
    }

    // Find the pkgx binary in the extracted files
    const extractedFiles = fs.readdirSync(tempDir, { recursive: true, withFileTypes: true })
    let pkgxBinaryPath: string | null = null

    for (const file of extractedFiles) {
      if (file.isFile() && (file.name === 'pkgx' || file.name === 'pkgx.exe')) {
        pkgxBinaryPath = path.join(file.path || tempDir, file.name)
        break
      }
    }

    if (!pkgxBinaryPath || !fs.existsSync(pkgxBinaryPath)) {
      throw new Error('pkgx binary not found in downloaded archive')
    }

    // Move the binary to the bin directory
    const targetBinary = path.join(binDir, os === 'win32' ? 'pkgx.exe' : 'pkgx')
    fs.copyFileSync(pkgxBinaryPath, targetBinary)

    // Make it executable on Unix-like systems
    if (os !== 'win32') {
      fs.chmodSync(targetBinary, 0o755)
    }

    if (config.verbose) {
      console.log(`Installed pkgx binary to: ${targetBinary}`)
    }
  }
  finally {
    // Clean up temporary files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    catch {
      // Ignore cleanup errors
    }
  }
}

cli
  .command('install [packages...]', 'Install packages with automatic fallback')
  .alias('i')
  .option('--verbose', 'Enable verbose logging')
  .option('--path <path>', 'Installation path')
  .option('--sudo', 'Use sudo for installation')
  .option('--force', 'Force reinstall even if package is already installed')
  .example('install dev node')
  .action(async (packages: string[], options?: CliOption) => {
    if (!packages || !packages.length) {
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
      console.log(`✅ Installed ${Array.isArray(packages) ? packages.join(', ') : packages} to ${installPath.string}`)
      if (config.verbose) {
        console.log('Created files:')
        installedFiles.forEach(file => console.log(`  ${file}`))
      }

      // Automatically add to PATH if configured
      const binDir = path.join(installPath.string, 'bin')
      if (!isInPath(binDir) && config.autoAddToPath) {
        console.log('')
        console.log('🛠️  Setting up PATH...')
        const added = addToPath(binDir)
        if (added) {
          console.log(`✅ Added ${binDir} to your PATH`)
          console.log('💡 Restart your terminal or run: source ~/.zshrc')
        }
        else {
          console.log('⚠️  Could not automatically add to PATH. Add manually:')
          console.log(`   echo 'export PATH="${binDir}:$PATH"' >> ~/.zshrc`)
        }
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('pkgx version must be') || errorMessage.includes('no `pkgx` found')) {
        console.error('❌ pkgx issue detected.')
        console.log('')
        console.log('📋 Quick fixes:')
        console.log('1. Install/update pkgx:')
        console.log('   curl -fsSL https://pkgx.sh | bash')
        console.log('')
        console.log('2. Alternative: Use system package manager:')
        packages.forEach((pkg) => {
          console.log(`   # For ${pkg}:`)
          if (platform() === 'darwin') {
            console.log(`   brew install ${pkg}`)
          }
          else {
            console.log(`   sudo apt install ${pkg}  # or your distro equivalent`)
          }
        })
      }
      else if (errorMessage.includes('CmdNotFound') || errorMessage.includes('ca-certificates')) {
        console.error('❌ Package repository issue.')
        console.log('')
        console.log('📋 Try these solutions:')
        console.log('1. Update pkgx and retry:')
        console.log('   curl -fsSL https://pkgx.sh | bash')
        console.log(`   ./launchpad install ${packages.join(' ')}`)
        console.log('')
        console.log('2. Use system package manager instead:')
        packages.forEach((pkg) => {
          if (platform() === 'darwin') {
            console.log(`   brew install ${pkg}`)
          }
          else {
            console.log(`   sudo apt install ${pkg}`)
          }
        })
      }
      else {
        console.error('❌ Installation failed:', errorMessage)
        console.log('')
        console.log('💡 Try with verbose output:')
        console.log(`   ./launchpad install --verbose ${packages.join(' ')}`)
      }
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

      if (config.verbose) {
        console.log(`Installing to: ${installPath.string}`)
      }

      // Use the new download and install function
      await downloadAndInstallPkgx(installPath)

      console.log('✅ pkgx has been successfully installed!')

      // Determine the bin directory where pkgx should be
      const binDir = path.join(installPath.string, 'bin')

      // Check if pkgx is in PATH after installation
      let pkgxInPath = false
      try {
        const { stdout } = await execAsync('command -v pkgx', { encoding: 'utf8' })
        console.log(`pkgx is now available at: ${stdout.trim()}`)
        pkgxInPath = true
      }
      catch {
        if (config.verbose) {
          console.log(`pkgx not found in PATH, checking ${binDir}`)
        }
      }

      // If pkgx is not in PATH, try to add the bin directory
      if (!pkgxInPath && !isInPath(binDir)) {
        if (config.autoAddToPath) {
          console.log('')
          console.log('🛠️  Setting up PATH...')
          const added = addToPath(binDir)
          if (added) {
            console.log(`✅ Added ${binDir} to your PATH`)
            console.log('💡 Restart your terminal or run: source ~/.zshrc (or your shell config)')

            // Try to verify installation after PATH update
            console.log('')
            console.log('To verify installation, run:')
            console.log(`  export PATH="${binDir}:$PATH"`)
            console.log('  pkgx --version')
          }
          else {
            console.log('')
            console.log('⚠️  Could not automatically add to PATH. Add manually:')
            console.log(`   echo 'export PATH="${binDir}:$PATH"' >> ~/.zshrc`)
            console.log('   source ~/.zshrc')
            console.log('   pkgx --version')
          }
        }
        else {
          console.log('')
          console.log('⚠️  pkgx is installed but not in your PATH.')
          console.log(`Add it manually:`)
          console.log(`   echo 'export PATH="${binDir}:$PATH"' >> ~/.zshrc`)
          console.log('   source ~/.zshrc')
          console.log('   pkgx --version')
        }
      }

      // Double-check installation by looking for the binary directly
      const pkgxBinary = path.join(binDir, platform() === 'win32' ? 'pkgx.exe' : 'pkgx')
      if (fs.existsSync(pkgxBinary)) {
        if (config.verbose) {
          console.log(`✓ pkgx binary found at: ${pkgxBinary}`)
        }
      }
      else {
        console.warn(`⚠️  pkgx binary not found at expected location: ${pkgxBinary}`)
        console.warn('The installation may have failed.')
      }
    }
    catch (error) {
      console.error('Failed to install pkgx:', error instanceof Error ? error.message : error)
      console.log('')
      console.log('📋 Alternative installation methods:')
      console.log('1. Manual installation:')
      console.log('   curl -fsSL https://pkgx.sh | bash')
      console.log('')
      console.log('2. Using Homebrew (macOS):')
      console.log('   brew install pkgxdev/made/pkgx')
      console.log('')
      console.log('3. Using npm:')
      console.log('   npm install -g pkgx')
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
    if (!packages || !packages.length) {
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
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Handle pkgx version issues gracefully
      if (errorMessage.includes('pkgx version must be')) {
        console.error('❌ pkgx version incompatibility detected.')
        console.log('')
        console.log('📋 Solutions:')
        console.log('1. Update pkgx to the latest version:')
        console.log('   curl -fsSL https://pkgx.sh | bash')
        console.log('')
        console.log('2. Or install packages manually using your system package manager:')
        packages.forEach((pkg) => {
          console.log(`   # For ${pkg}:`)
          if (platform() === 'darwin') {
            console.log(`   brew install ${pkg}`)
          }
          else {
            console.log(`   sudo apt install ${pkg}  # or equivalent for your distro`)
          }
        })
        console.log('')
        console.log('3. Or use the direct installation commands:')
        console.log(`   ./launchpad install ${packages.join(' ')}`)
      }
      else if (errorMessage.includes('CmdNotFound') || errorMessage.includes('ca-certificates')) {
        console.error('❌ Package dependency issue detected.')
        console.log('')
        console.log('📋 This might be a temporary issue with pkgx package repositories.')
        console.log('Try these solutions:')
        console.log('')
        console.log('1. Update pkgx and try again:')
        console.log('   curl -fsSL https://pkgx.sh | bash')
        console.log(`   ./launchpad shim ${packages.join(' ')}`)
        console.log('')
        console.log('2. Install packages using your system package manager:')
        packages.forEach((pkg) => {
          console.log(`   # For ${pkg}:`)
          if (platform() === 'darwin') {
            console.log(`   brew install ${pkg}`)
          }
          else {
            console.log(`   sudo apt install ${pkg}  # or equivalent`)
          }
        })
        console.log('')
        console.log('3. Check pkgx status at: https://github.com/pkgxdev/pkgx')
      }
      else {
        console.error('Failed to create shims:', errorMessage)
        console.log('')
        console.log('💡 Try running with --verbose for more details:')
        console.log(`   ./launchpad shim --verbose ${packages.join(' ')}`)
      }
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
  .command('smart-install [packages...]', 'Smart install with automatic fallback to system package managers')
  .alias('si')
  .option('--verbose', 'Enable verbose logging')
  .option('--force', 'Force reinstall even if already installed')
  .option('--no-fallback', 'Do not fallback to system package managers')
  .option('--path <path>', 'Installation path')
  .example('smart-install node python go')
  .action(async (packages: string[], options?: CliOption & { fallback?: boolean }) => {
    if (!packages.length) {
      console.error('❌ No packages specified')
      console.log('')
      console.log('💡 Usage examples:')
      console.log('  ./launchpad smart-install node python')
      console.log('  ./launchpad si go rust --verbose')
      process.exit(1)
    }

    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    if (options?.force)
      config.forceReinstall = true

    const fallbackToSystem = options?.fallback !== false
    const installPath = options?.path

    console.log(`🚀 Smart installing: ${packages.join(', ')}`)
    console.log('')

    // Import smart install functionality
    try {
      const { smartInstall, isPackageInstalled, getManualInstallInstructions } = await import('../src/smart-install')

      // Check which packages are already installed
      const alreadyInstalled: string[] = []
      const needInstallation: string[] = []

      for (const pkg of packages) {
        if (!config.forceReinstall && await isPackageInstalled(pkg)) {
          alreadyInstalled.push(pkg)
        }
        else {
          needInstallation.push(pkg)
        }
      }

      if (alreadyInstalled.length > 0) {
        console.log(`✅ Already installed: ${alreadyInstalled.join(', ')}`)
        if (!config.forceReinstall) {
          console.log('💡 Use --force to reinstall existing packages')
        }
        console.log('')
      }

      if (needInstallation.length === 0) {
        console.log('🎉 All packages are already installed!')
        return
      }

      // Try smart installation
      const result = await smartInstall({
        packages: needInstallation,
        installPath,
        fallbackToSystem,
        verbose: config.verbose,
      })

      if (result.success) {
        console.log(`✅ ${result.message}`)

        if (result.method !== 'pkgx' && installPath) {
          // For system installs, add path if specified
          const binDir = path.join(installPath, 'bin')
          if (!isInPath(binDir) && config.autoAddToPath) {
            console.log('')
            console.log('🛠️  Setting up PATH...')
            const added = addToPath(binDir)
            if (added) {
              console.log(`✅ Added ${binDir} to your PATH`)
            }
          }
        }

        if (result.failedPackages.length > 0) {
          console.log('')
          console.log(`⚠️  Some packages failed: ${result.failedPackages.join(', ')}`)
          console.log('')
          console.log(getManualInstallInstructions(result.failedPackages))
        }
      }
      else {
        console.error(`❌ Installation failed: ${result.message}`)
        console.log('')
        console.log(getManualInstallInstructions(needInstallation))
        process.exit(1)
      }
    }
    catch (error) {
      console.error('❌ Smart install failed:', error instanceof Error ? error.message : error)
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
      const isActive = await checkDevStatus()
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
