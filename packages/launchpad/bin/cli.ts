#!/usr/bin/env bun
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { CAC } from 'cac'
import { install, install_prefix, list, uninstall } from '../src'
import { config } from '../src/config'
import { dump, integrate, shellcode } from '../src/dev'
import { formatPackageInfo, formatPackageNotFound, getDetailedPackageInfo, packageExists } from '../src/info'
import { Path } from '../src/path'
import { formatSearchResults, getPopularPackages, searchPackages } from '../src/search'
import { create_shim, shim_dir } from '../src/shim'
import { addToPath, isInPath } from '../src/utils'
// Import package.json for version
const packageJson = await import('../package.json')
const version = packageJson.default?.version || packageJson.version || '0.0.0'

const cli = new CAC('launchpad')

cli.version(version)
cli.help()

// Main installation command
cli
  .command('install [packages...]', 'Install packages')
  .alias('i')
  .option('--verbose', 'Enable verbose output')
  .option('--path <path>', 'Custom installation path')
  .example('launchpad install node python')
  .example('launchpad install --path ~/.local node python')
  .action(async (packages: string[], options: { verbose?: boolean, path?: string }) => {
    if (options.verbose) {
      config.verbose = true
    }

    // Ensure packages is an array
    const packageList = Array.isArray(packages) ? packages : [packages].filter(Boolean)

    if (packageList.length === 0) {
      console.error('No packages specified')
      process.exit(1)
    }

    try {
      const installPath = options.path || install_prefix().string
      console.warn(`Installing packages: ${packageList.join(', ')}`)

      const results = await install(packageList, installPath)

      if (results.length > 0) {
        console.log(`Successfully installed ${results.length} binaries:`)
        results.forEach((file) => {
          console.log(`  ${file}`)
        })
      }
      else {
        console.log('No binaries were installed')
      }
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
      const limit = options?.limit ? Number.parseInt(options.limit, 10) : 20

      if (!term || term.trim().length === 0) {
        // Show popular packages when no search term provided
        console.log('🌟 Popular Packages:\n')
        const popular = getPopularPackages(limit)
        console.log(formatSearchResults(popular, {
          compact: options?.compact,
          showPrograms: options?.programs !== false,
        }))
        return
      }

      const results = searchPackages(term, {
        limit,
        includePrograms: options?.programs !== false,
        caseSensitive: options?.caseSensitive || false,
      })

      if (results.length === 0) {
        console.log(`No packages found matching "${term}".`)
        console.log('\nTry:')
        console.log('  • Using different keywords')
        console.log('  • Checking spelling')
        console.log('  • Using "launchpad search" without arguments to see popular packages')
      }
      else {
        console.log(formatSearchResults(results, {
          compact: options?.compact,
          showPrograms: options?.programs !== false,
        }))
      }
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
      if (!packageExists(packageName)) {
        const errorMessage = await formatPackageNotFound(packageName)
        console.error(errorMessage)
        process.exit(1)
      }

      const info = getDetailedPackageInfo(packageName, {
        includeVersions: options?.versions || false,
        maxVersions: 15,
      })

      if (!info) {
        console.error(`❌ Failed to get information for package '${packageName}'`)
        process.exit(1)
      }

      const formatted = formatPackageInfo(info, {
        showVersions: options?.versions || false,
        showPrograms: options?.programs !== false,
        showDependencies: options?.dependencies !== false,
        showCompanions: options?.companions !== false,
        compact: options?.compact || false,
      })

      console.log(formatted)
    }
    catch (error) {
      console.error('Failed to get package info:', error instanceof Error ? error.message : String(error))
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
      const basePath = options?.path || install_prefix().string
      const packages = await list(basePath)

      if (packages.length === 0) {
        console.log('No packages installed')
      }
      else {
        console.log('Installed packages:')
        packages.forEach((pkg) => {
          console.log(`  ${pkg.project}@${pkg.version}`)
        })
      }
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
    if (options?.verbose) {
      config.verbose = true
    }

    if (options?.force) {
      config.forceReinstall = true
    }

    if (options?.autoPath === false) {
      config.autoAddToPath = false
    }

    console.log('🚀 Bootstrapping Launchpad - Installing essential tools...')

    const installPath = options?.path ? new Path(options.path) : install_prefix()
    console.log(`📍 Installation prefix: ${installPath.string}`)
    console.log('')

    const results: { tool: string, status: 'success' | 'failed' | 'skipped' | 'already-installed', message?: string }[] = []

    // Helper function to add result
    const addResult = (tool: string, status: typeof results[0]['status'], message?: string) => {
      results.push({ tool, status, message })
      const emoji = status === 'success' ? '✅' : status === 'failed' ? '❌' : status === 'skipped' ? '⏭️' : '🔄'
      console.log(`${emoji} ${tool}: ${message || status}`)
    }

    // 1. Ensure directories exist
    console.log('📁 Setting up directories...')
    const binDir = path.join(installPath.string, 'bin')
    const sbinDir = path.join(installPath.string, 'sbin')

    try {
      fs.mkdirSync(binDir, { recursive: true })
      fs.mkdirSync(sbinDir, { recursive: true })
      addResult('directories', 'success', 'created bin/ and sbin/')
    }
    catch (error) {
      addResult('directories', 'failed', error instanceof Error ? error.message : String(error))
    }

    console.log('')

    // 2. Setup PATH
    console.log('🛤️  Setting up PATH...')

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

    // 3. Shell integration setup
    if (!options?.skipShellIntegration) {
      console.log('🐚 Setting up shell integration...')

      try {
        await integrate('install', { dryrun: false })
        addResult('shell integration', 'success', 'hooks installed')
      }
      catch (error) {
        addResult('shell integration', 'failed', error instanceof Error ? error.message : String(error))
      }
    }
    else {
      addResult('shell integration', 'skipped', 'skipped by user')
    }

    console.log('')

    // 4. Summary
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
      console.log('2. Install packages: launchpad install node python')
      console.log('3. Create shims: launchpad shim node')
      console.log('4. List installed: launchpad list')
    }
    else {
      console.log(`⚠️  Bootstrap completed with ${failed.length} failed component(s)`)
      console.log('')
      console.log('🔧 You can continue using Launchpad, but some features may not work optimally')
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
      const shimPath = options?.path || shim_dir().string
      console.log(`Creating shims for: ${packageList.join(', ')}`)

      const createdShims = await create_shim(packageList, shimPath)

      if (createdShims.length > 0) {
        console.log(`Successfully created ${createdShims.length} shims:`)
        createdShims.forEach((file) => {
          console.log(`  ${file}`)
        })
      }
      else {
        console.log('No shims were created')
      }
    }
    catch (error) {
      console.error('Failed to create shims:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Dev commands for shell integration
cli
  .command('dev:shellcode', 'Generate shell integration code')
  .action(() => {
    console.log(shellcode())
  })

cli
  .command('dev:dump [dir]', 'Set up development environment for project dependencies')
  .option('--dry-run', 'Show packages that would be installed without installing them')
  .option('--quiet', 'Suppress non-error output')
  .action(async (dir?: string, options?: { dryRun?: boolean, quiet?: boolean }) => {
    try {
      const targetDir = dir ? path.resolve(dir) : process.cwd()
      await dump(targetDir, {
        dryrun: options?.dryRun || false,
        quiet: options?.quiet || false,
      })
    }
    catch (error) {
      console.error('Failed to dump dev environment:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

cli
  .command('dev:integrate', 'Install shell integration hooks')
  .option('--uninstall', 'Remove shell integration hooks')
  .option('--dry-run', 'Show what would be changed without making changes')
  .action(async (options?: { uninstall?: boolean, dryRun?: boolean }) => {
    try {
      const operation = options?.uninstall ? 'uninstall' : 'install'
      const dryrun = options?.dryRun || false

      await integrate(operation, { dryrun })
    }
    catch (error) {
      console.error('Failed to integrate shell hooks:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

cli
  .command('dev:on [dir]', 'Activate development environment')
  .option('--silent', 'Suppress output messages')
  .action(async (dir?: string, options?: { silent?: boolean }) => {
    try {
      const targetDir = dir ? path.resolve(dir) : process.cwd()

      // For now, just show the activation message
      // The actual environment activation is handled by shell hooks
      if (!options?.silent) {
        // Show activation message if configured
        if (config.showShellMessages && config.shellActivationMessage) {
          const message = config.shellActivationMessage.replace('{path}', targetDir)
          console.warn(message)
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
          console.warn(config.shellDeactivationMessage)
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

    const isDryRun = options?.dryRun || false

    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - Nothing will actually be removed')
    }

    console.log(`${isDryRun ? 'Would remove' : 'Removing'} packages: ${packageList.join(', ')}`)

    if (!options?.force && !isDryRun) {
      // In a real implementation, we'd prompt for confirmation here
      console.log('Use --force to skip confirmation or --dry-run to preview')
    }

    let allSuccess = true
    const results: { package: string, success: boolean, message?: string }[] = []

    for (const pkg of packageList) {
      try {
        if (isDryRun) {
          console.log(`Would uninstall: ${pkg}`)
          results.push({ package: pkg, success: true, message: 'dry run' })
        }
        else {
          const success = await uninstall(pkg)
          results.push({ package: pkg, success })
          if (!success) {
            allSuccess = false
          }
        }
      }
      catch (error) {
        console.error(`Failed to uninstall ${pkg}:`, error instanceof Error ? error.message : String(error))
        results.push({ package: pkg, success: false, message: error instanceof Error ? error.message : String(error) })
        allSuccess = false
      }
    }

    // Summary
    console.log('')
    console.log('Uninstall Summary:')
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    if (successful.length > 0) {
      console.log(`✅ ${isDryRun ? 'Would remove' : 'Successfully removed'}: ${successful.map(r => r.package).join(', ')}`)
    }

    if (failed.length > 0) {
      console.log(`❌ Failed: ${failed.map(r => r.package).join(', ')}`)
    }

    if (!allSuccess) {
      process.exit(1)
    }
  })

// Outdated command
cli
  .command('outdated', 'Check for outdated packages')
  .option('--verbose', 'Enable verbose output')
  .action(async (options?: { verbose?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const { outdated } = await import('../src/list')
      await outdated()
    }
    catch (error) {
      console.error('Failed to check for outdated packages:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Update command
cli
  .command('update', 'Update packages')
  .alias('upgrade')
  .alias('up')
  .option('--verbose', 'Enable verbose output')
  .action(async (options?: { verbose?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const { update } = await import('../src/package')
      await update()
    }
    catch (error) {
      console.error('Failed to update packages:', error instanceof Error ? error.message : String(error))
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
