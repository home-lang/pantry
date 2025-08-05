#!/usr/bin/env bun
// Set CLI mode to prevent fake binaries in normal usage
process.env.LAUNCHPAD_CLI_MODE = '1'

import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { CAC } from 'cac'
import { install, install_prefix, installDependenciesOnly, list, uninstall } from '../src'
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

// Default version for setup command (derived from package.json version)
const DEFAULT_SETUP_VERSION = `v${version}`

/**
 * Core setup logic that can be called from both setup and upgrade commands
 * Returns true if verification succeeded, false if it failed
 */
async function performSetup(options: {
  targetVersion: string
  targetPath: string
  force?: boolean
  verbose?: boolean
}): Promise<boolean> {
  const { targetVersion, targetPath, force, verbose } = options

  // Validate version format
  if (targetVersion && !targetVersion.match(/^v?\d+\.\d+\.\d+$/)) {
    throw new Error(`Invalid version format: ${targetVersion}. Expected format: v0.3.6 or 0.3.6`)
  }

  // Check if target already exists
  if (fs.existsSync(targetPath) && !force) {
    try {
      const stats = fs.lstatSync(targetPath)
      let message = `File already exists at ${targetPath}`

      if (stats.isSymbolicLink()) {
        const linkTarget = fs.readlinkSync(targetPath)
        message = `Symlink already exists at ${targetPath} → ${linkTarget}`
      }

      throw new Error(`${message}\n\nOptions:\n• Use --force to overwrite\n• Choose a different --target path\n• Remove the existing file/symlink manually`)
    }
    catch (error) {
      if (error instanceof Error && error.message.includes('Options:')) {
        throw error
      }
      throw new Error(`Something already exists at ${targetPath}. Use --force to overwrite.`)
    }
  }

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
    throw new Error(`Unsupported platform: ${platform}-${arch}\n\nSupported platforms:\n• macOS (arm64, x64)\n• Linux (arm64, x64)\n• Windows (x64)`)
  }

  if (verbose) {
    console.log(`📋 Platform: ${platform}-${arch}`)
    console.log(`🎯 Target: ${targetPath}`)
    console.log(`📌 Version: ${targetVersion}`)
  }

  // Download URL
  const downloadUrl = `https://github.com/stacksjs/launchpad/releases/download/${targetVersion}/${binaryName}`

  // Create temporary directory for download
  const tmpDir = path.join(os.tmpdir(), `launchpad-setup-${Date.now()}`)
  fs.mkdirSync(tmpDir, { recursive: true })

  const zipPath = path.join(tmpDir, binaryName)

  try {
    // Download the file
    const response = await globalThis.fetch(downloadUrl)
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Version ${targetVersion} not found. Please check available releases at: https://github.com/stacksjs/launchpad/releases`)
      }
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`)
    }

    const contentLength = response.headers.get('content-length')
    const totalBytes = contentLength ? Number.parseInt(contentLength, 10) : 0

    // Show real-time download progress like Bun (silent by default)
    const reader = response.body?.getReader()
    const chunks: Uint8Array[] = []
    let downloadedBytes = 0

    if (reader && totalBytes > 0 && !verbose) {
      // Silent download with progress
      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break

        if (value) {
          chunks.push(value)
          downloadedBytes += value.length

          // Show progress
          const progress = (downloadedBytes / totalBytes * 100).toFixed(0)
          process.stdout.write(`\r⬇️  ${downloadedBytes}/${totalBytes} bytes (${progress}%)`)
        }
      }
      process.stdout.write('\r\x1B[K') // Clear the progress line
    }
    else {
      // Verbose mode or fallback
      if (verbose) {
        if (totalBytes > 0) {
          console.log(`⬇️  Downloading ${(totalBytes / 1024 / 1024).toFixed(1)} MB...`)
        }
        else {
          console.log('⬇️  Downloading...')
        }
      }

      const buffer = await response.arrayBuffer()
      chunks.push(new Uint8Array(buffer))

      if (verbose) {
        console.log(`✅ Downloaded ${(chunks[0].length / 1024 / 1024).toFixed(1)} MB`)
      }
    }

    // Combine all chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const buffer = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      buffer.set(chunk, offset)
      offset += chunk.length
    }

    fs.writeFileSync(zipPath, buffer)

    // Extract the zip file (silent by default)
    if (verbose) {
      console.log('📂 Extracting...')
    }

    const { execSync } = await import('node:child_process')

    try {
      execSync(`cd "${tmpDir}" && unzip -q "${binaryName}"`, { stdio: 'pipe' })
    }
    catch {
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

    // Ensure target directory exists
    const targetDir = path.dirname(targetPath)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    // Check if we need sudo for the target path
    const needsSudo = targetPath.startsWith('/usr/') || targetPath.startsWith('/opt/') || targetPath.startsWith('/bin/') || targetPath.startsWith('/sbin/')

    if (needsSudo && platform !== 'win32') {
      console.log('🔒 Installing to system directory \x1B[3m(may require sudo)\x1B[0m...')

      try {
        // Try to copy with sudo
        execSync(`sudo cp "${sourcePath}" "${targetPath}"`, { stdio: 'inherit' })
        execSync(`sudo chmod +x "${targetPath}"`, { stdio: 'inherit' })

        // Use appropriate group for the platform
        const group = platform === 'darwin' ? 'wheel' : 'root'
        execSync(`sudo chown root:${group} "${targetPath}"`, { stdio: 'inherit' })
      }
      catch {
        throw new Error(`Failed to install with sudo. You may need to run this command with elevated privileges.\n\nAlternative: Try installing to a user directory:\n  launchpad setup --target ~/bin/launchpad\n\n💡 Tip: You can also try copying the binary manually:\n  sudo cp "${sourcePath}" "${targetPath}"\n  sudo chmod +x "${targetPath}"`)
      }
    }
    else {
      // Regular copy
      if (verbose) {
        console.log('📋 Installing binary...')
      }
      fs.copyFileSync(sourcePath, targetPath)

      // Make executable (Unix-like systems)
      if (platform !== 'win32') {
        fs.chmodSync(targetPath, 0o755)
      }
    }

    if (verbose) {
      console.log(`✅ Binary installed to: ${targetPath}`)
    }

    // Verify installation
    let verificationSucceeded = false
    try {
      const testResult = execSync(`"${targetPath}" --version`, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 10000, // 10 second timeout to prevent hanging
      })

      if (verbose) {
        console.log(`🎉 Installation verified: ${testResult.trim()}`)
      }
      verificationSucceeded = true

      // Additional verification: check if it's executable
      try {
        fs.accessSync(targetPath, fs.constants.X_OK)
        if (verbose) {
          console.log(`✅ Binary is executable`)
        }
      }
      catch {
        if (verbose) {
          console.log(`⚠️  Binary may not be executable`)
        }
      }
    }
    catch (error) {
      // Check if it's a dependency issue first
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
        // Timeout is common and usually not a real problem
        if (verbose) {
          console.log('⚠️  Verification timed out - the binary may still work correctly')
        }
        // Consider timeout as success if file exists and has reasonable size
        if (fs.existsSync(targetPath)) {
          const stats = fs.statSync(targetPath)
          if (stats.size > 1000000) {
            verificationSucceeded = true
          }
        }
      }
      else if (errorMessage.includes('killed') || errorMessage.includes('SIGKILL') || errorMessage.includes('signal')) {
        console.log('⚠️  Installation completed but verification failed due to code signing issues')
        console.log('⚠️  This is a known issue with downloaded pre-built binaries on macOS')
        console.log('')
        console.log('🔧 To fix this issue:')
        console.log(`1. Remove the quarantine attribute: sudo xattr -d com.apple.quarantine "${targetPath}"`)
        console.log('2. Or build from source instead:')
        console.log('   git clone https://github.com/stacksjs/launchpad.git')
        console.log('   cd launchpad/packages/launchpad && bun install && bun run build')
        console.log(`   sudo cp bin/launchpad "${targetPath}"`)
        console.log('')
        console.log('💡 The binary was installed but may not work due to macOS security restrictions')

        // Try to remove quarantine attribute automatically
        try {
          execSync(`sudo xattr -d com.apple.quarantine "${targetPath}"`, { stdio: 'pipe' })
          console.log('✅ Attempted to remove quarantine attribute')

          // Try verification again
          try {
            execSync(`"${targetPath}" --version`, {
              encoding: 'utf8',
              stdio: 'pipe',
              timeout: 5000,
            })
            console.log('✅ Binary verification succeeded after removing quarantine attribute')
            verificationSucceeded = true
          }
          catch {
            console.log('⚠️  Binary still fails verification - code signing issues persist')
          }
        }
        catch {
          console.log('⚠️  Could not automatically remove quarantine attribute (no sudo access)')
        }
      }
      else if (errorMessage.includes('Cannot find module') || errorMessage.includes('dyld') || errorMessage.includes('Library not loaded')) {
        console.log('⚠️  Installation completed but verification failed')
        console.log('⚠️  The binary appears to have dependency issues')
        console.log('This may be due to an issue with the pre-built binary')
        console.log('')
        console.log('💡 Alternative solutions:')
        console.log('1. Try a different version with --release')
        console.log('2. Build from source instead:')
        console.log('   git clone https://github.com/stacksjs/launchpad.git')
        console.log('   cd launchpad/packages/launchpad && bun install && bun run build')
        console.log(`   sudo cp bin/launchpad "${targetPath}"`)
      }
      else {
        if (verbose) {
          console.log('⚠️  Installation completed but verification failed')
          console.log('The binary may still work correctly')
        }

        // Check if file exists and appears valid
        if (fs.existsSync(targetPath)) {
          const stats = fs.statSync(targetPath)
          if (stats.size > 1000000) {
            verificationSucceeded = true
          }
          if (verbose) {
            console.log(`ℹ️  File exists (${(stats.size / 1024 / 1024).toFixed(1)} MB)`)
          }
        }
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
    // Return verification result
    return verificationSucceeded
  }
  finally {
    // Cleanup temporary directory
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
      if (verbose) {
        console.log(`🧹 Cleaned up temporary files`)
      }
    }
    catch {
      if (verbose) {
        console.log(`⚠️  Could not clean up temporary files: ${tmpDir}`)
      }
    }
  }
}

/**
 * Check if a path is a directory
 */
async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(path)
    return stats.isDirectory()
  }
  catch {
    return false
  }
}

/**
 * Set up development environment for a project directory
 */
async function setupDevelopmentEnvironment(
  targetDir: string,
  options: { dryRun?: boolean, quiet?: boolean, shell?: boolean },
): Promise<void> {
  // For shell integration, force quiet mode and set environment variable
  const isShellIntegration = options?.shell || false
  if (isShellIntegration) {
    process.env.LAUNCHPAD_SHELL_INTEGRATION = '1'
  }

  await dump(targetDir, {
    dryrun: options?.dryRun || false,
    quiet: options?.quiet || isShellIntegration,
    shellOutput: isShellIntegration,
    skipGlobal: process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_SKIP_GLOBAL_AUTO_SCAN === 'true',
  })
}

/**
 * Create symlinks for global binaries to ~/.local/bin
 */
async function createGlobalBinarySymlinks(globalEnvDir: string): Promise<void> {
  try {
    const globalBinDir = path.join(globalEnvDir, 'bin')
    const localBinDir = path.join(homedir(), '.local', 'bin')

    // Ensure ~/.local/bin exists
    await fs.promises.mkdir(localBinDir, { recursive: true })

    if (!fs.existsSync(globalBinDir)) {
      return // No global binaries to link
    }

    const binaries = await fs.promises.readdir(globalBinDir)

    for (const binary of binaries) {
      const sourcePath = path.join(globalBinDir, binary)
      const targetPath = path.join(localBinDir, binary)

      // Skip if source is not a file or symlink
      const stats = await fs.promises.lstat(sourcePath)
      if (!stats.isFile() && !stats.isSymbolicLink()) {
        continue
      }

      // Remove existing symlink if it exists
      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath)
      }

      // Create new symlink
      await fs.promises.symlink(sourcePath, targetPath)
    }
  }
  catch (error) {
    // Don't fail the whole installation if symlink creation fails
    console.warn('⚠️  Warning: Failed to create global binary symlinks:', error)
  }
}

/**
 * Find all dependency files across the machine and install global dependencies
 */
async function installGlobalDependencies(options: {
  dryRun?: boolean
  quiet?: boolean
  verbose?: boolean
}): Promise<void> {
  if (!options.quiet) {
    console.log('🔍 Scanning machine for dependency files...')
  }

  const overallStartTime = Date.now()

  // For global deps, only scan for Launchpad-specific dependency files
  const globalDepFileNames = [
    'deps.yaml',
    'deps.yml',
    'dependencies.yaml',
    'dependencies.yml',
  ]

  // More targeted locations where dependency files are likely to be found
  const globalDepLocations = [
    // Direct home directory files only (no deep scanning)
    homedir(),
    // Common dotfiles locations
    path.join(homedir(), '.dotfiles'),
    path.join(homedir(), '.config'),
    // Common project directories (limit depth)
    path.join(homedir(), 'Projects'),
    path.join(homedir(), 'Code'),
    path.join(homedir(), 'Development'),
    path.join(homedir(), 'dev'),
    path.join(homedir(), 'workspace'),
    path.join(homedir(), 'src'),
    // Desktop for quick projects
    path.join(homedir(), 'Desktop'),
    // System locations (but these are usually not writable anyway)
    '/opt',
    '/usr/local',
  ]

  const foundFiles: string[] = []
  const allPackages = new Set<string>()

  // Use simple glob patterns - keep it fast and reliable
  const dependencyPatterns = globalDepFileNames.map(name => `**/${name}`)

  // Search for dependency files in all potential locations using Bun glob with exclusions
  for (const location of globalDepLocations) {
    if (!fs.existsSync(location))
      continue

    try {
      if (options.verbose) {
        console.log(`🔍 Scanning ${location}...`)
      }
      const locationStartTime = Date.now()

      // Special handling for different directory types with appropriate timeouts
      const isHomeDir = location === homedir()
      const isCodeDir = location.includes('/Code') || location.includes('/Projects') || location.includes('/Development')

      // Use manual traversal for fast and reliable scanning with exclusions
      for (const pattern of dependencyPatterns) {
        let fileCount = 0
        const startTime = Date.now()
        const maxScanTime = isHomeDir ? 1000 : (isCodeDir ? 5000 : 2000)
        const fileName = pattern.replace('**/', '')

        if (isHomeDir) {
          // Home dir: only scan direct files
          try {
            const entries = await fs.promises.readdir(location)
            for (const entry of entries) {
              if (entry === fileName) {
                foundFiles.push(path.join(location, entry))
                fileCount++
              }
            }
          }
          catch {
            // Skip if can't read directory
          }
        }
        else {
          // Other dirs: recursive scan with exclusions
          async function scanDir(dir: string, depth: number = 0): Promise<void> {
            if (Date.now() - startTime > maxScanTime || fileCount >= 100 || depth > 6) {
              return
            }

            try {
              const entries = await fs.promises.readdir(dir, { withFileTypes: true })

              for (const entry of entries) {
                if (Date.now() - startTime > maxScanTime || fileCount >= 100)
                  break

                const fullPath = path.join(dir, entry.name)

                if (entry.isFile() && entry.name === fileName) {
                  foundFiles.push(fullPath)
                  fileCount++
                }
                else if (entry.isDirectory()) {
                  // Skip excluded directories
                  const shouldSkip = [
                    'node_modules',
                    'vendor',
                    '.git',
                    '.svn',
                    '.hg',
                    'dist',
                    'build',
                    'target',
                    'out',
                    'tmp',
                    'temp',
                    'cache',
                    '.cache',
                    '.npm',
                    '.yarn',
                    '.pnpm',
                    '.bun',
                    'logs',
                    'coverage',
                    '.nyc_output',
                    '.pytest_cache',
                    '__pycache__',
                    '.venv',
                    'venv',
                    'env',
                    '.env',
                    'virtualenv',
                    '.next',
                    '.nuxt',
                    '.output',
                    'public',
                    'static',
                    'assets',
                    'uploads',
                    'storage',
                    'backups',
                    'dumps',
                    'migrations',
                    'seeds',
                    'test-results',
                    'playwright-report',
                    '.playwright',
                    '.vscode',
                    '.idea',
                    'docs',
                    'documentation',
                    'examples',
                    'demo',
                    'demos',
                    'samples',
                    'test',
                    'tests',
                    '__tests__',
                    'test-envs',
                    'test-environments',
                    'spec',
                    'cypress',
                    'e2e',
                    '.turbo',
                    '.vercel',
                    '.netlify',
                    '.github',
                    '.gitlab',
                    '.bitbucket',
                  ].includes(entry.name)

                  if (!shouldSkip) {
                    await scanDir(fullPath, depth + 1)
                  }
                }
              }
            }
            catch {
              // Skip directories we can't read
            }
          }

          await scanDir(location)
        }

        if (options.verbose && fileCount > 0) {
          console.log(`  ✓ Found ${fileCount} files matching ${pattern} in ${location} (${Date.now() - startTime}ms)`)
        }
      }

      const locationTime = Date.now() - locationStartTime
      if (options.verbose || locationTime > 1000) {
        console.log(`📍 Completed ${location} in ${locationTime}ms`)
      }
    }
    catch (error) {
      if (options.verbose) {
        console.warn(`Failed to scan ${location}: ${error instanceof Error ? error.message : String(error)}`)
      }
      continue
    }
  }

  const overallTime = Date.now() - overallStartTime
  if (!options.quiet) {
    console.log(`📁 Found ${foundFiles.length} dependency files in ${overallTime}ms`)
  }

  // Parse all found dependency files and extract packages
  const { default: sniff } = await import('../src/dev/sniff')

  for (const file of foundFiles) {
    try {
      const dir = path.dirname(file)
      const sniffResult = await sniff({ string: dir })

      for (const pkg of sniffResult.pkgs) {
        allPackages.add(pkg.project)
      }

      if (options.verbose) {
        console.log(`  📄 ${file}: ${sniffResult.pkgs.length} packages`)
      }
    }
    catch (error) {
      if (options.verbose) {
        console.warn(`Failed to parse ${file}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  // Filter out test/fake packages that shouldn't be installed
  const fakePackagePatterns = [
    'fake.com',
    'nonexistent.org',
    'test.com',
    'example.com',
    'localhost',
    'invalid.domain',
    'mock.test',
    'dummy.pkg',
  ]

  const filteredPackages = Array.from(allPackages).filter((pkg) => {
    const packageName = pkg.split('@')[0].toLowerCase()
    const isFake = fakePackagePatterns.some(pattern =>
      packageName.includes(pattern) || packageName === pattern,
    )

    if (isFake && options.verbose) {
      console.log(`🚫 Skipping fake/test package: ${pkg}`)
    }

    return !isFake
  })

  if (!options.quiet) {
    console.log(`📦 Found ${filteredPackages.length} unique global dependencies`)
    if (options.dryRun) {
      console.log('🔍 Packages that would be installed:')
      filteredPackages.forEach(pkg => console.log(`  • ${pkg}`))
      return
    }
  }

  if (filteredPackages.length === 0) {
    if (!options.quiet) {
      console.log('ℹ️  No global dependencies found')
    }
    return
  }

  // Install all global dependencies
  const globalEnvDir = path.join(homedir(), '.local', 'share', 'launchpad', 'global')

  try {
    const results = await install(filteredPackages, globalEnvDir)

    // Create symlinks to ~/.local/bin for global accessibility
    await createGlobalBinarySymlinks(globalEnvDir)

    if (!options.quiet) {
      if (results.length > 0) {
        console.log(`🎉 Successfully installed ${filteredPackages.length} global dependencies (${results.length} binaries)`)
      }
      else {
        console.log('✅ All global dependencies were already installed')
      }
    }
  }
  catch (error) {
    if (!options.quiet) {
      console.error('❌ Failed to install global dependencies:', error instanceof Error ? error.message : String(error))
    }
    throw error
  }
}

