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
import { dump, integrate, shellcode } from '../src/dev'
import { Path } from '../src/path'
import { check_pkgx_autoupdate, configure_pkgx_autoupdate } from '../src/pkgx'
import { activateDevEnv, addToPath, checkDevStatus, deactivateDevEnv, isInPath, listActiveDevEnvs } from '../src/utils'

const execAsync = promisify(exec)
const cli = new CAC('launchpad')

cli.version(version)
cli.help()

// Check if this is a first-time run and auto-bootstrap if needed
async function checkFirstTimeRun() {
  // Only check for first-time run on commands that actually need tools installed
  const needsToolsCommands = ['install', 'i', 'dev:on', 'shim']
  const hasToolsCommand = process.argv.some(arg => needsToolsCommands.includes(arg))

  if (!hasToolsCommand) {
    return false
  }

  // Check if essential tools are available
  const checkTool = async (command: string): Promise<boolean> => {
    try {
      const { stdout } = await execAsync(`command -v ${command}`, { timeout: 2000 })
      return stdout.trim().length > 0
    }
    catch {
      return false
    }
  }

  const [hasPkgx] = await Promise.all([
    checkTool('pkgx'),
  ])

  // Check if shell integration is set up
  let hasShellIntegration = false
  try {
    const shell = process.env.SHELL || '/bin/bash'
    const shellName = path.basename(shell)

    let configFile = ''
    switch (shellName) {
      case 'zsh':
        configFile = path.join(process.env.HOME || '~', '.zshrc')
        break
      case 'bash':
        configFile = path.join(process.env.HOME || '~', '.bashrc')
        if (!fs.existsSync(configFile)) {
          configFile = path.join(process.env.HOME || '~', '.bash_profile')
        }
        break
      default:
        configFile = path.join(process.env.HOME || '~', '.profile')
    }

    if (fs.existsSync(configFile)) {
      const content = fs.readFileSync(configFile, 'utf8')
      hasShellIntegration = content.includes('_pkgx_chpwd_hook') || content.includes('launchpad dev:shellcode')
    }
  }
  catch {
    // Ignore shell integration check errors
  }

  // If any essential tools are missing, offer to bootstrap
  // Note: We don't check for bun here since this script is running with bun
  const missingTools = []
  if (!hasPkgx)
    missingTools.push('pkgx')
  if (!hasShellIntegration)
    missingTools.push('shell integration')

  if (missingTools.length > 0) {
    console.log('🚀 Welcome to Launchpad!')
    console.log('')
    console.log('It looks like this might be your first time running Launchpad.')
    console.log(`Missing components: ${missingTools.join(', ')}`)
    console.log('')
    console.log('Would you like to automatically set up everything you need?')
    console.log('This will install: pkgx, configure PATH, and set up shell integration.')
    console.log('')

    // Check if we're in an interactive terminal
    const isInteractive = process.stdin.isTTY && process.stdout.isTTY

    if (isInteractive) {
      // Interactive mode - prompt user
      const readline = await import('node:readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      const answer = await new Promise<string>((resolve) => {
        rl.question('🤔 Run bootstrap now? (Y/n): ', (answer) => {
          rl.close()
          resolve(answer.toLowerCase().trim())
        })
      })

      if (answer === '' || answer === 'y' || answer === 'yes') {
        console.log('')
        console.log('🎯 Running bootstrap...')
        console.log('')

        // Run bootstrap programmatically
        try {
          await runBootstrap({ verbose: true, skipBun: true }) // Skip bun since we're already running with it
          console.log('')
          console.log('🎉 Bootstrap completed! You can now use Launchpad.')
          console.log('')
          return true
        }
        catch (error) {
          console.error('❌ Bootstrap failed:', error instanceof Error ? error.message : String(error))
          console.log('')
          console.log('💡 You can run bootstrap manually later with:')
          console.log('   ./launchpad bootstrap')
          console.log('')
        }
      }
      else {
        console.log('')
        console.log('⏭️  Skipping bootstrap. You can run it later with:')
        console.log('   ./launchpad bootstrap')
        console.log('')
      }
    }
    else {
      // Non-interactive mode - show instructions
      console.log('💡 To set up Launchpad automatically, run:')
      console.log('   ./launchpad bootstrap')
      console.log('')
      console.log('Or to continue without setup, use specific commands like:')
      console.log('   ./launchpad install node')
      console.log('   ./launchpad --help')
      console.log('')
    }
  }

  return false
}

