#!/usr/bin/env bun
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { CAC } from 'cac'
import { install, install_prefix, list, uninstall } from '../src'
import { config } from '../src/config'
import { dump, integrate, shellcode } from '../src/dev'
import { formatDoctorReport, runDoctorChecks } from '../src/doctor'
import { formatPackageInfo, formatPackageNotFound, getDetailedPackageInfo, packageExists } from '../src/info'
import { cleanupCache, getCacheStats } from '../src/install'
import { Path } from '../src/path'
import { formatSearchResults, getPopularPackages, searchPackages } from '../src/search'
import { create_shim, shim_dir } from '../src/shim'
import { formatCategoriesList, formatPackagesByCategory, formatTagSearchResults, getAvailableCategories, getPackagesByCategory, searchPackagesByTag } from '../src/tags'
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
  .alias('add')
  .option('--verbose', 'Enable verbose output')
  .option('--path <path>', 'Custom installation path')
  .example('launchpad install node python')
  .example('launchpad install --path ~/.local node python')
  .example('launchpad add node python')
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

      const results = await install(packageList, installPath)

      if (results.length > 0) {
        console.log(`🎉 Successfully installed ${packageList.join(', ')} (${results.length} ${results.length === 1 ? 'binary' : 'binaries'})`)
        results.forEach((file) => {
          console.log(`  ${file}`)
        })
      }
      else {
        console.log('⚠️  No binaries were installed')
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
          searchTerm: term,
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
      console.log('🔍 Running health checks...\n')

      const report = await runDoctorChecks()
      const formatted = formatDoctorReport(report)

      console.log(formatted)

      // Exit with appropriate code
      if (report.overall === 'critical') {
        process.exit(1)
      }
      else if (report.overall === 'issues') {
        process.exit(2)
      }
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
      if (options?.list) {
        // List all categories
        const categories = getAvailableCategories()
        const formatted = formatCategoriesList(categories)
        console.log(formatted)
        return
      }

      if (options?.category) {
        // Show packages in specific category
        const packages = getPackagesByCategory(options.category)
        const formatted = formatPackagesByCategory(options.category, packages, {
          compact: options.compact,
          showPrograms: options.programs !== false,
          showVersions: options.versions !== false,
        })
        console.log(formatted)
        return
      }

      if (options?.search) {
        // Search packages by tag
        const packages = searchPackagesByTag(options.search)
        const formatted = formatTagSearchResults(options.search, packages, {
          compact: options.compact,
          groupByCategory: true,
        })
        console.log(formatted)
        return
      }

      // Default: show categories list
      const categories = getAvailableCategories()
      const formatted = formatCategoriesList(categories)
      console.log(formatted)
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

// Setup command - download and install launchpad binary
cli
  .command('setup', 'Download and install Launchpad binary to /usr/local/bin')
  .option('--force', 'Force download even if binary already exists')
  .option('--verbose', 'Enable verbose output')
  .option('--release <version>', 'Specific version to download (default: v0.3.8)')
  .option('--target <path>', 'Target installation path (default: /usr/local/bin/launchpad)')
  .example('launchpad setup')
  .example('launchpad setup --force --verbose')
  .example('launchpad setup --release v0.3.5')
  .example('launchpad setup --target ~/bin/launchpad')
  .action(async (options?: { force?: boolean, verbose?: boolean, release?: string, target?: string }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    const targetVersion = options?.release || 'v0.3.9'
    const targetPath = options?.target || '/usr/local/bin/launchpad'

    // Validate version format
    if (targetVersion && !targetVersion.match(/^v?\d+\.\d+\.\d+$/)) {
      console.error(`❌ Invalid version format: ${targetVersion}`)
      console.log('Expected format: v0.3.6 or 0.3.6')
      process.exit(1)
    }

    console.log('🚀 Setting up Launchpad binary...')
    console.log('')

    try {
      // Detect platform and architecture
      const os = await import('node:os')
      const platform = os.platform()
      const arch = os.arch()

      let binaryName: string
      if (platform === 'darwin') {
        binaryName = arch === 'arm64' ? 'launchpad-darwin-arm64.zip' : 'launchpad-darwin-x64.zip'
      }
      else if (platform === 'linux') {
        binaryName = arch === 'arm64' ? 'launchpad-linux-arm64.zip' : 'launchpad-linux-x64.zip'
      }
      else if (platform === 'win32') {
        binaryName = 'launchpad-windows-x64.zip'
      }
      else {
        console.error(`❌ Unsupported platform: ${platform}-${arch}`)
        console.log('Supported platforms:')
        console.log('  • macOS (arm64, x64)')
        console.log('  • Linux (arm64, x64)')
        console.log('  • Windows (x64)')
        process.exit(1)
      }

      console.log(`📋 Platform: ${platform}-${arch}`)
      console.log(`📦 Binary: ${binaryName}`)
      console.log(`🎯 Target: ${targetPath}`)
      console.log(`📌 Version: ${targetVersion}`)
      console.log('')

      // Check if target already exists
      if (fs.existsSync(targetPath) && !options?.force) {
        try {
          const stats = fs.lstatSync(targetPath)
          if (stats.isSymbolicLink()) {
            const linkTarget = fs.readlinkSync(targetPath)
            console.log(`🔗 Symlink already exists at ${targetPath}`)
            console.log(`   → Points to: ${linkTarget}`)

            // Check if the symlink target exists
            try {
              fs.accessSync(targetPath, fs.constants.F_OK)
              console.log(`   ✅ Target is accessible`)
            }
            catch {
              console.log(`   ❌ Target is broken/inaccessible`)
            }
          }
          else if (stats.isFile()) {
            console.log(`📄 File already exists at ${targetPath}`)
            // Try to check if it's a launchpad binary
            try {
              const { execSync } = await import('node:child_process')
              const result = execSync(`"${targetPath}" --version`, { encoding: 'utf8', stdio: 'pipe' })
              if (result.includes('launchpad')) {
                console.log(`   ℹ️  Current version: ${result.trim()}`)
              }
            }
            catch {
              console.log(`   ⚠️  Cannot determine if this is a launchpad binary`)
            }
          }
          else if (stats.isDirectory()) {
            console.log(`📁 Directory already exists at ${targetPath}`)
          }
          else {
            console.log(`⚠️  Something already exists at ${targetPath}`)
          }
        }
        catch {
          console.log(`⚠️  Something already exists at ${targetPath}`)
        }

        console.log('')
        console.log('Options:')
        console.log('  • Use --force to overwrite')
        console.log('  • Choose a different --target path')
        console.log('  • Remove the existing file/symlink manually')
        process.exit(0)
      }

      // Download URL
      const downloadUrl = `https://github.com/stacksjs/launchpad/releases/download/${targetVersion}/${binaryName}`

      console.log(`📥 Downloading from: ${downloadUrl}`)

      // Create temporary directory for download
      const tmpDir = path.join(os.tmpdir(), `launchpad-setup-${Date.now()}`)
      fs.mkdirSync(tmpDir, { recursive: true })

      const zipPath = path.join(tmpDir, binaryName)

      try {
        // Download the file
        console.log('⬇️  Downloading...')

        const response = await globalThis.fetch(downloadUrl)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Version ${targetVersion} not found. Please check available releases at: https://github.com/stacksjs/launchpad/releases`)
          }
          throw new Error(`Failed to download: ${response.status} ${response.statusText}`)
        }

        const buffer = await response.arrayBuffer()
        fs.writeFileSync(zipPath, new Uint8Array(buffer))

        console.log(`✅ Downloaded ${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB`)

        // Extract the zip file
        console.log('📂 Extracting...')

        // For this we'll use a simple unzip approach
        // First, let's check if we can use the system's unzip command
        const { execSync } = await import('node:child_process')

        try {
          execSync(`cd "${tmpDir}" && unzip -q "${binaryName}"`, { stdio: 'pipe' })
        }
        catch {
          // Fallback: try to find the binary in the zip manually
          // This is a simple implementation - in production you might want a proper zip library
          throw new Error('Failed to extract zip file. Please ensure unzip is installed on your system.')
        }

        // Find the extracted binary
        const extractedFiles = fs.readdirSync(tmpDir).filter(f => f !== binaryName)
        let binaryFile = extractedFiles.find(f => f === 'launchpad' || f.startsWith('launchpad'))

        if (!binaryFile) {
          // Look in subdirectories
          for (const file of extractedFiles) {
            const filePath = path.join(tmpDir, file)
            if (fs.statSync(filePath).isDirectory()) {
              const subFiles = fs.readdirSync(filePath)
              const subBinary = subFiles.find(f => f === 'launchpad' || f.startsWith('launchpad'))
              if (subBinary) {
                binaryFile = path.join(file, subBinary)
                break
              }
            }
          }
        }

        if (!binaryFile) {
          throw new Error('Could not find launchpad binary in extracted files')
        }

        const sourcePath = path.join(tmpDir, binaryFile)

        console.log(`📋 Found binary: ${binaryFile}`)

        // Ensure target directory exists
        const targetDir = path.dirname(targetPath)
        if (!fs.existsSync(targetDir)) {
          console.log(`📁 Creating directory: ${targetDir}`)
          fs.mkdirSync(targetDir, { recursive: true })
        }

        // Check if we need sudo for the target path
        const needsSudo = targetPath.startsWith('/usr/') || targetPath.startsWith('/opt/') || targetPath.startsWith('/bin/') || targetPath.startsWith('/sbin/')

        if (needsSudo && platform !== 'win32') {
          console.log('🔒 Installing to system directory (may require sudo)...')

          try {
            // Try to copy with sudo
            execSync(`sudo cp "${sourcePath}" "${targetPath}"`, { stdio: 'inherit' })
            execSync(`sudo chmod +x "${targetPath}"`, { stdio: 'inherit' })

            // Use appropriate group for the platform
            const group = platform === 'darwin' ? 'wheel' : 'root'
            execSync(`sudo chown root:${group} "${targetPath}"`, { stdio: 'inherit' })
          }
          catch {
            console.error('❌ Failed to install with sudo. You may need to run this command with elevated privileges.')
            console.log('')
            console.log('Alternative: Try installing to a user directory:')
            console.log(`  launchpad setup --target ~/bin/launchpad`)
            console.log('')
            console.log('💡 Tip: You can also try copying the binary manually:')
            console.log(`  sudo cp "${sourcePath}" "${targetPath}"`)
            console.log(`  sudo chmod +x "${targetPath}"`)
            process.exit(1)
          }
        }
        else {
          // Regular copy
          console.log('📋 Installing binary...')
          fs.copyFileSync(sourcePath, targetPath)

          // Make executable (Unix-like systems)
          if (platform !== 'win32') {
            fs.chmodSync(targetPath, 0o755)
          }
        }

        console.log(`✅ Binary installed to: ${targetPath}`)

        // Verify installation
        try {
          const testResult = execSync(`"${targetPath}" --version`, { encoding: 'utf8', stdio: 'pipe' })
          console.log(`🎉 Installation verified: ${testResult.trim()}`)

          // Additional verification: check if it's executable
          try {
            fs.accessSync(targetPath, fs.constants.X_OK)
            console.log(`✅ Binary is executable`)
          }
          catch {
            console.log(`⚠️  Binary may not be executable`)
          }
        }
        catch (error) {
          console.log('⚠️  Installation completed but verification failed')

          // Check if it's a dependency issue
          const errorMessage = error instanceof Error ? error.message : String(error)
          if (errorMessage.includes('Cannot find module')) {
            console.log('⚠️  The binary appears to have dependency issues')
            console.log('This may be due to an issue with the pre-built binary')
            console.log('')
            console.log('💡 Alternative solutions:')
            console.log('1. Try a different version with --release')
            console.log('2. Build from source instead:')
            console.log('   git clone https://github.com/stacksjs/launchpad.git')
            console.log('   cd launchpad && bun install && bun run build')
          }
          else {
            console.log('The binary may still work correctly')
          }

          // Basic file existence check
          if (fs.existsSync(targetPath)) {
            const stats = fs.statSync(targetPath)
            console.log(`ℹ️  File exists (${(stats.size / 1024 / 1024).toFixed(1)} MB)`)
          }
        }

        // Add to PATH if needed
        if (!targetPath.includes('/usr/local/bin') && !targetPath.includes('/usr/bin')) {
          const binDir = path.dirname(targetPath)
          if (!isInPath(binDir)) {
            console.log('')
            console.log('💡 Tip: Add the binary directory to your PATH:')
            console.log(`   export PATH="${binDir}:$PATH"`)
            console.log('')
            console.log('Or add this line to your shell configuration (~/.zshrc, ~/.bashrc, etc.)')
          }
        }

        console.log('')
        console.log('🎉 Setup completed successfully!')
        console.log('')
        console.log('🚀 Next steps:')
        console.log('1. Restart your terminal or reload your shell configuration')
        console.log('2. Run: launchpad --version')
        console.log('3. Get started: launchpad bootstrap')
      }
      finally {
        // Cleanup temporary directory
        try {
          fs.rmSync(tmpDir, { recursive: true, force: true })
          if (options?.verbose) {
            console.log(`🧹 Cleaned up temporary files: ${tmpDir}`)
          }
        }
        catch {
          if (options?.verbose) {
            console.log(`⚠️  Could not clean up temporary files: ${tmpDir}`)
          }
        }
      }
    }
    catch (error) {
      console.error('Setup failed:', error instanceof Error ? error.message : String(error))
      console.log('')
      console.log('🔧 Troubleshooting:')
      console.log('• Check your internet connection')
      console.log('• Verify the version exists on GitHub releases: https://github.com/stacksjs/launchpad/releases')
      console.log('• Try a different version with --release (e.g., --release v0.3.5)')
      console.log('• Try a different target path with --target')
      console.log('• Use --verbose for more detailed output')
      console.log('')
      console.log('💡 Alternative: Build from source:')
      console.log('  git clone https://github.com/stacksjs/launchpad.git')
      console.log('  cd launchpad && bun install && bun run build')
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
  .command('dev [dir]', 'Set up development environment for project dependencies')
  .option('--dry-run', 'Show packages that would be installed without installing them')
  .option('--quiet', 'Suppress non-error output')
  .option('--shell', 'Output shell code for evaluation (use with eval)')
  .action(async (dir?: string, options?: { dryRun?: boolean, quiet?: boolean, shell?: boolean }) => {
    try {
      const targetDir = dir ? path.resolve(dir) : process.cwd()
      await dump(targetDir, {
        dryrun: options?.dryRun || false,
        quiet: options?.quiet || false,
        shellOutput: options?.shell || false,
      })
    }
    catch (error) {
      console.error('Failed to set up dev environment:', error instanceof Error ? error.message : String(error))
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
  .command('dev:on [dir]', 'Activate development environment (use `launchpad dev` instead)')
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
  .example('launchpad env:list --verbose')
  .example('launchpad env:list --format json')
  .action(async (options?: { verbose?: boolean, format?: string }) => {
    try {
      const { listEnvironments } = await import('../src/env')
      await listEnvironments({
        verbose: options?.verbose || false,
        format: options?.format || 'table',
      })
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
  .example('launchpad env:inspect dummy_6d7cf1d6 --verbose')
  .action(async (hash: string, options?: { verbose?: boolean, showStubs?: boolean }) => {
    try {
      const { inspectEnvironment } = await import('../src/env')
      await inspectEnvironment(hash, {
        verbose: options?.verbose || false,
        showStubs: options?.showStubs || false,
      })
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
  .option('--verbose', 'Show detailed cleanup information')
  .example('launchpad env:clean --dry-run')
  .example('launchpad env:clean --older-than 7')
  .example('launchpad env:clean --force')
  .action(async (options?: { dryRun?: boolean, olderThan?: string, force?: boolean, verbose?: boolean }) => {
    try {
      const { cleanEnvironments } = await import('../src/env')
      await cleanEnvironments({
        dryRun: options?.dryRun || false,
        olderThanDays: Number.parseInt(options?.olderThan || '30', 10),
        force: options?.force || false,
        verbose: options?.verbose || false,
      })
    }
    catch (error) {
      console.error('Failed to clean environments:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Remove specific environment command
cli
  .command('env:remove <hash>', 'Remove a specific development environment')
  .option('--force', 'Skip confirmation prompts')
  .option('--verbose', 'Show detailed removal information')
  .example('launchpad env:remove dummy_6d7cf1d6')
  .example('launchpad env:remove working-test_208a31ec --force')
  .action(async (hash: string, options?: { force?: boolean, verbose?: boolean }) => {
    try {
      const { removeEnvironment } = await import('../src/env')
      await removeEnvironment(hash, {
        force: options?.force || false,
        verbose: options?.verbose || false,
      })
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

    const isDryRun = options?.dryRun || false

    try {
      const os = await import('node:os')
      const homeDir = os.homedir()
      const cacheDir = path.join(homeDir, '.cache', 'launchpad')
      const bunCacheDir = path.join(homeDir, '.cache', 'launchpad', 'binaries', 'bun')
      const packageCacheDir = path.join(homeDir, '.cache', 'launchpad', 'binaries', 'packages')

      if (isDryRun) {
        console.log('🔍 DRY RUN MODE - Nothing will actually be cleared')
      }

      console.log(`${isDryRun ? 'Would clear' : 'Clearing'} Launchpad cache...`)

      if (!options?.force && !isDryRun) {
        console.log('⚠️  This will remove all cached packages and downloads')
        console.log('Use --force to skip confirmation or --dry-run to preview')
        process.exit(0)
      }

      let totalSize = 0
      let fileCount = 0

      // Calculate cache size and file count (optimized for performance)
      const calculateCacheStats = (dir: string) => {
        if (!fs.existsSync(dir))
          return

        try {
          // Use a more efficient approach - avoid recursive directory scanning
          // when possible and batch filesystem operations
          const stack = [dir]

          while (stack.length > 0) {
            const currentDir = stack.pop()!

            try {
              const entries = fs.readdirSync(currentDir, { withFileTypes: true })

              for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name)

                if (entry.isFile()) {
                  try {
                    const stats = fs.statSync(fullPath)
                    totalSize += stats.size
                    fileCount++
                  }
                  catch {
                    // Ignore files we can't stat
                  }
                }
                else if (entry.isDirectory()) {
                  stack.push(fullPath)
                }
              }
            }
            catch {
              // Skip directories we can't read
              continue
            }
          }
        }
        catch {
          // Ignore any errors during calculation
        }
      }

      if (fs.existsSync(cacheDir)) {
        calculateCacheStats(cacheDir)
      }

      const formatSize = (bytes: number): string => {
        const units = ['B', 'KB', 'MB', 'GB']
        let size = bytes
        let unitIndex = 0
        while (size >= 1024 && unitIndex < units.length - 1) {
          size /= 1024
          unitIndex++
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`
      }

      if (isDryRun) {
        if (fs.existsSync(cacheDir)) {
          console.log(`📊 Cache statistics:`)
          console.log(`   • Total size: ${formatSize(totalSize)}`)
          console.log(`   • File count: ${fileCount}`)
          console.log(`   • Cache directory: ${cacheDir}`)
          console.log('')
          console.log('Would remove:')
          if (fs.existsSync(bunCacheDir)) {
            console.log(`   • Bun cache: ${bunCacheDir}`)
          }
          if (fs.existsSync(packageCacheDir)) {
            console.log(`   • Package cache: ${packageCacheDir}`)
          }
        }
        else {
          console.log('📭 No cache found - nothing to clear')
        }
        return
      }

      // Actually clear the cache
      if (fs.existsSync(cacheDir)) {
        console.log(`📊 Clearing ${formatSize(totalSize)} of cached data (${fileCount} files)...`)

        fs.rmSync(cacheDir, { recursive: true, force: true })

        console.log('✅ Cache cleared successfully!')
        console.log(`   • Freed ${formatSize(totalSize)} of disk space`)
        console.log(`   • Removed ${fileCount} cached files`)
      }
      else {
        console.log('📭 No cache found - nothing to clear')
      }
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
  .example('launchpad clean --dry-run')
  .example('launchpad clean --force')
  .example('launchpad clean --keep-cache')
  .action(async (options?: { verbose?: boolean, force?: boolean, dryRun?: boolean, keepCache?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    const isDryRun = options?.dryRun || false

    try {
      if (isDryRun) {
        console.log('🔍 DRY RUN MODE - Nothing will actually be removed')
      }

      console.log(`${isDryRun ? 'Would perform' : 'Performing'} complete cleanup...`)

      if (!options?.force && !isDryRun) {
        console.log('⚠️  This will remove ALL Launchpad-installed packages and environments')
        console.log('⚠️  This includes package metadata, binaries, and libraries:')
        console.log(`   • ${path.join(install_prefix().string, 'pkgs')} (package metadata)`)
        console.log(`   • ${path.join(install_prefix().string, 'bin')} (Launchpad-installed binaries only)`)
        console.log(`   • ${install_prefix().string}/{domain}/v{version}/ (package files and libraries)`)
        console.log(`   • ~/.local/share/launchpad/ (project environments)`)
        if (!options?.keepCache) {
          console.log(`   • ~/.cache/launchpad/ (cached downloads)`)
        }
        console.log('')
        console.log('⚠️  This action cannot be undone!')
        console.log('')
        console.log('Use --force to skip confirmation or --dry-run to preview')
        process.exit(0)
      }

      const os = await import('node:os')
      const homeDir = os.homedir()
      const installPrefix = install_prefix().string

      // Helper function to get all Launchpad-managed binaries from package metadata
      const getLaunchpadBinaries = (): Array<{ binary: string, package: string, fullPath: string }> => {
        const binaries: Array<{ binary: string, package: string, fullPath: string }> = []
        const pkgsDir = path.join(installPrefix, 'pkgs')
        const binDir = path.join(installPrefix, 'bin')

        if (!fs.existsSync(pkgsDir))
          return binaries

        try {
          const domains = fs.readdirSync(pkgsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())

          for (const domain of domains) {
            const domainPath = path.join(pkgsDir, domain.name)
            const versions = fs.readdirSync(domainPath, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory())

            for (const version of versions) {
              const versionPath = path.join(domainPath, version.name)
              const metadataPath = path.join(versionPath, 'metadata.json')

              if (fs.existsSync(metadataPath)) {
                try {
                  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
                  if (metadata.binaries && Array.isArray(metadata.binaries)) {
                    for (const binary of metadata.binaries) {
                      const binaryPath = path.join(binDir, binary)
                      if (fs.existsSync(binaryPath)) {
                        binaries.push({
                          binary,
                          package: `${domain.name}@${version.name.slice(1)}`, // Remove 'v' prefix
                          fullPath: binaryPath,
                        })
                      }
                    }
                  }
                }
                catch {
                  // Ignore invalid metadata files
                }
              }
            }
          }
        }
        catch {
          // Ignore errors reading package directory
        }

        return binaries
      }

      // Get all directories and files to clean
      const localShareDir = path.join(homeDir, '.local', 'share', 'launchpad')
      const cacheDir = path.join(homeDir, '.cache', 'launchpad')
      const pkgsDir = path.join(installPrefix, 'pkgs')

      const dirsToCheck = [
        { path: pkgsDir, name: 'Package metadata' },
        { path: localShareDir, name: 'Project environments' },
      ]

      if (!options?.keepCache) {
        dirsToCheck.push({ path: cacheDir, name: 'Cache directory' })
      }

      // Also clean package directories (the new pkgx-compatible structure)
      try {
        const domains = fs.readdirSync(installPrefix, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory()
            && dirent.name !== 'bin'
            && dirent.name !== 'pkgs'
            && dirent.name !== '.tmp'
            && dirent.name !== '.cache'
            && dirent.name !== '.local')

        for (const domain of domains) {
          const domainPath = path.join(installPrefix, domain.name)
          dirsToCheck.push({ path: domainPath, name: `Package files (${domain.name})` })
        }
      }
      catch {
        // Ignore errors reading install prefix
      }

      // Get Launchpad-managed binaries
      const launchpadBinaries = getLaunchpadBinaries()

      // Calculate total size and file count
      let totalSize = 0
      let totalFiles = 0
      const existingDirs: { path: string, name: string, size: number, files: number }[] = []

      // Calculate directory sizes
      for (const dir of dirsToCheck) {
        if (fs.existsSync(dir.path)) {
          let dirSize = 0
          let dirFiles = 0

          try {
            const stack = [dir.path]

            while (stack.length > 0) {
              const currentDir = stack.pop()!

              try {
                const entries = fs.readdirSync(currentDir, { withFileTypes: true })

                for (const entry of entries) {
                  const fullPath = path.join(currentDir, entry.name)

                  if (entry.isFile()) {
                    try {
                      const stats = fs.statSync(fullPath)
                      dirSize += stats.size
                      dirFiles++
                    }
                    catch {
                      // Ignore files we can't stat
                    }
                  }
                  else if (entry.isDirectory()) {
                    stack.push(fullPath)
                  }
                }
              }
              catch {
                continue
              }
            }
          }
          catch {
            // Ignore directories we can't read
          }

          existingDirs.push({ path: dir.path, name: dir.name, size: dirSize, files: dirFiles })
          totalSize += dirSize
          totalFiles += dirFiles
        }
      }

      // Add binary sizes
      for (const binary of launchpadBinaries) {
        try {
          const stats = fs.statSync(binary.fullPath)
          totalSize += stats.size
          totalFiles++
        }
        catch {
          // Ignore files we can't stat
        }
      }

      const formatSize = (bytes: number): string => {
        const units = ['B', 'KB', 'MB', 'GB']
        let size = bytes
        let unitIndex = 0
        while (size >= 1024 && unitIndex < units.length - 1) {
          size /= 1024
          unitIndex++
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`
      }

      if (isDryRun) {
        if (existingDirs.length > 0 || launchpadBinaries.length > 0) {
          console.log(`📊 Cleanup statistics:`)
          console.log(`   • Total size: ${formatSize(totalSize)}`)
          console.log(`   • Total files: ${totalFiles}`)
          console.log('')
          console.log('Would remove:')

          existingDirs.forEach((dir) => {
            console.log(`   • ${dir.name}: ${dir.path} (${formatSize(dir.size)}, ${dir.files} files)`)
          })

          if (launchpadBinaries.length > 0) {
            console.log(`   • Launchpad binaries: ${launchpadBinaries.length} files`)
          }

          // Show specific packages and binaries that would be removed
          if (fs.existsSync(pkgsDir)) {
            try {
              const packages = fs.readdirSync(pkgsDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name)

              if (packages.length > 0) {
                console.log('')
                console.log('📦 Packages that would be removed:')
                packages.forEach((pkg) => {
                  console.log(`   • ${pkg}`)
                })
              }
            }
            catch {
              // Ignore errors reading packages directory
            }
          }

          if (launchpadBinaries.length > 0) {
            console.log('')
            console.log('🔧 Binaries that would be removed:')
            const binariesByPackage = launchpadBinaries.reduce((acc, { binary, package: pkg }) => {
              if (!acc[pkg])
                acc[pkg] = []
              acc[pkg].push(binary)
              return acc
            }, {} as Record<string, string[]>)

            Object.entries(binariesByPackage).forEach(([pkg, binaries]) => {
              console.log(`   • ${pkg}: ${binaries.join(', ')}`)
            })
          }
        }
        else {
          console.log('📭 Nothing found to clean')
        }
        return
      }

      // Actually perform cleanup
      if (existingDirs.length > 0 || launchpadBinaries.length > 0) {
        console.log(`📊 Cleaning ${formatSize(totalSize)} of data (${totalFiles} files)...`)
        console.log('')

        let removedDirs = 0
        let removedBinaries = 0

        // Remove directories
        for (const dir of existingDirs) {
          try {
            console.log(`🗑️  Removing ${dir.name}...`)
            fs.rmSync(dir.path, { recursive: true, force: true })
            removedDirs++
            if (options?.verbose) {
              console.log(`   ✅ Removed ${dir.path} (${formatSize(dir.size)}, ${dir.files} files)`)
            }
          }
          catch (error) {
            console.error(`   ❌ Failed to remove ${dir.path}:`, error instanceof Error ? error.message : String(error))
          }
        }

        // Remove Launchpad-managed binaries
        if (launchpadBinaries.length > 0) {
          console.log(`🗑️  Removing Launchpad-installed binaries...`)
          for (const { binary, fullPath } of launchpadBinaries) {
            try {
              fs.unlinkSync(fullPath)
              removedBinaries++
              if (options?.verbose) {
                console.log(`   ✅ Removed binary: ${binary}`)
              }
            }
            catch (error) {
              if (options?.verbose) {
                console.error(`   ❌ Failed to remove ${binary}:`, error instanceof Error ? error.message : String(error))
              }
            }
          }
        }

        console.log('')
        console.log('✅ Cleanup completed!')
        console.log(`   • Removed ${removedDirs}/${existingDirs.length} directories`)
        if (launchpadBinaries.length > 0) {
          console.log(`   • Removed ${removedBinaries}/${launchpadBinaries.length} binaries`)
        }
        console.log(`   • Freed ${formatSize(totalSize)} of disk space`)

        if (options?.keepCache) {
          console.log('')
          console.log('💡 Cache was preserved. Use `launchpad cache:clear` to remove cached downloads.')
        }
      }
      else {
        console.log('📭 Nothing found to clean')
      }
    }
    catch (error) {
      console.error('Failed to perform cleanup:', error instanceof Error ? error.message : String(error))
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
  .command('update [packages...]', 'Update packages to newer versions')
  .alias('upgrade')
  .alias('up')
  .option('--verbose', 'Enable verbose output')
  .option('--latest', 'Update to the latest version (ignoring current constraints)')
  .option('--dry-run', 'Show what would be updated without actually updating')
  .example('launchpad update')
  .example('launchpad upgrade bun --latest')
  .example('launchpad up node python --latest')
  .example('launchpad update --dry-run')
  .action(async (packages: string[], options?: { verbose?: boolean, latest?: boolean, dryRun?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    // Ensure packages is an array
    const packageList = Array.isArray(packages) ? packages : [packages].filter(Boolean)

    try {
      if (packageList.length === 0) {
        // Update all packages
        const { update } = await import('../src/package')
        await update(undefined, { latest: options?.latest, dryRun: options?.dryRun })
      }
      else {
        // Update specific packages
        const { update } = await import('../src/package')
        await update(packageList, { latest: options?.latest, dryRun: options?.dryRun })
      }
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
      console.log('📊 Cache Statistics\n')

      const stats = getCacheStats()

      console.log(`📦 Cached Packages: ${stats.packages}`)
      console.log(`💾 Total Size: ${stats.size}`)
      console.log(`📅 Oldest Access: ${stats.oldestAccess}`)
      console.log(`📅 Newest Access: ${stats.newestAccess}`)

      if (stats.packages > 0) {
        console.log('\n💡 Use `launchpad cache:clean` to free up disk space')
      }
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
      const maxAgeDays = options?.maxAge ? Number.parseInt(options.maxAge, 10) : 30
      const maxSizeGB = options?.maxSize ? Number.parseFloat(options.maxSize) : 5

      if (options?.dryRun) {
        console.log('🔍 DRY RUN - Showing what would be cleaned:\n')

        const stats = getCacheStats()
        console.log(`Current cache: ${stats.packages} packages, ${stats.size}`)
        console.log(`Cleanup criteria: older than ${maxAgeDays} days OR total size > ${maxSizeGB} GB`)
        console.log('\n💡 Run without --dry-run to actually clean the cache')
      }
      else {
        console.log('🧹 Cleaning cache...\n')
        cleanupCache(maxAgeDays, maxSizeGB)

        const newStats = getCacheStats()
        console.log(`\n✅ Cache cleanup completed`)
        console.log(`📦 Remaining packages: ${newStats.packages}`)
        console.log(`💾 Current size: ${newStats.size}`)
      }
    }
    catch (error) {
      console.error('Failed to clean cache:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

cli
  .command('cache:clear', 'Clear all cached packages and downloads')
  .alias('cache:clean')
  .option('--force', 'Skip confirmation prompt')
  .option('--dry-run', 'Show what would be removed without actually removing files')
  .option('--verbose', 'Show detailed information')
  .example('launchpad cache:clear')
  .example('launchpad cache:clear --force')
  .example('launchpad cache:clear --dry-run')
  .action(async (options?: { force?: boolean, dryRun?: boolean, verbose?: boolean }) => {
    try {
      // Import modules at the top to avoid redeclaration issues
      const fs = await import('node:fs')
      const path = await import('node:path')
      const cacheDir = path.join(process.env.HOME || '.', '.cache', 'launchpad')

      const stats = getCacheStats()

      if (options?.dryRun) {
        console.log('DRY RUN MODE - Cache statistics\n')
        console.log(`Total size: ${stats.size}`)
        console.log(`File count: ${stats.packages}`)

        if (stats.packages > 0) {
          console.log('\nWould remove:')
          console.log(`Package cache: ${stats.size}`)
        }
        else {
          console.log('Total size: 0.0 B')
          console.log('File count: 0')
        }
        return
      }

      // Check if cache directory exists, even if stats show 0 packages
      // (stats might be 0 due to permission errors reading the directory)
      if (stats.packages === 0 && !fs.existsSync(cacheDir)) {
        console.log('📭 Cache is already empty')
        return
      }

      if (!options?.force) {
        console.log('This will remove all cached packages and downloads')
        console.log('Use --force to skip confirmation')
        return
      }

      console.log('🗑️  Clearing cache...')
      const sizeBefore = stats.size
      const filesBefore = stats.packages

      // Remove the entire cache directory

      try {
        if (fs.existsSync(cacheDir)) {
          fs.rmSync(cacheDir, { recursive: true, force: true })
        }

        console.log('Cache cleared successfully!')
        console.log(`Freed ${sizeBefore}`)
        console.log(`Removed ${filesBefore} files`)
      }
      catch (error) {
        console.error('Failed to clear cache:', error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    }
    catch (error) {
      console.error('Failed to clear cache:', error instanceof Error ? error.message : String(error))
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
