#!/usr/bin/env bun
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { CAC } from 'cac'
import { resolveCommand } from '../src/commands'
import { config } from '../src/config'
// Avoid importing the dev barrel here to prevent parsing heavy modules at startup
// doctor helpers no longer needed here; delegated via modular command
// import { formatDoctorReport, runDoctorChecks } from '../src/doctor'
// info helpers no longer needed here; delegated via modular command
// import { formatPackageInfo, formatPackageNotFound, getDetailedPackageInfo, packageExists } from '../src/info'
// search helpers no longer needed here; delegated via modular command
// import { formatSearchResults, getPopularPackages, searchPackages } from '../src/search'
// shim helpers no longer needed here; delegated via modular command
// import { create_shim, shim_dir } from '../src/shim'
// tags helpers no longer needed here; delegated via modular command
// import { formatCategoriesList, formatPackagesByCategory, formatTagSearchResults, getAvailableCategories, getPackagesByCategory, searchPackagesByTag } from '../src/tags'
process.env.LAUNCHPAD_CLI_MODE = '1'
// Import package.json for version
const packageJson = await import('../package.json')
const version = packageJson.default?.version || packageJson.version || '0.0.0'

// Experimental: lightweight modular router (opt-in)
if (process.env.LAUNCHPAD_USE_ROUTER === '1') {
  const { runCLI } = await import('../src/cli/router')
  const code = await runCLI(process.argv.slice(2))
  process.exit(code)
}

// Default version for setup command (derived from package.json version)
const DEFAULT_SETUP_VERSION = `v${version}`

const cli = new CAC('launchpad')

cli.version(version)
cli.help()