// Extracted bootstrap logic to be reusable
async function runBootstrap(options: {
  verbose?: boolean
  force?: boolean
  autoPath?: boolean
  skipPkgx?: boolean
  skipBun?: boolean
  skipShellIntegration?: boolean
  path?: string
} = {}) {
  // Set config from options
  if (options.verbose)
    config.verbose = true
  if (options.force)
    config.forceReinstall = true
  if (options.autoPath === false)
    config.autoAddToPath = false

  // Determine installation path
  const installPath = options.path ? new Path(options.path) : install_prefix()

  console.log('🚀 Bootstrapping Launchpad - Installing essential tools...')
  console.log(`📍 Installation prefix: ${installPath.string}`)
  console.log('')

  const results: { tool: string, status: 'success' | 'failed' | 'skipped' | 'already-installed', message?: string }[] = []

  // Helper function to check if a tool is already installed
  const isToolInstalled = async (command: string): Promise<boolean> => {
    try {
      const { stdout } = await execAsync(`command -v ${command}`, { timeout: 2000 })
      return stdout.trim().length > 0
    }
    catch {
      return false
    }
  }

  // Helper function to add result
  const addResult = (tool: string, status: typeof results[0]['status'], message?: string) => {
    results.push({ tool, status, message })
    const emoji = status === 'success' ? '✅' : status === 'failed' ? '❌' : status === 'skipped' ? '⏭️' : '🔄'
    console.log(`${emoji} ${tool}: ${message || status}`)
  }

  // 1. Install pkgx
  if (!options.skipPkgx) {
    console.log('📦 Installing pkgx...')

    if (!config.forceReinstall && await isToolInstalled('pkgx')) {
      addResult('pkgx', 'already-installed', 'already installed')
    }
    else {
      try {
        // Use the existing pkgx installation logic
        console.log('Installing pkgx using official installer...')

        // Download and run the official pkgx installer
        const { stdout, stderr } = await execAsync('curl -fsSL https://pkgx.sh | bash', {
          timeout: 60000,
          env: { ...process.env, PKGX_DIR: installPath.string },
        })

        if (config.verbose) {
          console.log('pkgx installer output:', stdout)
          if (stderr)
            console.log('pkgx installer stderr:', stderr)
        }

        // Verify installation
        if (await isToolInstalled('pkgx')) {
          addResult('pkgx', 'success', 'installed successfully')
        }
        else {
          addResult('pkgx', 'failed', 'installation completed but pkgx not found in PATH')
        }
      }
      catch (error) {
        addResult('pkgx', 'failed', error instanceof Error ? error.message : String(error))
      }
    }
  }
  else {
    addResult('pkgx', 'skipped', 'skipped by user')
  }

  console.log('')

  // 2. Install bun
  if (!options.skipBun) {
    console.log('🐰 Installing Bun...')

    if (!config.forceReinstall && await isToolInstalled('bun')) {
      addResult('bun', 'already-installed', 'already installed')
    }
    else {
      try {
        const createdFiles = await install_bun(installPath.string)
        addResult('bun', 'success', `installed to ${path.join(installPath.string, 'bin')}`)

        if (config.verbose) {
          console.log('Created files:', createdFiles)
        }
      }
      catch (error) {
        addResult('bun', 'failed', error instanceof Error ? error.message : String(error))
      }
    }
  }
  else {
    addResult('bun', 'skipped', 'skipped by user')
  }

  console.log('')

  // 3. Setup PATH
  console.log('🛤️  Setting up PATH...')
  const binDir = path.join(installPath.string, 'bin')
  const sbinDir = path.join(installPath.string, 'sbin')

  if (config.autoAddToPath) {
    let pathUpdated = false

    if (!isInPath(binDir)) {
      const added = addToPath(binDir)
      if (added) {
        console.log(`✅ Added ${binDir} to PATH`)
        pathUpdated = true
      }
      else {
        console.log(`⚠️  Could not automatically add ${binDir} to PATH`)
      }
    }
    else {
      console.log(`✅ ${binDir} already in PATH`)
    }

    if (!isInPath(sbinDir)) {
      const added = addToPath(sbinDir)
      if (added) {
        console.log(`✅ Added ${sbinDir} to PATH`)
        pathUpdated = true
      }
      else {
        console.log(`⚠️  Could not automatically add ${sbinDir} to PATH`)
      }
    }
    else {
      console.log(`✅ ${sbinDir} already in PATH`)
    }

    if (pathUpdated) {
      addResult('PATH setup', 'success', 'PATH updated successfully')
    }
    else {
      addResult('PATH setup', 'success', 'PATH already configured')
    }
  }
  else {
    addResult('PATH setup', 'skipped', 'auto PATH setup disabled')
  }

  console.log('')

  // 4. Shell integration setup
  if (!options.skipShellIntegration) {
    console.log('🐚 Setting up shell integration...')

    try {
      // Detect user's shell
      const userShell = process.env.SHELL || '/bin/bash'
      const shellName = path.basename(userShell)

      let configFile = ''
      switch (shellName) {
        case 'zsh':
          configFile = path.join(process.env.HOME || '~', '.zshrc')
          break
        case 'bash':
          configFile = path.join(process.env.HOME || '~', '.bashrc')
          if (!fs.existsSync(configFile)) {
            configFile = path.join(process.env.HOME || '~', '.bash_profile')
          }
          break
        case 'fish':
          configFile = path.join(process.env.HOME || '~', '.config', 'fish', 'config.fish')
          break
        default:
          configFile = path.join(process.env.HOME || '~', '.profile')
      }

      // Check if integration is already set up
      let integrationExists = false
      if (fs.existsSync(configFile)) {
        const content = fs.readFileSync(configFile, 'utf8')
        integrationExists = content.includes('_pkgx_chpwd_hook') || content.includes('launchpad dev:shellcode')
      }

      if (!integrationExists || config.forceReinstall) {
        // Add shell integration
        const integrationCommand = `\n# Launchpad dev environment integration\neval "$(launchpad dev:shellcode)"\n`

        // Create config file directory if it doesn't exist
        await fs.promises.mkdir(path.dirname(configFile), { recursive: true })

        // Append integration to config file
        await fs.promises.appendFile(configFile, integrationCommand)

        addResult('shell integration', 'success', `added to ${configFile}`)
        console.log(`📝 Shell integration added to ${configFile}`)
        console.log(`💡 Restart your terminal or run: source ${configFile}`)
      }
      else {
        addResult('shell integration', 'already-installed', 'already configured')
      }
    }
    catch (error) {
      addResult('shell integration', 'failed', error instanceof Error ? error.message : String(error))
    }
  }
  else {
    addResult('shell integration', 'skipped', 'skipped by user')
  }

  console.log('')

  // 5. Summary
  console.log('📋 Bootstrap Summary:')
  console.log('═══════════════════')

  const successful = results.filter(r => r.status === 'success' || r.status === 'already-installed')
  const failed = results.filter(r => r.status === 'failed')
  const skipped = results.filter(r => r.status === 'skipped')

  successful.forEach(r => console.log(`✅ ${r.tool}: ${r.message || r.status}`))
  failed.forEach(r => console.log(`❌ ${r.tool}: ${r.message || r.status}`))
  skipped.forEach(r => console.log(`⏭️  ${r.tool}: ${r.message || r.status}`))

  console.log('')

  if (failed.length === 0) {
    console.log('🎉 Bootstrap completed successfully!')
    console.log('')
    console.log('🚀 Next steps:')
    console.log('1. Restart your terminal or run: source ~/.zshrc (or your shell config)')
    console.log('2. Test the setup: cd to a directory with deps.yml or dependencies.yaml')
    console.log('3. The environment should auto-activate!')
    console.log('')
    console.log('💡 You can also manually activate with: launchpad dev:on')
  }
  else {
    console.log(`⚠️  Bootstrap completed with ${failed.length} failed installation(s)`)
    console.log('')
    console.log('🔧 Manual installation options:')

    failed.forEach((r) => {
      switch (r.tool) {
        case 'pkgx':
          console.log('• pkgx: Visit https://pkgx.sh for manual installation')
          break
        case 'bun':
          console.log('• bun: Visit https://bun.sh for manual installation')
          break
      }
    })

    if (failed.length > 0) {
      throw new Error(`Bootstrap failed: ${failed.map(r => r.tool).join(', ')}`)
    }
  }
}