const cli = new CAC('launchpad')

cli.version(version)
cli.help()

// Main installation command
cli
  .command('install [packages...]', 'Install packages or set up development environment')
  .alias('i')
  .alias('add')
  .option('--verbose', 'Enable verbose output')
  .option('--path <path>', 'Custom installation path')
  .option('--global-deps', 'Install all global dependencies found across the machine')
  .option('--deps-only', 'Install only the dependencies of packages, not the packages themselves')
  .option('--dry-run', 'Show packages that would be installed without installing them')
  .option('--quiet', 'Suppress non-error output')
  .option('--shell', 'Output shell code for evaluation (use with eval)')
  .example('launchpad install node python')
  .example('launchpad install --path ~/.local node python')
  .example('launchpad install php --deps-only')
  .example('launchpad install')
  .example('launchpad install ./my-project')
  .example('launchpad install --global-deps')
  .example('launchpad add node python')
  .action(async (packages: string[], options: {
    verbose?: boolean
    path?: string
    globalDeps?: boolean
    depsOnly?: boolean
    dryRun?: boolean
    quiet?: boolean
    shell?: boolean
  }) => {
    if (options.verbose) {
      config.verbose = true
    }

    // Ensure packages is an array
    const packageList = Array.isArray(packages) ? packages : [packages].filter(Boolean)

    try {
      // Handle global dependencies installation
      if (options.globalDeps) {
        await installGlobalDependencies(options)
        return
      }

      // Handle dependencies-only installation
      if (options.depsOnly) {
        if (packageList.length === 0) {
          console.error('Error: --deps-only requires at least one package to be specified')
          process.exit(1)
        }

        const defaultInstallPath = path.join(homedir(), '.local', 'share', 'launchpad', 'global')
        const installPath = options.path || defaultInstallPath
        const results = await installDependenciesOnly(packageList, installPath)

        // Create symlinks to ~/.local/bin for global accessibility when using default path
        if (!options.path) {
          await createGlobalBinarySymlinks(installPath)
        }

        if (!options.quiet && options.verbose && results.length > 0) {
          // Only show file list in verbose mode since installDependenciesOnly already shows summary
          results.forEach((file) => {
            console.log(`  ${file}`)
          })
        }
        return
      }

      // Handle development environment setup (no packages specified or directory path given)
      if (packageList.length === 0 || (packageList.length === 1 && await isDirectory(packageList[0]))) {
        const targetDir = packageList.length === 1 ? path.resolve(packageList[0]) : process.cwd()
        await setupDevelopmentEnvironment(targetDir, options)
        return
      }

      // Handle regular package installation
      // Use Launchpad global directory by default instead of /usr/local
      const defaultInstallPath = path.join(homedir(), '.local', 'share', 'launchpad', 'global')
      const installPath = options.path || defaultInstallPath
      const results = await install(packageList, installPath)

      // Create symlinks to ~/.local/bin for global accessibility when using default path
      if (!options.path) {
        await createGlobalBinarySymlinks(installPath)
      }

      if (!options.quiet) {
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
    }
    catch (error) {
      if (!options.quiet) {
        console.error('Installation failed:', error instanceof Error ? error.message : String(error))
      }
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
  .option('--release <version>', `Specific version to download (default: ${DEFAULT_SETUP_VERSION})`)
  .option('--target <path>', 'Target installation path (default: /usr/local/bin/launchpad)')
  .example('launchpad setup')
  .example('launchpad setup --force --verbose')
  .example('launchpad setup --release v0.3.5')
  .example('launchpad setup --target ~/bin/launchpad')
  .action(async (options?: { force?: boolean, verbose?: boolean, release?: string, target?: string }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    const targetVersion = options?.release || DEFAULT_SETUP_VERSION
    const targetPath = options?.target || '/usr/local/bin/launchpad'

    console.log('🚀 Setting up Launchpad binary...')
    console.log('')

    try {
      const verificationSucceeded = await performSetup({
        targetVersion,
        targetPath,
        force: options?.force || false,
        verbose: options?.verbose || false,
      })

      console.log('')
      if (verificationSucceeded) {
        console.log('🎉 Setup completed successfully!')
        console.log('')
        console.log('🚀 Next steps:')
        console.log('1. Restart your terminal or reload your shell configuration')
        console.log('2. Run: launchpad --version')
        console.log('3. Get started: launchpad bootstrap')
      }
      else {
        console.log('⚠️  Setup completed with verification issues')
        console.log('')
        console.log('⚠️  The binary was installed but failed verification.')
        console.log('It may still work, but there could be compatibility issues.')
        console.log('')
        console.log('🔧 Recommended actions:')
        console.log('1. Try running: launchpad --version')
        console.log('2. If it hangs, try a different version with --release')
        console.log('3. Consider building from source if issues persist')
        console.log('')
        console.log('💡 Alternative: Build from source:')
        console.log('  git clone https://github.com/stacksjs/launchpad.git')
        console.log('  cd launchpad && bun install && bun run build')
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

// Debug command - debug global dependencies and their sources
cli
  .command('debug:deps', 'Debug global dependencies and show their sources')
  .option('--package <name>', 'Filter by specific package name')
  .option('--version <version>', 'Filter by specific version')
  .action(async (options) => {
    console.log('🔍 Debugging global dependencies...\n')

    // Scan for dependency files (same logic as global deps)
    const globalDepFileNames = [
      'deps.yaml',
      'deps.yml',
      'dependencies.yaml',
      'dependencies.yml',
    ]

    const globalDepLocations = [
      homedir(),
      path.join(homedir(), '.dotfiles'),
      path.join(homedir(), '.config'),
      path.join(homedir(), 'Projects'),
      path.join(homedir(), 'Code'),
      path.join(homedir(), 'Development'),
      path.join(homedir(), 'dev'),
      path.join(homedir(), 'workspace'),
      path.join(homedir(), 'src'),
      path.join(homedir(), 'Desktop'),
      '/opt',
      '/usr/local',
    ]

    const foundFiles: Array<{ file: string, packages: Array<{ name: string, version?: string }> }> = []
    const packageSources: Map<string, Array<{ file: string, version?: string }>> = new Map()

    // Manual traversal like in installGlobalDependencies
    for (const location of globalDepLocations) {
      if (!fs.existsSync(location))
        continue

      for (const fileName of globalDepFileNames) {
        async function scanDir(dir: string, depth: number = 0): Promise<void> {
          if (depth > 6)
            return

          try {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true })

            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name)

              if (entry.isDirectory()) {
                // Skip large/irrelevant directories and test environments
                if (['node_modules', 'vendor', '.git', '.svn', '.hg', 'dist', 'build', 'target', 'venv', '__pycache__', '.vscode', '.idea', 'coverage', '.nyc_output', 'logs', 'test-envs', 'test', 'tests', '__tests__'].includes(entry.name)) {
                  continue
                }
                await scanDir(fullPath, depth + 1)
              }
              else if (entry.name === fileName) {
                try {
                  const _content = await fs.promises.readFile(fullPath, 'utf-8')
                  const { default: sniff } = await import('../src/dev/sniff')
                  const sniffResult = await sniff({ string: path.dirname(fullPath) })

                  const packages = sniffResult.pkgs.map(pkg => ({
                    name: pkg.project,
                    version: String(pkg.constraint),
                  }))

                  foundFiles.push({ file: fullPath, packages })

                  // Track package sources
                  for (const pkg of packages) {
                    if (!packageSources.has(pkg.name)) {
                      packageSources.set(pkg.name, [])
                    }
                    packageSources.get(pkg.name)!.push({
                      file: fullPath,
                      version: String(pkg.version),
                    })
                  }
                }
                catch {
                  // Skip files that can't be parsed
                }
              }
            }
          }
          catch {
            // Skip directories we can't read
          }
        }

        if (location === homedir()) {
          // Direct file check for home directory
          const directFile = path.join(location, fileName)
          if (fs.existsSync(directFile)) {
            try {
              const _content = await fs.promises.readFile(directFile, 'utf-8')
              const { default: sniff } = await import('../src/dev/sniff')
              const sniffResult = await sniff({ string: location })

              const packages = sniffResult.pkgs.map(pkg => ({
                name: pkg.project,
                version: String(pkg.constraint),
              }))

              foundFiles.push({ file: directFile, packages })

              for (const pkg of packages) {
                if (!packageSources.has(pkg.name)) {
                  packageSources.set(pkg.name, [])
                }
                packageSources.get(pkg.name)!.push({
                  file: directFile,
                  version: String(pkg.version),
                })
              }
            }
            catch {
              // Skip
            }
          }
        }
        else {
          await scanDir(location, 0)
        }
      }
    }

    // Filter results if options provided
    let filteredSources = packageSources
    if (options.package) {
      const filtered = new Map()
      for (const [pkg, sources] of packageSources) {
        if (pkg.toLowerCase().includes(options.package.toLowerCase())) {
          filtered.set(pkg, sources)
        }
      }
      filteredSources = filtered
    }

    if (options.version) {
      const filtered = new Map()
      for (const [pkg, sources] of filteredSources) {
        const matchingSources = sources.filter(source =>
          source.version && source.version.includes(options.version),
        )
        if (matchingSources.length > 0) {
          filtered.set(pkg, matchingSources)
        }
      }
      filteredSources = filtered
    }

    // Display results
    console.log(`📄 Found ${foundFiles.length} dependency files`)
    console.log(`📦 Found ${packageSources.size} unique packages\n`)

    if (options.package || options.version) {
      console.log('🔍 Filtered results:\n')
    }

    // Show package sources
    for (const [packageName, sources] of filteredSources) {
      console.log(`📦 ${packageName}`)

      // Group by version
      const versionGroups = new Map<string, string[]>()
      for (const source of sources) {
        const version = source.version || 'unspecified'
        if (!versionGroups.has(version)) {
          versionGroups.set(version, [])
        }
        versionGroups.get(version)!.push(source.file)
      }

      for (const [version, files] of versionGroups) {
        console.log(`  📌 ${version}`)
        for (const file of files) {
          console.log(`     📄 ${file}`)
        }
      }
      console.log()
    }

    // Show summary of conflicts
    const conflicts = Array.from(packageSources.entries()).filter(([_, sources]) => {
      const versions = new Set(sources.map(s => s.version).filter(Boolean))
      return versions.size > 1
    })

    if (conflicts.length > 0) {
      console.log('⚠️  Version conflicts detected:\n')
      for (const [packageName, sources] of conflicts) {
        console.log(`📦 ${packageName}`)
        const versionGroups = new Map<string, string[]>()
        for (const source of sources) {
          const version = source.version || 'unspecified'
          if (!versionGroups.has(version)) {
            versionGroups.set(version, [])
          }
          versionGroups.get(version)!.push(source.file)
        }

        for (const [version, files] of versionGroups) {
          console.log(`  ⚠️  ${version} (${files.length} files)`)
        }
        console.log()
      }
    }

    console.log('💡 Usage examples:')
    console.log('  launchpad debug:deps --package bun')
    console.log('  launchpad debug:deps --version 1.2.3')
    console.log('  launchpad debug:deps --package php --version 8.4')
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
      // Get current binary location - prioritize the installed binary over dev environment
      let currentBinaryPath: string

      // Method 1: Try 'which launchpad' first to find the actual installed binary
      try {
        const { execSync } = await import('node:child_process')
        const whichResult = execSync('which launchpad', { encoding: 'utf8', stdio: 'pipe' })
        const whichPath = whichResult.trim()

        // Use 'which' result unless it points to a development environment
        if (!whichPath.includes('/packages/') && !whichPath.includes('/dist/') && !whichPath.includes('/src/')) {
          currentBinaryPath = whichPath
        }
        else {
          // Development environment detected, look for actual installed binary
          const fs = await import('node:fs')
          const realBinaryPaths = [
            '/usr/local/bin/launchpad',
            '/usr/bin/launchpad',
            path.join(process.env.HOME || '~', '.local/bin/launchpad'),
            path.join(process.env.HOME || '~', '.bun/bin/launchpad'),
            path.join(process.env.HOME || '~', 'bin/launchpad'),
          ]

          currentBinaryPath = whichPath // fallback to 'which' result
          for (const realPath of realBinaryPaths) {
            if (fs.existsSync(realPath)) {
              // Verify it's not a symlink to development environment
              try {
                const stats = fs.lstatSync(realPath)
                if (stats.isSymbolicLink()) {
                  const linkTarget = fs.readlinkSync(realPath)
                  if (!linkTarget.includes('/packages/') && !linkTarget.includes('/dist/')) {
                    currentBinaryPath = realPath
                    break
                  }
                }
                else {
                  currentBinaryPath = realPath
                  break
                }
              }
              catch {
                // If we can't check, use it anyway
                currentBinaryPath = realPath
                break
              }
            }
          }
        }
      }
      catch {
        // Method 2: Use process.argv[1] if it points to a launchpad binary (not a test file or dev environment)
        if (process.argv[1] && process.argv[1].includes('launchpad') && !process.argv[1].includes('.test.') && !process.argv[1].includes('/test/') && !process.argv[1].includes('/packages/') && !process.argv[1].includes('/dist/')) {
          currentBinaryPath = process.argv[1]
        }
        else {
          // Method 3: Check common installation paths as fallback
          const fs = await import('node:fs')
          const commonPaths = [
            '/usr/local/bin/launchpad',
            '/usr/bin/launchpad',
            path.join(process.env.HOME || '~', '.local/bin/launchpad'),
            path.join(process.env.HOME || '~', '.bun/bin/launchpad'),
            path.join(process.env.HOME || '~', 'bin/launchpad'),
          ]

          currentBinaryPath = '/usr/local/bin/launchpad' // default fallback
          for (const commonPath of commonPaths) {
            if (fs.existsSync(commonPath)) {
              currentBinaryPath = commonPath
              break
            }
          }
        }
      }

      const targetPath = options?.target || currentBinaryPath

      if (options?.verbose) {
        console.log(`🔍 Detected current binary: ${currentBinaryPath}`)
        console.log(`🎯 Upgrade target: ${targetPath}`)
      }

      // If version is specified, use it; otherwise get latest from GitHub
      let targetVersion = options?.release

      if (!targetVersion) {
        try {
          const response = await globalThis.fetch('https://api.github.com/repos/stacksjs/launchpad/releases/latest')
          if (!response.ok) {
            throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`)
          }

          const release = await response.json() as { tag_name: string }
          targetVersion = release.tag_name
        }
        catch (error) {
          console.error('Failed to check latest version:', error instanceof Error ? error.message : String(error))
          console.log('You can specify a version manually with --release')
          process.exit(1)
        }
      }

      if (options?.verbose) {
        console.log(`📋 Current version: v${version}`)
        console.log(`📋 Target version: ${targetVersion}`)
      }

      // Check if already on target version
      if (!options?.force && targetVersion === `v${version}`) {
        console.log(`✅ You're already on the latest version of Launchpad \x1B[2m\x1B[3m(v${version})\x1B[0m`)
        if (options?.verbose) {
          console.log('💡 Use --force to reinstall the same version')
        }
        return
      }

      if (options?.verbose && targetVersion !== `v${version}`) {
        console.log(`🚀 Upgrading from v${version} to ${targetVersion}`)
      }

      // Handle dry-run mode
      if (options?.dryRun) {
        console.log('\n🔍 DRY RUN MODE - Showing what would be upgraded:\n')
        console.log(`📋 Current binary: ${currentBinaryPath}`)
        console.log(`📋 Current version: v${version}`)
        console.log(`📋 Target version: ${targetVersion}`)
        console.log(`📋 Target path: ${targetPath}`)

        if (targetVersion === `v${version}`) {
          console.log('\n✅ Already on target version - no upgrade needed')
          console.log('💡 Use --force to reinstall the same version')
        }
        else {
          console.log(`\n🚀 Would upgrade from v${version} to ${targetVersion}`)
          console.log(`📥 Would download: ${targetVersion} binary`)
          console.log(`📍 Would install to: ${targetPath}`)
          console.log('\n💡 Run without --dry-run to perform the actual upgrade')
        }
        return
      }

      // Use the same setup logic directly
      try {
        const verificationSucceeded = await performSetup({
          targetVersion,
          targetPath,
          force: true, // Always force during upgrade
          verbose: options?.verbose || false,
        })

        if (verificationSucceeded) {
          console.log(`Congrats! Launchpad was updated to ${targetVersion}`)
        }
        else {
          // Check if the binary was actually installed successfully despite verification failure
          if (fs.existsSync(targetPath)) {
            const stats = fs.statSync(targetPath)
            if (stats.size > 1000000) { // Binary is at least 1MB
              console.log(`Congrats! Launchpad was updated to ${targetVersion}`)
            }
            else {
              console.log('Upgrade completed with verification issues')
              console.log('The binary may still work, but there could be compatibility issues.')
              console.log('Try running: launchpad --version')
            }
          }
          else {
            console.log('Upgrade failed - binary not found at target location')
          }
        }
      }
      catch (error) {
        console.error('Upgrade failed:', error instanceof Error ? error.message : String(error))
        if (options?.verbose) {
          console.log('Try running the setup command manually:')
          console.log(`  launchpad setup --release ${targetVersion} --target "${targetPath}" --force`)
        }
        process.exit(1)
      }
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
  .option('--test-mode', 'Generate shellcode for testing (bypasses test environment checks)')
  .action(({ testMode }) => {
    console.log(shellcode(testMode))
  })

cli
  .command('dev [dir]', 'Set up development environment for project dependencies')
  .option('--dry-run', 'Show packages that would be installed without installing them')
  .option('--quiet', 'Suppress non-error output')
  .option('--shell', 'Output shell code for evaluation (use with eval)')
  .action(async (dir?: string, options?: { dryRun?: boolean, quiet?: boolean, shell?: boolean }) => {
    try {
      const targetDir = dir ? path.resolve(dir) : process.cwd()

      // For shell integration, force quiet mode and set environment variable
      const isShellIntegration = options?.shell || false
      if (isShellIntegration) {
        process.env.LAUNCHPAD_SHELL_INTEGRATION = '1'
      }

      await dump(targetDir, {
        dryrun: options?.dryRun || false,
        quiet: options?.quiet || isShellIntegration, // Force quiet for shell integration
        shellOutput: isShellIntegration,
        skipGlobal: process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_SKIP_GLOBAL_AUTO_SCAN === 'true', // Skip global packages only in test mode or when explicitly disabled
      })
    }
    catch (error) {
      if (!options?.quiet && !options?.shell) {
        console.error('Failed to set up dev environment:', error instanceof Error ? error.message : String(error))
      }
      else if (options?.shell) {
        // For shell mode, output robust fallback that ensures basic system tools are available
        // This prevents shell integration from hanging or failing
        console.log('# Environment setup failed, using system fallback')
        console.log('# Ensure basic system paths are available')
        console.log('for sys_path in /usr/local/bin /usr/bin /bin /usr/sbin /sbin; do')
        console.log('  if [[ -d "$sys_path" && ":$PATH:" != *":$sys_path:"* ]]; then')
        console.log('    export PATH="$PATH:$sys_path"')
        console.log('  fi')
        console.log('done')
        console.log('# Clear command hash to ensure fresh lookups')
        console.log('hash -r 2>/dev/null || true')
        return
      }
      if (!options?.shell) {
        process.exit(1)
      }
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
  .command('env:remove [hash]', 'Remove a specific development environment or all environments')
  .option('--force', 'Skip confirmation prompts')
  .option('--verbose', 'Show detailed removal information')
  .option('--all', 'Remove all development environments')
  .example('launchpad env:remove dummy_6d7cf1d6')
  .example('launchpad env:remove working-test_208a31ec --force')
  .example('launchpad env:remove --all --force')
  .action(async (hash?: string, options?: { force?: boolean, verbose?: boolean, all?: boolean }) => {
    try {
      const { removeEnvironment, removeAllEnvironments } = await import('../src/env')

      if (options?.all) {
        await removeAllEnvironments({
          force: options?.force || false,
          verbose: options?.verbose || false,
        })
      }
      else if (hash) {
        await removeEnvironment(hash, {
          force: options?.force || false,
          verbose: options?.verbose || false,
        })
      }
      else {
        console.error('Either provide a hash or use --all to remove all environments')
        console.log('\nUsage:')
        console.log('  launchpad env:remove <hash>')
        console.log('  launchpad env:remove --all')
        process.exit(1)
      }
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
  .option('--keep-global', 'Keep global dependencies (preserve packages from global deps.yaml files)')
  .example('launchpad clean --dry-run')
  .example('launchpad clean --force')
  .example('launchpad clean --keep-cache')
  .example('launchpad clean --keep-global')
  .action(async (options?: { verbose?: boolean, force?: boolean, dryRun?: boolean, keepCache?: boolean, keepGlobal?: boolean }) => {
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
        if (options?.keepGlobal) {
          console.log('')
          console.log('✅ Global dependencies will be preserved (--keep-global)')
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

      // Helper function to get global dependencies from deps.yaml files
      const getGlobalDependencies = async (): Promise<Set<string>> => {
        const globalDeps = new Set<string>()

        if (!options?.keepGlobal) {
          return globalDeps
        }

        // Common locations for global deps.yaml files
        const globalDepFiles = [
          path.join(homeDir, '.dotfiles', 'deps.yaml'),
          path.join(homeDir, '.dotfiles', 'deps.yml'),
          path.join(homeDir, '.dotfiles', 'dependencies.yaml'),
          path.join(homeDir, '.dotfiles', 'dependencies.yml'),
          path.join(homeDir, 'deps.yaml'),
          path.join(homeDir, 'deps.yml'),
          path.join(homeDir, 'dependencies.yaml'),
          path.join(homeDir, 'dependencies.yml'),
        ]

        for (const depFile of globalDepFiles) {
          if (fs.existsSync(depFile)) {
            try {
              const content = fs.readFileSync(depFile, 'utf8')

              // Try to parse as YAML using a simple parser
              const parseSimpleYaml = (content: string) => {
                const lines = content.split('\n')
                let topLevelGlobal = false
                let inDependencies = false
                let currentIndent = 0

                for (const line of lines) {
                  const trimmed = line.trim()

                  // Skip empty lines and comments
                  if (!trimmed || trimmed.startsWith('#')) {
                    continue
                  }

                  // Check for top-level global flag
                  if (trimmed.startsWith('global:')) {
                    const value = trimmed.split(':')[1]?.trim()
                    topLevelGlobal = value === 'true' || value === 'yes'
                    continue
                  }

                  // Check for dependencies section
                  if (trimmed.startsWith('dependencies:')) {
                    inDependencies = true
                    currentIndent = line.length - line.trimStart().length
                    continue
                  }

                  // If we're in dependencies section
                  if (inDependencies) {
                    const lineIndent = line.length - line.trimStart().length

                    // If we're back to the same or less indentation, we're out of dependencies
                    if (lineIndent <= currentIndent && trimmed.length > 0) {
                      inDependencies = false
                      continue
                    }

                    // Parse dependency entry
                    if (lineIndent > currentIndent && trimmed.includes(':')) {
                      const depName = trimmed.split(':')[0].trim()

                      if (depName && !depName.startsWith('#')) {
                        // Check if this is a simple string value or object
                        const colonIndex = trimmed.indexOf(':')
                        const afterColon = trimmed.substring(colonIndex + 1).trim()

                        if (afterColon && !afterColon.startsWith('{') && afterColon !== '') {
                          // Simple string format - use top-level global flag
                          if (topLevelGlobal) {
                            globalDeps.add(depName)
                          }
                        }
                        else {
                          // Object format - need to check for individual global flag
                          // Look for the global flag in subsequent lines
                          let checkingForGlobal = true
                          let foundGlobal = false

                          for (let i = lines.indexOf(line) + 1; i < lines.length && checkingForGlobal; i++) {
                            const nextLine = lines[i]
                            const nextTrimmed = nextLine.trim()
                            const nextIndent = nextLine.length - nextLine.trimStart().length

                            // If we're back to same or less indentation, stop looking
                            if (nextIndent <= lineIndent && nextTrimmed.length > 0) {
                              checkingForGlobal = false
                              break
                            }

                            // Check for global flag
                            if (nextTrimmed.startsWith('global:')) {
                              const globalValue = nextTrimmed.split(':')[1]?.trim()
                              foundGlobal = globalValue === 'true' || globalValue === 'yes'
                              checkingForGlobal = false
                            }
                          }

                          // If we found an explicit global flag, use it; otherwise use top-level
                          if (foundGlobal || (topLevelGlobal && !foundGlobal)) {
                            globalDeps.add(depName)
                          }
                        }
                      }
                    }
                  }
                }
              }

              parseSimpleYaml(content)
            }
            catch (error) {
              if (options?.verbose) {
                console.log(`⚠️  Could not parse ${depFile}: ${error instanceof Error ? error.message : String(error)}`)
              }
            }
          }
        }

        return globalDeps
      }

      // Get global dependencies
      const globalDeps = await getGlobalDependencies()

      // Helper function to get all Launchpad-managed binaries from package metadata
      const getLaunchpadBinaries = (): Array<{ binary: string, package: string, fullPath: string }> => {
        const binaries: Array<{ binary: string, package: string, fullPath: string }> = []
        const pkgsDir = path.join(installPrefix, 'pkgs')
        const binDir = path.join(installPrefix, 'bin')

        // Method 1: Use metadata if available
        if (fs.existsSync(pkgsDir)) {
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
                          // Skip global dependencies if --keep-global is enabled
                          if (options?.keepGlobal && globalDeps.has(domain.name)) {
                            continue
                          }

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
        }

        // Method 2: Additional scan - always check bin directory for any remaining Launchpad shims
        if (fs.existsSync(binDir)) {
          try {
            const binFiles = fs.readdirSync(binDir, { withFileTypes: true })
              .filter(dirent => dirent.isFile())

            for (const file of binFiles) {
              const filePath = path.join(binDir, file.name)
              try {
                // Read first few lines to check if it's a Launchpad shim
                const content = fs.readFileSync(filePath, 'utf8')
                if (content.includes('Launchpad shim')) {
                  // Check if we already have this binary from metadata
                  const alreadyTracked = binaries.some(b => b.binary === file.name)
                  if (!alreadyTracked) {
                    binaries.push({
                      binary: file.name,
                      package: 'unknown', // We don't have metadata, so package is unknown
                      fullPath: filePath,
                    })
                  }
                }
              }
              catch {
                // Ignore files we can't read
              }
            }
          }
          catch {
            // Ignore errors reading bin directory
          }
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
          // Skip global dependencies if --keep-global is enabled
          if (options?.keepGlobal && globalDeps.has(domain.name)) {
            if (options?.verbose) {
              console.log(`Skipping global dependency: ${domain.name}`)
            }
            continue
          }

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

          // Show preserved global dependencies
          if (options?.keepGlobal && globalDeps.size > 0) {
            console.log('')
            console.log('✅ Global dependencies that would be preserved:')
            Array.from(globalDeps).sort().forEach((dep) => {
              console.log(`   • ${dep}`)
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

        if (options?.keepGlobal && globalDeps.size > 0) {
          console.log('')
          console.log('✅ Global dependencies were preserved:')
          Array.from(globalDeps).sort().forEach((dep) => {
            console.log(`   • ${dep}`)
          })
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

// Service management commands

// Start service command
cli
  .command('start <service>', 'Start a service')
  .option('--verbose', 'Enable verbose output')
  .example('launchpad start postgres')
  .example('launchpad start redis')
  .example('launchpad start nginx')
  .action(async (serviceName: string, options?: { verbose?: boolean }) => {
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const { startService } = await import('../src/services')
      const success = await startService(serviceName)

      if (!success) {
        process.exit(1)
      }
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
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const { stopService } = await import('../src/services')
      const success = await stopService(serviceName)

      if (!success) {
        process.exit(1)
      }
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
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const { restartService } = await import('../src/services')
      const success = await restartService(serviceName)

      if (!success) {
        process.exit(1)
      }
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
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const { enableService } = await import('../src/services')
      const success = await enableService(serviceName)

      if (!success) {
        process.exit(1)
      }
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
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const { disableService } = await import('../src/services')
      const success = await disableService(serviceName)

      if (!success) {
        process.exit(1)
      }
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
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const { getServiceStatus, listServices, getAllServiceDefinitions } = await import('../src/services')

      if (serviceName) {
        // Show status for specific service
        const status = await getServiceStatus(serviceName)
        const format = options?.format || 'simple'

        if (format === 'json') {
          console.log(JSON.stringify({ service: serviceName, status }, null, 2))
        }
        else {
          const statusEmoji = {
            running: '🟢',
            stopped: '🔴',
            starting: '🟡',
            stopping: '🟡',
            failed: '🔴',
            unknown: '⚪',
          }[status]

          console.log(`${statusEmoji} ${serviceName}: ${status}`)
        }
      }
      else {
        // Show status for all services
        const services = await listServices()
        const format = options?.format || 'table'

        if (format === 'json') {
          const result = services.map(service => ({
            name: service.definition.name,
            displayName: service.definition.displayName,
            status: service.status,
            enabled: service.enabled,
            pid: service.pid,
            startedAt: service.startedAt,
            port: service.definition.port,
          }))
          console.log(JSON.stringify(result, null, 2))
        }
        else if (format === 'simple') {
          if (services.length === 0) {
            console.log('No services found')
          }
          else {
            services.forEach((service) => {
              const statusEmoji = {
                running: '🟢',
                stopped: '🔴',
                starting: '🟡',
                stopping: '🟡',
                failed: '🔴',
                unknown: '⚪',
              }[service.status]

              console.log(`${statusEmoji} ${service.definition.name}: ${service.status}`)
            })
          }
        }
        else {
          // Table format
          if (services.length === 0) {
            console.log('No services found')
            console.log('')
            console.log('Available services:')
            const definitions = getAllServiceDefinitions()
            definitions.forEach((def) => {
              console.log(`  ${def.name.padEnd(12)} ${def.displayName}`)
            })
          }
          else {
            console.log('Service Status:')
            console.log('')
            console.log(`${'Name'.padEnd(12) + 'Status'.padEnd(12) + 'Enabled'.padEnd(10) + 'PID'.padEnd(8) + 'Port'.padEnd(8)}Description`)
            console.log('─'.repeat(70))

            services.forEach((service) => {
              const statusEmoji = {
                running: '🟢',
                stopped: '🔴',
                starting: '🟡',
                stopping: '🟡',
                failed: '🔴',
                unknown: '⚪',
              }[service.status]

              const name = service.definition.name.padEnd(12)
              const status = `${statusEmoji} ${service.status}`.padEnd(12)
              const enabled = (service.enabled ? '✅' : '❌').padEnd(10)
              const pid = (service.pid ? String(service.pid) : '-').padEnd(8)
              const port = (service.definition.port ? String(service.definition.port) : '-').padEnd(8)
              const description = service.definition.description

              console.log(`${name}${status}${enabled}${pid}${port}${description}`)
            })
          }
        }
      }
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
    if (options?.verbose) {
      config.verbose = true
    }

    try {
      const { listServices, getAllServiceDefinitions } = await import('../src/services')

      const services = await listServices()
      const format = options?.format || 'table'

      if (format === 'json') {
        const result = services.map(service => ({
          name: service.definition.name,
          displayName: service.definition.displayName,
          status: service.status,
          enabled: service.enabled,
          pid: service.pid,
          startedAt: service.startedAt,
          port: service.definition.port,
        }))
        console.log(JSON.stringify(result, null, 2))
      }
      else if (format === 'simple') {
        if (services.length === 0) {
          console.log('No services found')
        }
        else {
          services.forEach((service) => {
            const statusEmoji = {
              running: '🟢',
              stopped: '🔴',
              starting: '🟡',
              stopping: '🟡',
              failed: '🔴',
              unknown: '⚪',
            }[service.status]

            console.log(`${statusEmoji} ${service.definition.name}: ${service.status}`)
          })
        }
      }
      else {
        // Table format
        if (services.length === 0) {
          console.log('📋 Service Status: No active services')
          console.log('')
          console.log('🔍 Available services:')
          const definitions = getAllServiceDefinitions()
          definitions.forEach((def) => {
            console.log(`  ${def.name.padEnd(12)} ${def.displayName} - ${def.description}`)
          })
          console.log('')
          console.log('💡 Use "launchpad start <service>" to start a service')
          console.log('💡 Use "launchpad enable <service>" to enable auto-start on boot')
        }
        else {
          console.log('📋 Service Status:')
          console.log('')
          console.log(`${'Name'.padEnd(12) + 'Status'.padEnd(12) + 'Auto-Start'.padEnd(12) + 'PID'.padEnd(8) + 'Port'.padEnd(8)}Description`)
          console.log('─'.repeat(80))

          services.forEach((service) => {
            const statusEmoji = {
              running: '🟢',
              stopped: '🔴',
              starting: '🟡',
              stopping: '🟡',
              failed: '🔴',
              unknown: '⚪',
            }[service.status]

            const name = service.definition.name.padEnd(12)
            const status = `${statusEmoji} ${service.status}`.padEnd(12)
            const enabled = (service.enabled ? '✅ Yes' : '❌ No').padEnd(12)
            const pid = (service.pid ? String(service.pid) : '-').padEnd(8)
            const port = (service.definition.port ? String(service.definition.port) : '-').padEnd(8)
            const description = service.definition.description

            console.log(`${name}${status}${enabled}${pid}${port}${description}`)
          })
        }
      }
    }
    catch (error) {
      console.error('Failed to list services:', error instanceof Error ? error.message : String(error))
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