// Config command - show resolved user configuration
cli
  .command('config', 'Show current Launchpad configuration')
  .option('--json', 'Output as JSON (default)')
  .example('launchpad config')
  .example('launchpad config --json')
  .action(async (options?: { json?: boolean }) => {
    try {
      const argv: string[] = []
      if (options?.json)
        argv.push('--json')
      const cmd = await resolveCommand('config')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to load configuration:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Main installation command
cli
  .command('install [packages...]', 'Install packages or set up development environment')
  .alias('i')
  .alias('add')
  .option('--verbose', 'Enable verbose output')
  .option('--path <path>', 'Custom installation path')
  .option('-g, --global', 'Install packages globally (or scan for all global dependencies if no packages specified)')
  .option('--deps-only', 'Install only the dependencies of packages, not the packages themselves')
  .option('--dry-run', 'Show packages that would be installed without installing them')
  .option('--quiet', 'Suppress non-error output')
  .option('--shell', 'Output shell code for evaluation (use with eval)')
  .example('launchpad install node python')
  .example('launchpad install --path ~/.local node python')
  .example('launchpad install php --deps-only')
  .example('launchpad install')
  .example('launchpad install ./my-project')
  .example('launchpad install -g')
  .example('launchpad install starship -g')
  .example('launchpad add node python')
  .action(async (packages: string[], options: {
    verbose?: boolean
    path?: string
    global?: boolean
    depsOnly?: boolean
    dryRun?: boolean
    quiet?: boolean
    shell?: boolean
  }) => {
    try {
      const argv: string[] = []
      const list = Array.isArray(packages) ? packages : [packages].filter(Boolean)
      argv.push(...list)
      if (options.verbose)
        argv.push('--verbose')
      if (options.path)
        argv.push('--path', options.path)
      if (options.global)
        argv.push('--global')
      if (options.depsOnly)
        argv.push('--deps-only')
      if (options.dryRun)
        argv.push('--dry-run')
      if (options.quiet)
        argv.push('--quiet')
      if (options.shell)
        argv.push('--shell')
      const cmd = await resolveCommand('install')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Installation failed:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Search command
cli
  .command('search [term]', 'Search for available packages')
  .alias('find')
  .option('--limit <number>', 'Maximum number of results to show')
  .option('--compact', 'Show compact output format')
  .option('--no-programs', 'Exclude program names from search')
  .option('--case-sensitive', 'Case sensitive search')
  .example('launchpad search node')
  .example('launchpad search "web server" --limit 10')
  .example('launchpad search python --compact')
  .action(async (term?: string, options?: {
    limit?: string
    compact?: boolean
    programs?: boolean
    caseSensitive?: boolean
  }) => {
    try {
      const argv: string[] = []
      if (term && term.trim().length > 0)
        argv.push(term)
      if (options?.limit) {
        argv.push('--limit', String(options.limit))
      }
      if (options?.compact)
        argv.push('--compact')
      if (options?.programs === false)
        argv.push('--no-programs')
      if (options?.caseSensitive)
        argv.push('--case-sensitive')
      const cmd = await resolveCommand('search')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Search failed:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Info command
cli
  .command('info <package>', 'Show detailed information about a package')
  .alias('show')
  .option('--versions', 'Show available versions')
  .option('--no-programs', 'Hide program list')
  .option('--no-dependencies', 'Hide dependencies')
  .option('--no-companions', 'Hide companion packages')
  .option('--compact', 'Show compact output format')
  .example('launchpad info node')
  .example('launchpad info python --versions')
  .example('launchpad show rust --compact')
  .action(async (packageName: string, options?: {
    versions?: boolean
    programs?: boolean
    dependencies?: boolean
    companions?: boolean
    compact?: boolean
  }) => {
    try {
      const argv: string[] = [packageName]
      if (options?.versions)
        argv.push('--versions')
      if (options?.programs === false)
        argv.push('--no-programs')
      if (options?.dependencies === false)
        argv.push('--no-dependencies')
      if (options?.companions === false)
        argv.push('--no-companions')
      if (options?.compact)
        argv.push('--compact')
      const cmd = await resolveCommand('info')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to get package info:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Doctor command
cli
  .command('doctor', 'Run health checks and diagnose installation issues')
  .alias('health')
  .alias('check')
  .option('--verbose', 'Show detailed diagnostic information')
  .example('launchpad doctor')
  .example('launchpad health')
  .action(async (options?: { verbose?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const argv: string[] = []
      if (options?.verbose)
        argv.push('--verbose')
      const cmd = await resolveCommand('doctor')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Health check failed:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Tags command
cli
  .command('tags', 'Browse packages by category and tags')
  .alias('categories')
  .alias('browse')
  .option('--list', 'List all available categories')
  .option('--category <name>', 'Show packages in a specific category')
  .option('--search <term>', 'Search packages by tag or category')
  .option('--compact', 'Use compact display format')
  .option('--no-programs', 'Hide program listings')
  .option('--no-versions', 'Hide version information')
  .example('launchpad tags --list')
  .example('launchpad tags --category "Programming Languages"')
  .example('launchpad tags --search database')
  .example('launchpad categories')
  .action(async (options?: {
    list?: boolean
    category?: string
    search?: string
    compact?: boolean
    programs?: boolean
    versions?: boolean
  }) => {
    try {
      const argv: string[] = []
      if (options?.list)
        argv.push('--list')
      if (options?.category) {
        argv.push('--category', options.category)
      }
      if (options?.search) {
        argv.push('--search', options.search)
      }
      if (options?.compact)
        argv.push('--compact')
      if (options?.programs === false)
        argv.push('--no-programs')
      if (options?.versions === false)
        argv.push('--no-versions')
      const cmd = await resolveCommand('tags')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Tags command failed:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// List command
cli
  .command('list', 'List installed packages')
  .alias('ls')
  .option('--path <path>', 'Installation path to list packages from')
  .option('--verbose', 'Enable verbose output')
  .example('launchpad list')
  .example('launchpad ls')
  .action(async (options?: { path?: string, verbose?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const argv: string[] = []
      if (options?.path) {
        argv.push('--path', options.path)
      }
      if (options?.verbose)
        argv.push('--verbose')
      const cmd = await resolveCommand('list')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to list packages:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Bootstrap command
cli
  .command('bootstrap', 'Install essential tools for a complete Launchpad setup')
  .option('--verbose', 'Enable verbose output')
  .option('--path <path>', 'Custom installation path (default: auto-detected)')
  .option('--force', 'Force reinstall even if already installed')
  .option('--no-auto-path', 'Do not automatically add to PATH')
  .option('--skip-shell-integration', 'Skip shell integration setup')
  .example('launchpad bootstrap')
  .example('launchpad bootstrap --verbose --force')
  .example('launchpad bootstrap --path ~/.local')
  .action(async (options?: { verbose?: boolean, path?: string, force?: boolean, autoPath?: boolean, skipShellIntegration?: boolean }) => {
    if (options?.verbose)
      config.verbose = true
    if (options?.force)
      config.forceReinstall = true
    if (options?.autoPath === false)
      config.autoAddToPath = false

    try {
      const argv: string[] = []
      if (options?.verbose)
        argv.push('--verbose')
      if (options?.path) { argv.push('--path', options.path) }
      if (options?.force)
        argv.push('--force')
      if (options?.autoPath === false)
        argv.push('--no-auto-path')
      if (options?.skipShellIntegration)
        argv.push('--skip-shell-integration')
      const cmd = await resolveCommand('bootstrap')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Bootstrap failed:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Setup command - download and install launchpad binary
cli
  .command('setup', 'Download and install Launchpad binary to /usr/local/bin')
  .option('--force', 'Force download even if binary already exists')
  .option('--verbose', 'Enable verbose output')
  .option('--release <version>', `Specific version to download (default: ${DEFAULT_SETUP_VERSION})`)
  .option('--target <path>', 'Target installation path (default: /usr/local/bin/launchpad)')
  .example('launchpad setup')
  .example('launchpad setup --force --verbose')
  .example('launchpad setup --release v0.3.5')
  .example('launchpad setup --target ~/bin/launchpad')
  .action(async (options?: { force?: boolean, verbose?: boolean, release?: string, target?: string }) => {
    if (options?.verbose)
      config.verbose = true
    try {
      const argv: string[] = []
      if (options?.force)
        argv.push('--force')
      if (options?.verbose)
        argv.push('--verbose')
      if (options?.release) { argv.push('--release', options.release) }
      if (options?.target) { argv.push('--target', options.target) }
      const cmd = await resolveCommand('setup')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Setup failed:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Debug command - debug global dependencies and their sources
cli
  .command('debug:deps', 'Debug global dependencies and show their sources')
  .option('--package <name>', 'Filter by specific package name')
  .option('--version <version>', 'Filter by specific version')
  .action(async (options) => {
    try {
      const argv: string[] = []
      if (options?.package)
        argv.push(`--package=${options.package}`)
      if (options?.version)
        argv.push(`--version=${options.version}`)
      const cmd = await resolveCommand('debug:deps')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to debug dependencies:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Upgrade command - upgrade Launchpad itself to the latest version
cli
  .command('upgrade', 'Upgrade Launchpad to the latest version')
  .alias('self-update')
  .option('--force', 'Force upgrade even if already on latest version')
  .option('--verbose', 'Enable verbose output')
  .option('--target <path>', 'Target installation path (default: current binary location)')
  .option('--release <version>', 'Upgrade to specific version (default: latest)')
  .option('--dry-run', 'Show what would be upgraded without actually upgrading')
  .example('launchpad upgrade')
  .example('launchpad upgrade --force')
  .example('launchpad upgrade --release v0.3.5')
  .example('launchpad upgrade --dry-run --verbose')
  .action(async (options?: { force?: boolean, verbose?: boolean, target?: string, release?: string, dryRun?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const argv: string[] = []
      if (options?.force)
        argv.push('--force')
      if (options?.verbose)
        argv.push('--verbose')
      if (options?.target) { argv.push('--target', options.target) }
      if (options?.release) { argv.push('--release', options.release) }
      if (options?.dryRun)
        argv.push('--dry-run')
      const cmd = await resolveCommand('upgrade')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Upgrade failed:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Shim command
cli
  .command('shim [packages...]', 'Create shims for packages')
  .alias('stub')
  .option('--verbose', 'Enable verbose output')
  .option('--path <path>', 'Custom shim installation path')
  .option('--force', 'Force creation of shims even if they already exist')
  .option('--no-auto-path', 'Do not automatically add shim directory to PATH')
  .example('launchpad shim node')
  .example('launchpad shim node python --path ~/bin')
  .action(async (packages: string[], options?: { verbose?: boolean, path?: string, force?: boolean, autoPath?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    if (options?.force) {
      config.forceReinstall = true
    }

    if (options?.autoPath === false) {
      config.autoAddToPath = false
    }

    // Ensure packages is an array
    const packageList = Array.isArray(packages) ? packages : [packages].filter(Boolean)

    if (packageList.length === 0) {
      console.error('No packages specified')
      process.exit(1)
    }

    try {
      const argv: string[] = [...packageList]
      if (options?.verbose)
        argv.push('--verbose')
      if (options?.path) {
        argv.push('--path', options.path)
      }
      if (options?.force)
        argv.push('--force')
      if (options?.autoPath === false)
        argv.push('--no-auto-path')
      const cmd = await resolveCommand('shim')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to create shims:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Dev commands for shell integration
cli
  .command('dev:check-updates', 'Check global dependencies for updates (TTL-based); auto-update if enabled')
  .option('--dry-run', 'Skip network and just refresh markers (for tests)')
  .option('--auto-update', 'Force auto-update on (overrides env)')
  .action(async (options?: { dryRun?: boolean, autoUpdate?: boolean }) => {
    try {
      const argv: string[] = []
      if (options?.dryRun)
        argv.push('--dry-run')
      if (options?.autoUpdate)
        argv.push('--auto-update')
      const cmd = await resolveCommand('dev:check-updates')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      if (config.verbose)
        console.warn('dev:check-updates failed:', error instanceof Error ? error.message : String(error))
      process.exit(0)
    }
  })

cli
  .command('dev:shellcode', 'Generate shell integration code')
  .option('--test-mode', 'Generate shellcode for testing (bypasses test environment checks)')
  .action(async ({ testMode }) => {
    try {
      // Use computed dynamic import to prevent Bun from pre-parsing this module at CLI startup
      const mod = await import('../src/dev/' + 'shellcode')
      const { shellcode } = mod as { shellcode: (testMode?: boolean) => string }
      console.log(shellcode(testMode))
      // Force immediate exit to prevent any hanging
      process.exit(0)
    }
    catch (error) {
      console.error('Failed to generate shellcode:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

cli
  .command('dev:find-project-root [dir]', 'Find project root directory (fast detection with shell fallback)')
  .option('--fallback-shell', 'Deprecated: hybrid fallback is now the default')
  .action(async (dir?: string, _opts?: { fallbackShell?: boolean }) => {
    try {
      const argv: string[] = []
      if (dir)
        argv.push(dir)
      // keep forwarding deprecated flag for parity
      if (_opts?.fallbackShell)
        argv.push('--fallback-shell')
      const cmd = await resolveCommand('dev:find-project-root')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch {
      process.exit(1)
    }
  })

cli
  .command('dev:scan-library-paths <envDir>', 'Fast scan for library paths in environment directory')
  .action(async (envDir: string) => {
    try {
      const argv: string[] = []
      if (envDir)
        argv.push(envDir)
      const cmd = await resolveCommand('dev:scan-library-paths')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch { process.exit(1) }
  })

cli
  .command('dev:scan-global-paths <globalDir>', 'Fast scan for global binary paths')
  .action(async (globalDir: string) => {
    try {
      const argv: string[] = []
      if (globalDir)
        argv.push(globalDir)
      const cmd = await resolveCommand('dev:scan-global-paths')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch { process.exit(1) }
  })

cli
  .command('dev:md5 <file>', 'Compute MD5 hash of a file (first 8 characters)')
  .action(async (file: string) => {
    try {
      const argv: string[] = []
      if (file)
        argv.push(file)
      const cmd = await resolveCommand('dev:md5')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch { process.exit(0) }
  })

cli
  .command('dev [dir]', 'Set up development environment for project dependencies')
  .option('--dry-run', 'Show packages that would be installed without installing them')
  .option('--quiet', 'Suppress non-error output')
  .option('--shell', 'Output shell code for evaluation (use with eval)')
  .action(async (dir?: string, options?: { dryRun?: boolean, quiet?: boolean, shell?: boolean }) => {
    try {
      const argv: string[] = []
      if (dir)
        argv.push(dir)
      if (options?.dryRun)
        argv.push('--dry-run')
      if (options?.quiet)
        argv.push('--quiet')
      if (options?.shell)
        argv.push('--shell')
      const cmd = await resolveCommand('dev')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      if (!options?.quiet && !options?.shell)
        console.error('Failed to set up dev environment:', error instanceof Error ? error.message : String(error))
      if (!options?.shell)
        process.exit(1)
      // for shell mode, allow handler to manage output/exit; fall through
    }
  })

cli
  .command('dev:integrate', 'Install shell integration hooks')
  .option('--uninstall', 'Remove shell integration hooks')
  .option('--dry-run', 'Show what would be changed without making changes')
  .action(async (options?: { uninstall?: boolean, dryRun?: boolean }) => {
    try {
      const argv: string[] = []
      if (options?.uninstall)
        argv.push('--uninstall')
      if (options?.dryRun)
        argv.push('--dry-run')
      const cmd = await resolveCommand('dev:integrate')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to integrate shell hooks:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

cli
  .command('dev:on [dir]', 'Activate development environment (use `launchpad dev` instead)')
  .option('--silent', 'Suppress output messages')
  .option('--shell-safe', 'Output shell-safe message without ANSI escape sequences')
  .action(async (dir?: string, options?: { silent?: boolean, shellSafe?: boolean }) => {
    try {
      const targetDir = dir ? path.resolve(dir) : process.cwd()

      // Show activation message if not explicitly silenced
      if (!options?.silent) {
        // Show activation message if configured
        if (config.showShellMessages && config.shellActivationMessage) {
          let message = config.shellActivationMessage.replace('{path}', path.basename(targetDir))

          // If called with shell-safe option, strip ANSI escape sequences to prevent shell parsing issues
          if (options?.shellSafe) {
            // eslint-disable-next-line no-control-regex
            message = message.replace(/\u001B\[[0-9;]*m/g, '')
          }

          console.log(message)
        }
      }
    }
    catch (error) {
      if (!options?.silent) {
        console.error('Failed to activate dev environment:', error instanceof Error ? error.message : String(error))
      }
      process.exit(1)
    }
  })

cli
  .command('dev:off', 'Deactivate development environment')
  .option('--silent', 'Suppress output messages')
  .action(async (options?: { silent?: boolean }) => {
    try {
      // The actual deactivation is handled by shell functions
      // This command exists for consistency and potential future use

      if (!options?.silent) {
        // Show deactivation message if configured
        if (config.showShellMessages && config.shellDeactivationMessage) {
          console.log(config.shellDeactivationMessage)
        }
      }
    }
    catch (error) {
      if (!options?.silent) {
        console.error('Failed to deactivate dev environment:', error instanceof Error ? error.message : String(error))
      }
      process.exit(1)
    }
  })

// Environment management commands

// List environments command
cli
  .command('env:list', 'List all development environments')
  .alias('env:ls')
  .option('--verbose', 'Show detailed information including hashes')
  .option('--format <type>', 'Output format: table (default), json, simple')
  .example('launchpad env:list')
  .example('launchpad env:ls --format json')
  .action(async (options?: { verbose?: boolean, format?: string }) => {
    try {
      const argv: string[] = []
      if (options?.verbose)
        argv.push('--verbose')
      if (options?.format) {
        argv.push('--format', options.format)
      }
      const cmd = await resolveCommand('env:list')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to list environments:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Inspect environment command
cli
  .command('env:inspect <hash>', 'Inspect a specific development environment')
  .option('--verbose', 'Show detailed directory structure')
  .option('--show-stubs', 'Show binary stub contents')
  .example('launchpad env:inspect working-test_208a31ec')
  .example('launchpad env:inspect 123abc --show-stubs')
  .action(async (hash: string, options?: { verbose?: boolean, showStubs?: boolean }) => {
    try {
      const argv: string[] = [hash]
      if (options?.verbose)
        argv.push('--verbose')
      if (options?.showStubs)
        argv.push('--show-stubs')
      const cmd = await resolveCommand('env:inspect')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to inspect environment:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Clean environments command
cli
  .command('env:clean', 'Clean up old or unused development environments')
  .option('--dry-run', 'Show what would be cleaned without actually cleaning')
  .option('--older-than <days>', 'Clean environments older than specified days')
  .option('--force', 'Skip confirmation prompts')
  .example('launchpad env:clean --older-than 30')
  .example('launchpad env:clean --dry-run')
  .action(async (options?: { dryRun?: boolean, olderThan?: string, force?: boolean }) => {
    try {
      const argv: string[] = []
      if (options?.dryRun)
        argv.push('--dry-run')
      if (options?.olderThan) {
        argv.push('--older-than', options.olderThan)
      }
      if (options?.force)
        argv.push('--force')
      const cmd = await resolveCommand('env:clean')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to clean environments:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Remove specific environment command
cli
  .command('env:remove [hash]', 'Remove a specific development environment or all environments')
  .option('--force', 'Skip confirmation prompts')
  .option('--verbose', 'Show detailed removal information')
  .option('--all', 'Remove all development environments')
  .example('launchpad env:remove 123abc')
  .example('launchpad env:remove --all --force')
  .action(async (hash?: string, options?: { force?: boolean, verbose?: boolean, all?: boolean }) => {
    try {
      if (!hash && !options?.all) {
        console.error('Either provide a hash or use --all to remove all environments')
        console.log('\nUsage:')
        console.log('  launchpad env:remove <hash>')
        console.log('  launchpad env:remove --all')
        process.exit(1)
      }
      const argv: string[] = []
      if (hash)
        argv.push(hash)
      if (options?.force)
        argv.push('--force')
      if (options?.verbose)
        argv.push('--verbose')
      if (options?.all)
        argv.push('--all')
      const cmd = await resolveCommand('env:remove')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to remove environment:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Uninstall/Remove command
cli
  .command('uninstall [packages...]', 'Remove installed packages')
  .alias('remove')
  .alias('rm')
  .option('--verbose', 'Enable verbose output')
  .option('--force', 'Skip confirmation prompts')
  .option('--dry-run', 'Show what would be removed without actually removing it')
  .example('launchpad uninstall node python')
  .example('launchpad remove node@18 --force')
  .action(async (packages: string[], options?: { verbose?: boolean, force?: boolean, dryRun?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    // Ensure packages is an array
    const packageList = Array.isArray(packages) ? packages : [packages].filter(Boolean)

    if (packageList.length === 0) {
      console.error('No packages specified for removal')
      console.log('')
      console.log('Usage examples:')
      console.log('  launchpad uninstall node python')
      console.log('  launchpad remove node@18 --force')
      process.exit(1)
    }

    try {
      const argv: string[] = [...packageList]
      if (options?.verbose)
        argv.push('--verbose')
      if (options?.force)
        argv.push('--force')
      if (options?.dryRun)
        argv.push('--dry-run')
      const cmd = await resolveCommand('uninstall')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to uninstall:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Cache management command
cli
  .command('cache:clear', 'Clear all cached packages and downloads')
  .alias('cache:clean')
  .option('--verbose', 'Enable verbose output')
  .option('--force', 'Skip confirmation prompts')
  .option('--dry-run', 'Show what would be cleared without actually clearing it')
  .example('launchpad cache:clear')
  .example('launchpad cache:clean --force')
  .action(async (options?: { verbose?: boolean, force?: boolean, dryRun?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const argv: string[] = []
      if (options?.verbose)
        argv.push('--verbose')
      if (options?.force)
        argv.push('--force')
      if (options?.dryRun)
        argv.push('--dry-run')
      const cmd = await resolveCommand('cache:clear')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to clear cache:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Clean command - remove all Launchpad-installed packages
cli
  .command('clean', 'Remove all Launchpad-installed packages and environments')
  .option('--verbose', 'Enable verbose output')
  .option('--force', 'Skip confirmation prompts')
  .option('--dry-run', 'Show what would be removed without actually removing it')
  .option('--keep-cache', 'Keep cached downloads (only remove installed packages)')
  .option('--keep-global', 'Keep global dependencies (preserve packages from global deps.yaml files)')
  .example('launchpad clean --dry-run')
  .example('launchpad clean --force')
  .example('launchpad clean --keep-cache')
  .example('launchpad clean --keep-global')
  .action(async (options?: { verbose?: boolean, force?: boolean, dryRun?: boolean, keepCache?: boolean, keepGlobal?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const argv: string[] = []
      if (options?.verbose)
        argv.push('--verbose')
      if (options?.force)
        argv.push('--force')
      if (options?.dryRun)
        argv.push('--dry-run')
      if (options?.keepCache)
        argv.push('--keep-cache')
      if (options?.keepGlobal)
        argv.push('--keep-global')
      const cmd = await resolveCommand('clean')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to perform clean:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// (removed unintended duplicate 'list' command block)

// Outdated command
cli
  .command('outdated', 'Check for outdated packages')
  .option('--verbose', 'Enable verbose output')
  .action(async (options?: { verbose?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const cmd = await resolveCommand('outdated')
      if (!cmd)
        return
      const argv: string[] = []
      if (options?.verbose)
        argv.push('--verbose')
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to check for outdated packages:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Update command
cli
  .command('update [packages...]', 'Update packages to newer versions')
  .alias('up')
  .option('--verbose', 'Enable verbose output')
  .option('--latest', 'Update to the latest version (ignoring current constraints)')
  .option('--dry-run', 'Show what would be updated without actually updating')
  .example('launchpad update')
  .example('launchpad update bun --latest')
  .example('launchpad up node python --latest')
  .example('launchpad update --dry-run')
  .action(async (packages: string[], options?: { verbose?: boolean, latest?: boolean, dryRun?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    // Ensure packages is an array
    const packageList = Array.isArray(packages) ? packages : [packages].filter(Boolean)

    try {
      const argv: string[] = []
      for (const p of packageList) argv.push(p)
      if (options?.verbose)
        argv.push('--verbose')
      if (options?.latest)
        argv.push('--latest')
      if (options?.dryRun)
        argv.push('--dry-run')
      const cmd = await resolveCommand('update')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to update packages:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Cache management commands
cli
  .command('cache:stats', 'Show cache statistics and usage information')
  .alias('cache:info')
  .example('launchpad cache:stats')
  .action(async () => {
    try {
      const cmd = await resolveCommand('cache:stats')
      if (!cmd)
        return
      const code = await cmd.run({ argv: [], env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to get cache stats:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

cli
  .command('cache:clean', 'Clean up old cached packages')
  .alias('cache:cleanup')
  .option('--max-age <days>', 'Maximum age in days for cached packages (default: 30)')
  .option('--max-size <gb>', 'Maximum cache size in GB (default: 5)')
  .option('--dry-run', 'Show what would be cleaned without actually removing files')
  .example('launchpad cache:clean')
  .example('launchpad cache:clean --max-age 7 --max-size 2')
  .example('launchpad cache:clean --dry-run')
  .action(async (options?: { maxAge?: string, maxSize?: string, dryRun?: boolean }) => {
    try {
      const argv: string[] = []
      if (options?.maxAge) {
        argv.push('--max-age', String(options.maxAge))
      }
      if (options?.maxSize) {
        argv.push('--max-size', String(options.maxSize))
      }
      if (options?.dryRun)
        argv.push('--dry-run')

      const cmd = await resolveCommand('cache:clean')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to clean cache:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })
// Service management commands

// Start service command
cli
  .command('start <service>', 'Start a service')
  .option('--verbose', 'Enable verbose output')
  .example('launchpad start postgres')
  .example('launchpad start redis')
  .example('launchpad start nginx')
  .action(async (serviceName: string, options?: { verbose?: boolean }) => {
    if (options?.verbose)
      config.verbose = true
    try {
      const argv: string[] = []
      if (serviceName)
        argv.push(serviceName)
      if (options?.verbose)
        argv.push('--verbose')
      const cmd = await resolveCommand('start')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to start service:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Stop service command
cli
  .command('stop <service>', 'Stop a service')
  .option('--verbose', 'Enable verbose output')
  .example('launchpad stop postgres')
  .example('launchpad stop redis')
  .example('launchpad stop nginx')
  .action(async (serviceName: string, options?: { verbose?: boolean }) => {
    if (options?.verbose)
      config.verbose = true
    try {
      const argv: string[] = []
      if (serviceName)
        argv.push(serviceName)
      if (options?.verbose)
        argv.push('--verbose')
      const cmd = await resolveCommand('stop')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to stop service:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Restart service command
cli
  .command('restart <service>', 'Restart a service')
  .option('--verbose', 'Enable verbose output')
  .example('launchpad restart postgres')
  .example('launchpad restart redis')
  .example('launchpad restart nginx')
  .action(async (serviceName: string, options?: { verbose?: boolean }) => {
    if (options?.verbose)
      config.verbose = true
    try {
      const argv: string[] = []
      if (serviceName)
        argv.push(serviceName)
      if (options?.verbose)
        argv.push('--verbose')
      const cmd = await resolveCommand('restart')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to restart service:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Enable service command
cli
  .command('enable <service>', 'Enable a service for auto-start on boot')
  .option('--verbose', 'Enable verbose output')
  .example('launchpad enable postgres')
  .example('launchpad enable redis')
  .example('launchpad enable nginx')
  .action(async (serviceName: string, options?: { verbose?: boolean }) => {
    if (options?.verbose)
      config.verbose = true
    try {
      const argv: string[] = []
      if (serviceName)
        argv.push(serviceName)
      if (options?.verbose)
        argv.push('--verbose')
      const cmd = await resolveCommand('enable')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to enable service:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Disable service command
cli
  .command('disable <service>', 'Disable a service from auto-starting on boot')
  .option('--verbose', 'Enable verbose output')
  .example('launchpad disable postgres')
  .example('launchpad disable redis')
  .example('launchpad disable nginx')
  .action(async (serviceName: string, options?: { verbose?: boolean }) => {
    if (options?.verbose)
      config.verbose = true
    try {
      const argv: string[] = []
      if (serviceName)
        argv.push(serviceName)
      if (options?.verbose)
        argv.push('--verbose')
      const cmd = await resolveCommand('disable')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to disable service:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Status command - show status of a specific service or all services
cli
  .command('status [service]', 'Show service status')
  .option('--verbose', 'Enable verbose output')
  .option('--format <type>', 'Output format: table (default), json, simple')
  .example('launchpad status')
  .example('launchpad status postgres')
  .example('launchpad status --format json')
  .action(async (serviceName?: string, options?: { verbose?: boolean, format?: string }) => {
    if (options?.verbose)
      config.verbose = true
    try {
      const argv: string[] = []
      if (serviceName)
        argv.push(serviceName)
      if (options?.verbose)
        argv.push('--verbose')
      if (options?.format)
        argv.push('--format', options.format)
      const cmd = await resolveCommand('status')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to get service status:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Services command - alias for status with better discoverability
cli
  .command('services', 'List all services and their status')
  .alias('service')
  .option('--verbose', 'Enable verbose output')
  .option('--format <type>', 'Output format: table (default), json, simple')
  .example('launchpad services')
  .example('launchpad services --format json')
  .action(async (options?: { verbose?: boolean, format?: string }) => {
    if (options?.verbose)
      config.verbose = true
    try {
      const argv: string[] = []
      if (options?.verbose)
        argv.push('--verbose')
      if (options?.format)
        argv.push('--format', options.format)
      const cmd = await resolveCommand('services')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to list services:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Build environment command
cli
  .command('build-env', 'Set up build environment for launchpad-installed packages')
  .alias('env')
  .option('--path <path>', 'Custom installation path')
  .option('--shell', 'Output shell code for evaluation (use with eval)')
  .example('launchpad build-env')
  .example('launchpad build-env --path ~/.local/share/launchpad/global')
  .example('launchpad build-env --shell | source /dev/stdin')
  .action(async (options?: { path?: string, shell?: boolean }) => {
    try {
      const argv: string[] = []
      if (options?.path)
        argv.push('--path', options.path)
      if (options?.shell)
        argv.push('--shell')
      const cmd = await resolveCommand('build-env')
      if (!cmd)
        return
      const code = await cmd.run({ argv, env: process.env })
      if (typeof code === 'number' && code !== 0)
        process.exit(code)
    }
    catch (error) {
      console.error('Failed to set up build environment:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Benchmark commands
cli
  .command('benchmark:file-detection', 'Benchmark file detection performance (shell vs Bun)')
  .option('--iterations <number>', 'Number of iterations per test (default: varies by test)')
  .option('--depths <numbers>', 'Comma-separated list of directory depths to test (default: 3,7,15,25)')
  .option('--verbose', 'Show detailed output')
  .option('--json', 'Output results as JSON')
  .example('launchpad benchmark:file-detection')
  .example('launchpad benchmark:file-detection --depths 5,10,20 --verbose')
  .example('launchpad benchmark:file-detection --json')
  .action(async (options?: {
    iterations?: string
    depths?: string
    verbose?: boolean
    json?: boolean
  }) => {
    try {
      const { runFileDetectionBenchmark } = await import('../src/dev/benchmark')

      const depths = options?.depths && typeof options.depths === 'string'
        ? options.depths.split(',').map(d => Number.parseInt(d.trim(), 10)).filter(d => !Number.isNaN(d))
        : [3, 7, 15, 25]

      const iterations = options?.iterations ? Number.parseInt(options.iterations, 10) : undefined

      await runFileDetectionBenchmark({
        depths,
        iterations,
        verbose: options?.verbose || false,
        json: options?.json || false,
      })
    }
    catch (error) {
      console.error('Benchmark failed:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Parse CLI arguments
try {
  cli.version(version)
  cli.help()
  cli.parse()
}
catch (error) {
  console.error('CLI error:', error instanceof Error ? error.message : String(error))
  process.exit(1)
}

// Database management commands
cli
  .command('db:create', 'Create a database for the current project')
  .option('--name <name>', 'Database name (defaults to project directory name)')
  .option('--type <type>', 'Database type: postgres, mysql, sqlite', { default: 'auto' })
  .option('--host <host>', 'Database host (for postgres/mysql)', { default: 'localhost' })
  .option('--port <port>', 'Database port (postgres: 5432, mysql: 3306)')
  .option('--user <user>', 'Database user')
  .option('--password <password>', 'Database password')
  .example('launchpad db:create # Create database with auto-detection')
  .example('launchpad db:create --type postgres # Create PostgreSQL database')
  .example('launchpad db:create --name myapp --type mysql # Create MySQL database named myapp')
  .action(async (options: {
    name?: string
    type: string
    host: string
    port?: string
    user?: string
    password?: string
  }) => {
    try {
      const { createProjectDatabase, generateLaravelConfig } = await import('../src/services/database')
      const dbName = options.name || path.basename(process.cwd()).replace(/\W/g, '_')

      const dbOptions = {
        host: options.host,
        port: options.port ? Number.parseInt(options.port, 10) : undefined,
        user: options.user,
        password: options.password,
        type: options.type === 'auto' ? undefined : options.type as any,
      }

      const connectionInfo = await createProjectDatabase(dbName, dbOptions)

      console.warn('\n📋 Database Connection Details:')
      console.warn(`   Type: ${connectionInfo.type}`)
      if (connectionInfo.host)
        console.warn(`   Host: ${connectionInfo.host}`)
      if (connectionInfo.port)
        console.warn(`   Port: ${connectionInfo.port}`)
      console.warn(`   Database: ${connectionInfo.database}`)
      if (connectionInfo.username)
        console.warn(`   Username: ${connectionInfo.username}`)
      if (connectionInfo.path)
        console.warn(`   Path: ${connectionInfo.path}`)

      // Generate Laravel .env configuration
      const envConfig = generateLaravelConfig(connectionInfo)
      console.warn('\n🔧 Laravel .env configuration:')
      console.warn(envConfig)

      // Check if this is a Laravel project and offer to update .env
      if (fs.existsSync('artisan') && fs.existsSync('.env')) {
        console.warn('\n💡 Laravel project detected! You can update your .env file with the configuration above.')
      }
    }
    catch (error) {
      console.error(`Failed to create database: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  })