// Check for first-time run and offer auto-bootstrap
await checkFirstTimeRun()

interface CliOption {
  verbose: boolean
  path?: string
  sudo?: boolean
  force?: boolean
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
    // await ensurePkgxInstalled(installPath)

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
  .action(async (options?: CliOption & {
    autoPath?: boolean
    skipPkgx?: boolean
    skipBun?: boolean
    skipShellIntegration?: boolean
  }) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    if (options?.force)
      config.forceReinstall = true

    if (options?.autoPath === false)
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
      // await downloadAndInstallPkgx(installPath) // Function deleted - use standard installer

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
  .action(async (packages: string[], options?: CliOption & { autoPath?: boolean }) => {
    if (!packages || !packages.length) {
      console.error('No packages specified')
      process.exit(1)
    }

    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    if (options?.force)
      config.forceReinstall = true

    if (options?.autoPath === false)
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
  .action(async (options?: CliOption & { autoPath?: boolean, version?: string }) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    if (options?.force)
      config.forceReinstall = true

    if (options?.autoPath === false)
      config.autoAddToPath = false

    // Determine installation path
    const installPath = options?.path
      ? new Path(options.path)
      : install_prefix()

    try {
      // For the bun command specifically, we want to allow running even without bun installed
      // We'll try to use the install_bun function directly

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
          console.log('Bun is not currently installed. Installing...')
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
      try {
        const { stdout } = await execAsync(`${path.join(binDir, 'bun')} --version`, { encoding: 'utf8' })
        console.log('✅ Bun has been successfully installed!')
        console.log(`Version: ${stdout.trim()}`)

        // Provide instructions for using dev features
        console.log('')
        console.log('To activate the dev environment and make bun available:')
        console.log('  launchpad dev:on')
        console.log('  # or with absolute path')
        console.log(`  ${path.join(binDir, 'bun')} launchpad dev:on`)
      }
      catch {
        console.log('✅ Bun has been installed but unable to determine version')
        console.log(`Check installation with: ${path.join(binDir, 'bun')} --version`)
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
  .action(async (options?: CliOption & { autoPath?: boolean }) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    if (options?.force)
      config.forceReinstall = true

    if (options?.autoPath === false)
      config.autoAddToPath = false

    // Determine installation path
    const installPath = options?.path
      ? new Path(options.path)
      : install_prefix()

    // Ensure pkgx is installed before proceeding
    // await ensurePkgxInstalled(installPath)

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
  .command('dev:on [directory]', 'Activate dev environment in directory')
  .option('--verbose', 'Enable verbose logging')
  .action(async (directory?: string, options?: CliOption) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    const targetDir = directory ? path.resolve(directory) : process.cwd()

    try {
      // First, check for dependency files
      const depsFiles = [
        'dependencies.yaml',
        'dependencies.yml',
        'pkgx.yaml',
        'pkgx.yml',
      ]

      const depsFile = depsFiles.find(file => fs.existsSync(path.join(targetDir, file)))

      if (!depsFile) {
        console.log('❌ No dependency files found in directory')
        process.exit(1)
      }

      // Check if file contains bun as a dependency
      let fileContent = ''
      try {
        fileContent = fs.readFileSync(path.join(targetDir, depsFile), 'utf8')
      }
      catch (err) {
        console.error(`Failed to read ${depsFile}:`, err instanceof Error ? err.message : String(err))
        process.exit(1)
      }

      // Check if the dependency file contains bun
      const hasBun = fileContent.includes('bun.sh') || fileContent.includes('bun:') || fileContent.includes('bun@')

      // Try to check if bun is already available
      let bunInstalled = false
      try {
        await execAsync('command -v bun', { timeout: 2000 })
        bunInstalled = true
      }
      catch {
        // Bun not available, we'll need to install it
      }

      // Use pkgx to activate environment
      console.log(`Activating dev environment from ${depsFile}...`)

      try {
        // 1. Make sure the dev environment is set up
        const activated = await activateDevEnv(targetDir)

        if (!activated) {
          console.log('❌ Failed to activate dev environment')
          process.exit(1)
        }

        // 2. If bun is needed but not installed, install it
        if (hasBun && !bunInstalled) {
          console.log('🔄 Installing bun via pkgx...')

          try {
            const { stdout } = await execAsync('command -v pkgx', { timeout: 2000 })
            if (stdout) {
              // Use pkgx to install bun
              await execAsync('pkgx +bun.sh -- echo "Bun is now available"', {
                timeout: 30000,
                cwd: targetDir,
              })

              // Now also perform an explicit install to make sure binaries are available
              try {
                console.log('📦 Installing bun permanently to make it available in PATH...')
                await install(['bun.sh'], install_prefix().string)
                console.log('✅ Bun installed successfully')
              }
              catch (installErr) {
                console.warn('⚠️ Could not permanently install bun:', installErr instanceof Error ? installErr.message : String(installErr))
                console.warn('You may need to use pkgx +bun.sh -- to run bun commands')
              }
            }
          }
          catch {
            console.warn('⚠️ pkgx not available, unable to install bun automatically')
          }
        }

        console.log(`✅ Dev environment activated in ${targetDir}`)
        console.log('')
        console.log('To use this environment, you may need to run:')
        console.log('  source ~/.zshrc  # or your shell config file')
        console.log('')
        console.log('Or restart your terminal')
      }
      catch (error) {
        console.error('Failed to activate dev environment:', error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    }
    catch (error) {
      console.error('Failed to activate dev environment:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

cli
  .command('dev:dump [directory]', 'Generate environment setup script')
  .option('--verbose', 'Enable verbose logging')
  .option('--dryrun', 'Show packages without generating script')
  .option('--quiet', 'Suppress status messages')
  .action(async (directory?: string, options?: CliOption & { dryrun?: boolean, quiet?: boolean }) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    const targetDir = directory ? path.resolve(directory) : process.cwd()

    try {
      const { dump } = await import('../src/dev')
      await dump(targetDir, {
        dryrun: options?.dryrun || false,
        quiet: options?.quiet || false,
      })
    }
    catch (error) {
      console.error('Failed to generate environment script:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

cli
  .command('dev:shellcode', 'Generate shell integration code')
  .action(async () => {
    try {
      const { shellcode } = await import('../src/dev')
      console.log(shellcode())
    }
    catch (error) {
      console.error('Failed to generate shell code:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

cli
  .command('bootstrap', 'Install all essential tools (pkgx, bun, etc.) for a complete Launchpad setup')
  .option('--path <path>', 'Installation path')
  .option('--verbose', 'Enable verbose logging')
  .option('--force', 'Force reinstall even if already installed')
  .option('--no-auto-path', 'Do not automatically add to PATH')
  .option('--skip-pkgx', 'Skip pkgx installation')
  .option('--skip-bun', 'Skip bun installation')
  .option('--skip-shell-integration', 'Skip shell integration setup')
  .example('bootstrap')
  .example('bootstrap --verbose --force')
  .action(async (options?: CliOption & {
    autoPath?: boolean
    skipPkgx?: boolean
    skipBun?: boolean
    skipShellIntegration?: boolean
  }) => {
    try {
      await runBootstrap({
        verbose: options?.verbose,
        force: options?.force,
        autoPath: options?.autoPath,
        skipPkgx: options?.skipPkgx,
        skipBun: options?.skipBun,
        skipShellIntegration: options?.skipShellIntegration,
        path: options?.path,
      })
    }
    catch (error) {
      console.error('Bootstrap failed:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

cli
  .command('uninstall', 'Completely remove Launchpad and all installed packages')
  .option('--verbose', 'Enable verbose logging')
  .option('--force', 'Skip confirmation prompts')
  .option('--keep-packages', 'Keep installed packages, only remove shell integration')
  .option('--keep-shell-integration', 'Keep shell integration, only remove packages')
  .option('--dry-run', 'Show what would be removed without actually removing it')
  .example('uninstall')
  .example('uninstall --force --verbose')
  .example('uninstall --keep-packages')
  .action(async (options?: CliOption & {
    keepPackages?: boolean
    keepShellIntegration?: boolean
    dryRun?: boolean
  }) => {
    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    const isDryRun = options?.dryRun || false
    const keepPackages = options?.keepPackages || false
    const keepShellIntegration = options?.keepShellIntegration || false

    console.log('🗑️  Launchpad Uninstaller')
    console.log('')

    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - Nothing will actually be removed')
      console.log('')
    }

    // Check what's currently installed/configured
    const installPath = install_prefix()
    const results: {
      item: string
      action: 'removed' | 'kept' | 'not-found' | 'failed'
      path?: string
      details?: string
    }[] = []

    // Helper function to add result
    const addResult = (item: string, action: typeof results[0]['action'], path?: string, details?: string) => {
      results.push({ item, action, path, details })
      const emoji = action === 'removed' ? '🗑️' : action === 'kept' ? '⏭️' : action === 'failed' ? '❌' : '❓'
      const message = path ? `${item}: ${path}` : item
      console.log(`${emoji} ${message}${details ? ` (${details})` : ''}`)
    }

    // 1. Show what will be affected
    if (!keepPackages) {
      console.log('📦 Scanning installed packages...')

      try {
        const packages = await list(installPath.string)
        if (packages.length > 0) {
          console.log(`Found ${packages.length} installed packages:`)
          packages.forEach(pkg => console.log(`  • ${pkg.project}@${pkg.version}`))
        }
        else {
          console.log('No packages found')
        }
        console.log('')
      }
      catch (error) {
        console.log('⚠️  Could not scan packages:', error instanceof Error ? error.message : String(error))
        console.log('')
      }
    }

    // 2. Check shell integration
    if (!keepShellIntegration) {
      console.log('🐚 Checking shell integration...')

      const shell = process.env.SHELL || '/bin/bash'
      const shellName = path.basename(shell)

      let configFile = ''
      switch (shellName) {
        case 'zsh':
          configFile = path.join(process.env.HOME || '~', '.zshrc')
          break
        case 'bash':
          configFile = path.join(process.env.HOME || '~', '.bashrc')
          if (!fs.existsSync(configFile)) {
            configFile = path.join(process.env.HOME || '~', '.bash_profile')
          }
          break
        case 'fish':
          configFile = path.join(process.env.HOME || '~', '.config', 'fish', 'config.fish')
          break
        default:
          configFile = path.join(process.env.HOME || '~', '.profile')
      }

      let hasIntegration = false
      if (fs.existsSync(configFile)) {
        const content = fs.readFileSync(configFile, 'utf8')
        hasIntegration = content.includes('_pkgx_chpwd_hook') || content.includes('launchpad dev:shellcode')
      }

      if (hasIntegration) {
        console.log(`Shell integration found in: ${configFile}`)
      }
      else {
        console.log('No shell integration found')
      }
      console.log('')
    }

    // 3. Get confirmation (unless forced or dry run)
    if (!options?.force && !isDryRun) {
      const readline = await import('node:readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      const items: string[] = []
      if (!keepPackages)
        items.push('all installed packages')
      if (!keepShellIntegration)
        items.push('shell integration')

      const answer = await new Promise<string>((resolve) => {
        rl.question(`⚠️  This will remove: ${items.join(', ')}.\n🤔 Continue? (y/N): `, (answer) => {
          rl.close()
          resolve(answer.toLowerCase().trim())
        })
      })

      if (answer !== 'y' && answer !== 'yes') {
        console.log('')
        console.log('⏭️  Uninstall cancelled')
        return
      }
      console.log('')
    }

    console.log('🗑️  Starting uninstall process...')
    console.log('')

    // 4. Remove packages and directories
    if (!keepPackages) {
      console.log('📦 Removing installed packages...')

      try {
        // Remove the entire installation directory
        const installDir = installPath.string
        const binDir = path.join(installDir, 'bin')
        const sbinDir = path.join(installDir, 'sbin')
        const pkgsDir = path.join(installDir, 'pkgs')

        // Remove individual directories
        for (const dir of [binDir, sbinDir, pkgsDir]) {
          if (fs.existsSync(dir)) {
            if (!isDryRun) {
              await fs.promises.rm(dir, { recursive: true, force: true })
            }
            addResult('directory', 'removed', dir)
          }
          else {
            addResult('directory', 'not-found', dir)
          }
        }

        // Clean up any remaining shims
        const shimDirectory = shim_dir().string
        if (fs.existsSync(shimDirectory)) {
          if (!isDryRun) {
            await fs.promises.rm(shimDirectory, { recursive: true, force: true })
          }
          addResult('shim directory', 'removed', shimDirectory)
        }
        else {
          addResult('shim directory', 'not-found', shimDirectory)
        }
      }
      catch (error) {
        addResult('package removal', 'failed', '', error instanceof Error ? error.message : String(error))
      }
    }
    else {
      addResult('packages', 'kept', '', 'user requested to keep')
    }

    console.log('')

    // 5. Remove shell integration
    if (!keepShellIntegration) {
      console.log('🐚 Removing shell integration...')

      const shell = process.env.SHELL || '/bin/bash'
      const shellName = path.basename(shell)

      let configFile = ''
      switch (shellName) {
        case 'zsh':
          configFile = path.join(process.env.HOME || '~', '.zshrc')
          break
        case 'bash':
          configFile = path.join(process.env.HOME || '~', '.bashrc')
          if (!fs.existsSync(configFile)) {
            configFile = path.join(process.env.HOME || '~', '.bash_profile')
          }
          break
        case 'fish':
          configFile = path.join(process.env.HOME || '~', '.config', 'fish', 'config.fish')
          break
        default:
          configFile = path.join(process.env.HOME || '~', '.profile')
      }

      try {
        if (fs.existsSync(configFile)) {
          const content = fs.readFileSync(configFile, 'utf8')
          const hasIntegration = content.includes('_pkgx_chpwd_hook') || content.includes('launchpad dev:shellcode')

          if (hasIntegration) {
            if (!isDryRun) {
              // Remove lines containing launchpad integration
              const lines = content.split('\n')
              const filteredLines = lines.filter(line =>
                !line.includes('launchpad dev:shellcode')
                && !line.includes('Launchpad dev environment integration'),
              )

              // Also remove any remaining _pkgx_* function definitions or calls
              const cleanedLines = filteredLines.filter((line) => {
                const trimmed = line.trim()
                return !trimmed.startsWith('_pkgx_')
                  && !trimmed.includes('_pkgx_chpwd_hook')
                  && !trimmed.includes('_pkgx_dev_try_bye')
              })

              await fs.promises.writeFile(configFile, cleanedLines.join('\n'))
            }
            addResult('shell integration', 'removed', configFile)
          }
          else {
            addResult('shell integration', 'not-found', configFile)
          }
        }
        else {
          addResult('shell config', 'not-found', configFile)
        }
      }
      catch (error) {
        addResult('shell integration', 'failed', configFile, error instanceof Error ? error.message : String(error))
      }
    }
    else {
      addResult('shell integration', 'kept', '', 'user requested to keep')
    }

    console.log('')

    // 6. Clean up PATH modifications
    if (!keepPackages) {
      console.log('🛤️  Cleaning up PATH modifications...')

      // Note: We can't automatically remove PATH modifications from shell configs
      // because they might be mixed with user's own PATH modifications
      console.log('⚠️  Manual PATH cleanup may be required')
      console.log(`Check your shell config (${path.basename(process.env.SHELL || 'shell')}) for these entries:`)
      console.log(`  • ${path.join(installPath.string, 'bin')}`)
      console.log(`  • ${path.join(installPath.string, 'sbin')}`)
      console.log(`  • ${shim_dir().string}`)

      addResult('PATH cleanup', 'kept', '', 'requires manual review')
    }

    console.log('')

    // 7. Summary
    console.log('📋 Uninstall Summary:')
    console.log('═══════════════════')

    const removed = results.filter(r => r.action === 'removed')
    const kept = results.filter(r => r.action === 'kept')
    const failed = results.filter(r => r.action === 'failed')
    const notFound = results.filter(r => r.action === 'not-found')

    removed.forEach(r => console.log(`🗑️  ${r.item}${r.path ? `: ${r.path}` : ''}${r.details ? ` (${r.details})` : ''}`))
    kept.forEach(r => console.log(`⏭️  ${r.item}${r.path ? `: ${r.path}` : ''}${r.details ? ` (${r.details})` : ''}`))
    failed.forEach(r => console.log(`❌ ${r.item}${r.path ? `: ${r.path}` : ''}${r.details ? ` (${r.details})` : ''}`))
    if (config.verbose) {
      notFound.forEach(r => console.log(`❓ ${r.item}${r.path ? `: ${r.path}` : ''} (not found)`))
    }

    console.log('')

    if (isDryRun) {
      console.log('🔍 DRY RUN COMPLETED - No changes were made')
      console.log('💡 Run without --dry-run to actually perform the uninstall')
    }
    else if (failed.length === 0) {
      console.log('🎉 Uninstall completed successfully!')
      console.log('')
      console.log('🔄 To complete the cleanup:')
      console.log('1. Restart your terminal or run: source ~/.zshrc (or your shell config)')
      console.log('2. Manually review and clean up any remaining PATH entries')
      console.log('3. Remove any remaining pkgx installation if desired')
    }
    else {
      console.log(`⚠️  Uninstall completed with ${failed.length} error(s)`)
      console.log('💡 Some items may require manual removal')
    }

    if (!keepPackages && !isDryRun) {
      console.log('')
      console.log('👋 Thank you for using Launchpad!')
    }
  })

cli
  .command('remove [packages...]', 'Remove specific installed packages')
  .alias('rm')
  .alias('uninstall-package')
  .option('--verbose', 'Enable verbose logging')
  .option('--force', 'Skip confirmation prompts')
  .option('--dry-run', 'Show what would be removed without actually removing it')
  .option('--path <path>', 'Installation path to remove packages from')
  .example('remove node python')
  .example('rm node@22 --force')
  .example('remove python --dry-run')
  .action(async (packages: string[], options?: CliOption & {
    dryRun?: boolean
  }) => {
    // Ensure packages is always an array
    const packageList = Array.isArray(packages) ? packages : (packages ? [packages] : [])

    if (!packageList || !packageList.length) {
      console.error('❌ No packages specified for removal')
      console.log('')
      console.log('💡 Usage examples:')
      console.log('  ./launchpad remove node python')
      console.log('  ./launchpad rm node@22 --force')
      console.log('  ./launchpad remove python --dry-run')
      process.exit(1)
      return
    }

    // Override config options from CLI
    if (options?.verbose)
      config.verbose = true

    const isDryRun = options?.dryRun || false
    const installPath = options?.path ? new Path(options.path) : install_prefix()

    console.log(`🗑️  Removing packages: ${packageList.join(', ')}`)
    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - Nothing will actually be removed')
    }
    console.log('')

    const results: {
      package: string
      action: 'removed' | 'not-found' | 'failed'
      files?: string[]
      details?: string
    }[] = []

    try {
      // Get list of installed packages
      const installedPackages = await list(installPath.string)

      if (installedPackages.length === 0) {
        console.log('📦 No packages are currently installed')
        return
      }

      console.log('📦 Scanning installed packages...')
      console.log(`Found ${installedPackages.length} installed packages`)

      if (config.verbose) {
        installedPackages.forEach(pkg => console.log(`  • ${pkg.project}@${pkg.version}`))
      }
      console.log('')

      // Process each package to remove
      for (const packageSpec of packageList) {
        console.log(`🔍 Looking for package: ${packageSpec}`)

        // Find matching installed packages
        // Handle both 'node' and 'node@version' formats
        const [packageName, requestedVersion] = packageSpec.split('@')

        const matchingPackages = installedPackages.filter((pkg) => {
          // Check if package name matches (handle various formats)
          const pkgBaseName = pkg.project.split('.')[0] || pkg.project
          const nameMatches = pkgBaseName === packageName
            || pkg.project === packageName
            || pkg.project.includes(packageName)

          if (!nameMatches)
            return false

          // If version specified, check version match
          if (requestedVersion) {
            return pkg.version.toString() === requestedVersion
          }

          return true
        })

        if (matchingPackages.length === 0) {
          console.log(`❓ Package ${packageSpec} not found in installed packages`)
          results.push({
            package: packageSpec,
            action: 'not-found',
            details: 'not installed',
          })
          continue
        }

        // Show what will be removed
        console.log(`Found ${matchingPackages.length} matching package(s):`)
        matchingPackages.forEach(pkg => console.log(`  • ${pkg.project}@${pkg.version}`))

        // Get confirmation for this package (unless forced or dry run)
        if (!options?.force && !isDryRun && matchingPackages.length > 0) {
          const readline = await import('node:readline')
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          })

          const answer = await new Promise<string>((resolve) => {
            rl.question(`🤔 Remove ${matchingPackages.length} package(s) for '${packageSpec}'? (y/N): `, (answer) => {
              rl.close()
              resolve(answer.toLowerCase().trim())
            })
          })

          if (answer !== 'y' && answer !== 'yes') {
            console.log(`⏭️  Skipping ${packageSpec}`)
            results.push({
              package: packageSpec,
              action: 'not-found',
              details: 'user cancelled',
            })
            continue
          }
        }

        // Remove the package files
        try {
          const removedFiles: string[] = []

          for (const pkg of matchingPackages) {
            // Remove from bin directory
            const binDir = path.join(installPath.string, 'bin')
            const sbinDir = path.join(installPath.string, 'sbin')
            const pkgDir = path.join(installPath.string, 'pkgs', pkg.project)

            // Find and remove binary files
            for (const dir of [binDir, sbinDir]) {
              if (fs.existsSync(dir)) {
                const files = await fs.promises.readdir(dir)
                for (const file of files) {
                  const filePath = path.join(dir, file)
                  try {
                    // Check if this file belongs to the package
                    const stats = await fs.promises.lstat(filePath)

                    // For symlinks, check if they point to our package
                    if (stats.isSymbolicLink()) {
                      const linkTarget = await fs.promises.readlink(filePath)
                      if (linkTarget.includes(pkg.project)) {
                        if (!isDryRun) {
                          await fs.promises.unlink(filePath)
                        }
                        removedFiles.push(filePath)
                      }
                    }
                    // For regular files, check if they're in a package-specific directory
                    else if (filePath.includes(pkg.project)) {
                      if (!isDryRun) {
                        await fs.promises.unlink(filePath)
                      }
                      removedFiles.push(filePath)
                    }
                  }
                  catch (error) {
                    if (config.verbose) {
                      console.log(`⚠️  Could not check/remove ${filePath}:`, error instanceof Error ? error.message : String(error))
                    }
                  }
                }
              }
            }

            // Remove package directory if it exists
            if (fs.existsSync(pkgDir)) {
              if (!isDryRun) {
                await fs.promises.rm(pkgDir, { recursive: true, force: true })
              }
              removedFiles.push(pkgDir)
            }
          }

          // Also remove any shims that might exist
          const shimDirectory = shim_dir().string
          if (fs.existsSync(shimDirectory)) {
            const shimFiles = await fs.promises.readdir(shimDirectory)
            for (const shimFile of shimFiles) {
              const shimPath = path.join(shimDirectory, shimFile)
              try {
                // Check if shim file relates to our package
                const content = await fs.promises.readFile(shimPath, 'utf8')
                const relatedToPackage = matchingPackages.some(pkg =>
                  content.includes(pkg.project) || shimFile.includes(packageName),
                )

                if (relatedToPackage) {
                  if (!isDryRun) {
                    await fs.promises.unlink(shimPath)
                  }
                  removedFiles.push(shimPath)
                }
              }
              catch (error) {
                // Ignore shim check errors
              }
            }
          }

          if (removedFiles.length > 0) {
            console.log(`✅ ${isDryRun ? 'Would remove' : 'Removed'} ${removedFiles.length} files for ${packageSpec}`)
            if (config.verbose) {
              removedFiles.forEach(file => console.log(`  🗑️  ${file}`))
            }

            results.push({
              package: packageSpec,
              action: 'removed',
              files: removedFiles,
            })
          }
          else {
            console.log(`❓ No files found to remove for ${packageSpec}`)
            results.push({
              package: packageSpec,
              action: 'not-found',
              details: 'no files found',
            })
          }
        }
        catch (error) {
          console.error(`❌ Failed to remove ${packageSpec}:`, error instanceof Error ? error.message : String(error))
          results.push({
            package: packageSpec,
            action: 'failed',
            details: error instanceof Error ? error.message : String(error),
          })
        }

        console.log('')
      }

      // Summary
      console.log('📋 Removal Summary:')
      console.log('═══════════════════')

      const removed = results.filter(r => r.action === 'removed')
      const notFound = results.filter(r => r.action === 'not-found')
      const failed = results.filter(r => r.action === 'failed')

      removed.forEach((r) => {
        const fileCount = r.files?.length || 0
        console.log(`✅ ${r.package}: removed ${fileCount} files`)
      })

      notFound.forEach(r => console.log(`❓ ${r.package}: ${r.details || 'not found'}`))
      failed.forEach(r => console.log(`❌ ${r.package}: ${r.details || 'failed'}`))

      console.log('')

      if (isDryRun) {
        console.log('🔍 DRY RUN COMPLETED - No changes were made')
        console.log('💡 Run without --dry-run to actually remove the packages')
      }
      else if (removed.length > 0) {
        console.log(`🎉 Successfully removed ${removed.length} package(s)!`)

        if (failed.length > 0) {
          console.log(`⚠️  ${failed.length} package(s) failed to remove completely`)
        }

        // Check if any packages are still installed
        try {
          const remainingPackages = await list(installPath.string)
          if (remainingPackages.length > 0) {
            console.log(`📦 ${remainingPackages.length} packages still installed`)
          }
          else {
            console.log('📦 No packages remaining - consider running `launchpad uninstall` for complete cleanup')
          }
        }
        catch {
          // Ignore error checking remaining packages
        }
      }
      else {
        console.log('⚠️  No packages were removed')
      }
    }
    catch (error) {
      console.error('❌ Failed to remove packages:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

cli.parse()
