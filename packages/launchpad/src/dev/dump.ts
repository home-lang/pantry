/* eslint-disable no-console */
import crypto from 'node:crypto'
import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from '../config'
import { DEPENDENCY_FILE_NAMES, findDependencyFile } from '../env'
import { cleanupSpinner, install } from '../install'

// Utility functions
function generateProjectHash(projectPath: string): string {
  // Generate a simple hash based on the project path
  const hash = crypto.createHash('md5').update(projectPath).digest('hex')
  const projectName = path.basename(projectPath)
  return `${projectName}_${hash.slice(0, 8)}`
}

export interface DumpOptions {
  dryrun?: boolean
  quiet?: boolean
  shellOutput?: boolean
}

// Cache for environment readiness to avoid repeated filesystem calls
const envReadinessCache = new Map<string, { ready: boolean, timestamp: number, envDir?: string, sniffResult?: any }>()
const CACHE_TTL = 30000 // 30 seconds

/**
 * Check if a version satisfies a constraint
 */
async function checkVersionSatisfiesConstraint(version: string, constraint: string): Promise<boolean> {
  // Simple constraints
  if (constraint === '*' || constraint === 'latest') {
    return true
  }

  try {
    // Use Bun's built-in semver if available
    if (typeof Bun !== 'undefined' && Bun.semver) {
      return Bun.semver.satisfies(version, constraint)
    }

    // Fallback: basic constraint checking for caret constraints
    if (constraint.startsWith('^')) {
      const constraintVersion = constraint.slice(1)
      const [constraintMajor, constraintMinor = 0, constraintPatch = 0] = constraintVersion.split('.').map(v => Number.parseInt(v, 10))
      const [versionMajor, versionMinor = 0, versionPatch = 0] = version.split('.').map(v => Number.parseInt(v, 10))

      // Caret constraint: same major, version >= constraint
      if (versionMajor === constraintMajor) {
        if (versionMinor > constraintMinor)
          return true
        if (versionMinor === constraintMinor && versionPatch >= constraintPatch)
          return true
      }
      return false
    }

    // Exact version
    return version === constraint
  }
  catch {
    return false
  }
}

/**
 * Enhanced constraint satisfaction check across multiple environments
 */
async function checkConstraintSatisfaction(
  envDir: string,
  packages: Array<{ project: string, constraint: string }>,
  envType: 'local' | 'global' = 'local',
): Promise<{ satisfied: boolean, missingPackages: Array<{ project: string, constraint: string }> }> {
  try {
    const { list } = await import('../list')
    const { spawnSync } = await import('node:child_process')
    const missingPackages: Array<{ project: string, constraint: string }> = []

    // Build list of directories to check (prioritize by environment type)
    const dirsToCheck: string[] = [envDir]

    if (envType === 'local') {
      // For local environment, also check global environment
      const globalEnvDir = path.join(homedir(), '.local', 'share', 'launchpad', 'global')
      if (fs.existsSync(globalEnvDir)) {
        dirsToCheck.push(globalEnvDir)
      }
    }

    for (const requiredPkg of packages) {
      const { project, constraint } = requiredPkg

      let satisfied = false
      let foundVersion = ''
      let foundSource = ''

      // Check all environment directories for this package
      for (const checkDir of dirsToCheck) {
        if (fs.existsSync(checkDir)) {
          const installedPackages = await list(checkDir)
          const installedPkg = installedPackages.find(pkg =>
            pkg.project === project || pkg.project.includes(project.split('.')[0]),
          )

          if (installedPkg) {
            const installedVersion = installedPkg.version.toString()
            const satisfiesConstraint = await checkVersionSatisfiesConstraint(installedVersion, constraint)
            if (satisfiesConstraint) {
              satisfied = true
              foundVersion = installedVersion
              foundSource = checkDir === envDir ? envType : 'global'
              break
            }
          }
        }
      }

      // Check system PATH for special cases like bun
      if (!satisfied && project === 'bun.sh') {
        try {
          const result = spawnSync('bun', ['--version'], { encoding: 'utf8', timeout: 5000 })
          if (result.status === 0 && result.stdout) {
            const systemVersion = result.stdout.trim()
            const satisfiesConstraint = await checkVersionSatisfiesConstraint(systemVersion, constraint)
            if (satisfiesConstraint) {
              satisfied = true
              foundVersion = systemVersion
              foundSource = 'system'
            }
          }
        }
        catch {
          // Ignore system check failures
        }
      }

      if (satisfied) {
        if (config.verbose) {
          console.warn(`✅ ${project}@${foundVersion} (${foundSource}) satisfies ${constraint}`)
        }
      }
      else {
        if (config.verbose) {
          console.warn(`❌ ${project}@${constraint} not satisfied by any installation`)
        }
        missingPackages.push(requiredPkg)
      }
    }

    const allSatisfied = missingPackages.length === 0

    if (config.verbose && packages.length > 0) {
      console.warn(`${envType} environment constraint check: ${allSatisfied ? 'all constraints satisfied' : `${missingPackages.length}/${packages.length} packages need installation/update`}`)
    }

    return { satisfied: allSatisfied, missingPackages }
  }
  catch (error) {
    if (config.verbose) {
      console.warn(`Failed to check ${envType} environment constraints: ${error}`)
    }
    return { satisfied: false, missingPackages: packages }
  }
}

/**
 * Enhanced environment readiness check with constraint validation
 */
async function isEnvironmentReady(
  projectHash: string,
  envDir: string,
  packages?: Array<{ project: string, constraint: string }>,
  envType: 'local' | 'global' = 'local',
): Promise<{ ready: boolean, sniffResult?: any, missingPackages?: Array<{ project: string, constraint: string }> }> {
  const cacheKey = `${projectHash}_${envType}_${packages?.length || 0}`
  const cached = envReadinessCache.get(cacheKey)
  const now = Date.now()

  // Return cached result if still valid and we have packages to check
  if (cached && (now - cached.timestamp) < CACHE_TTL && packages) {
    return { ready: cached.ready, sniffResult: cached.sniffResult }
  }

  // Check if environment has binaries (basic check)
  const envBinPath = path.join(envDir, 'bin')
  const envSbinPath = path.join(envDir, 'sbin')

  const hasBinaries = (fs.existsSync(envBinPath) && fs.readdirSync(envBinPath).length > 0)
    || (fs.existsSync(envSbinPath) && fs.readdirSync(envSbinPath).length > 0)

  // If no packages specified, use basic check
  if (!packages) {
    const result = { ready: hasBinaries }
    envReadinessCache.set(cacheKey, {
      ready: hasBinaries,
      timestamp: now,
      envDir: hasBinaries ? envDir : undefined,
    })
    return result
  }

  // If local environment doesn't exist but we have packages to check,
  // still proceed with constraint checking (might be satisfied by global/system)

  // Enhanced check: validate constraints
  const constraintCheck = await checkConstraintSatisfaction(envDir, packages, envType)
  // Environment is ready if constraints are satisfied (regardless of local binaries)
  // OR if local binaries exist and no constraints specified
  const ready = constraintCheck.satisfied || (hasBinaries && packages.length === 0)

  // Cache the result
  envReadinessCache.set(cacheKey, {
    ready,
    timestamp: now,
    envDir: ready ? envDir : undefined,
  })

  return {
    ready,
    missingPackages: constraintCheck.missingPackages,
  }
}

function cacheSniffResult(projectHash: string, sniffResult: any): void {
  const cached = envReadinessCache.get(projectHash)
  if (cached) {
    cached.sniffResult = sniffResult
    cached.timestamp = Date.now() // Refresh timestamp
  }
}

export async function dump(dir: string, options: DumpOptions = {}): Promise<void> {
  const { dryrun = false, quiet = false, shellOutput = false } = options

  try {
    // Find dependency file
    const dependencyFile = findDependencyFile(dir)
    if (!dependencyFile) {
      if (!quiet && !shellOutput) {
        console.log('No dependency file found')
      }
      return
    }

    // Parse dependency file and separate global vs local dependencies
    const projectDir = path.dirname(dependencyFile)
    const { default: sniff } = await import('./sniff')
    const sniffResult = await sniff({ string: projectDir })

    // Separate global and local packages
    const globalPackages: string[] = []
    const localPackages: string[] = []

    for (const pkg of sniffResult.pkgs) {
      // Enhanced constraint handling to prevent [object Object] errors
      let constraintStr = ''

      if (pkg.constraint) {
        if (typeof pkg.constraint === 'string') {
          constraintStr = pkg.constraint
        }
        else if (pkg.constraint && typeof pkg.constraint.toString === 'function') {
          constraintStr = pkg.constraint.toString()
        }
        else if (pkg.constraint && typeof pkg.constraint === 'object') {
          // Handle SemverRange objects specifically
          constraintStr = String(pkg.constraint)
        }
        else {
          constraintStr = String(pkg.constraint)
        }
      }
      else {
        constraintStr = '*'
      }

      // Ensure we never have [object Object] in the constraint
      if (constraintStr === '[object Object]') {
        constraintStr = '*'
      }

      const packageString = `${pkg.project}@${constraintStr}`

      // Check if this is a global dependency
      if (pkg.global) {
        globalPackages.push(packageString)
      }
      else {
        localPackages.push(packageString)
      }
    }

    // For mixed installations, handle global and local separately
    if (globalPackages.length > 0 && localPackages.length > 0) {
      if (!quiet && !shellOutput) {
        console.log(`Global packages: ${globalPackages.join(', ')}`)
        console.log(`Local packages: ${localPackages.join(', ')}`)
      }
    }
    else if (globalPackages.length > 0) {
      if (!quiet && !shellOutput) {
        console.log(`Global packages: ${globalPackages.join(', ')}`)
      }
    }
    else if (localPackages.length > 0) {
      if (!quiet && !shellOutput) {
        console.log(`Local packages: ${localPackages.join(', ')}`)
      }
    }

    if (globalPackages.length === 0 && localPackages.length === 0) {
      if (!quiet && !shellOutput) {
        console.log('No packages found in dependency file')
      }
      return
    }

    // Set up project-specific environment for local packages
    const projectHash = generateProjectHash(dir)
    const envDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', projectHash)
    const envBinPath = path.join(envDir, 'bin')
    const envSbinPath = path.join(envDir, 'sbin')

    // Set up stable global environment for global packages
    const globalEnvDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'global')
    const globalBinPath = path.join(globalEnvDir, 'bin')
    const globalSbinPath = path.join(globalEnvDir, 'sbin')

    // Parse packages for constraint checking
    const localPackageConstraints = localPackages.map((pkg) => {
      const [project, constraint] = pkg.split('@')
      return { project, constraint: constraint || '*' }
    })
    const globalPackageConstraints = globalPackages.map((pkg) => {
      const [project, constraint] = pkg.split('@')
      return { project, constraint: constraint || '*' }
    })

    // Debug logging
    if (config.verbose) {
      console.warn(`Checking constraints for ${localPackageConstraints.length} local packages and ${globalPackageConstraints.length} global packages`)
      localPackageConstraints.forEach(pkg => console.warn(`Local package: ${pkg.project}@${pkg.constraint}`))
    }

    // Check environment readiness with constraint validation
    const localReadyResult = localPackages.length === 0 ? { ready: true } : await isEnvironmentReady(projectHash, envDir, localPackageConstraints, 'local')

    const globalReadyResult = globalPackages.length === 0 ? { ready: true } : await isEnvironmentReady('global', globalEnvDir, globalPackageConstraints, 'global')

    const localReady = localReadyResult.ready
    const globalReady = globalReadyResult.ready

    if (config.verbose) {
      console.warn(`Environment readiness - local: ${localReady}, global: ${globalReady}`)
    }

    // Handle dry run after constraint checking
    if (dryrun) {
      if (!quiet && !shellOutput) {
        if (globalPackages.length > 0) {
          const globalStatus = globalReady ? 'satisfied by existing installations' : 'would install globally'
          console.log(`Global packages: ${globalPackages.join(', ')} (${globalStatus})`)
        }
        if (localPackages.length > 0) {
          const localStatus = localReady ? 'satisfied by existing installations' : 'would install locally'
          console.log(`Local packages: ${localPackages.join(', ')} (${localStatus})`)
        }
      }
      return
    }

    // For shell output mode with ready environments, output immediately
    if (shellOutput && localReady && globalReady) {
      outputShellCode(dir, envBinPath, envSbinPath, projectHash, sniffResult, globalBinPath, globalSbinPath)
      return
    }

    const results: string[] = []

    // Install global packages first to stable location
    if (globalPackages.length > 0 && !globalReady) {
      const originalVerbose = config.verbose
      const originalShowShellMessages = config.showShellMessages

      if (shellOutput) {
        config.showShellMessages = false
        process.stderr.write(`🌍 Installing global dependencies...\n`)
      }
      else if (!quiet) {
        console.log(`🌍 Installing ${globalPackages.length} global packages...`)
      }

      try {
        // Install global packages to the stable global environment
        const globalResults = await install(globalPackages, globalEnvDir)
        results.push(...globalResults)

        // Create or update global stubs in system locations (/usr/local/bin)
        await createGlobalStubs(globalEnvDir, globalPackages)

        if (shellOutput) {
          process.stderr.write(`✅ Global dependencies installed\n`)
        }
      }
      catch (error) {
        if (shellOutput) {
          process.stderr.write(`❌ Failed to install global packages: ${error instanceof Error ? error.message : String(error)}\n`)
        }
        else {
          console.error(`Failed to install global packages: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      config.verbose = originalVerbose
      config.showShellMessages = originalShowShellMessages
    }

    // Install local packages to project-specific environment
    if (localPackages.length > 0 && !localReady) {
      const originalVerbose = config.verbose
      const originalShowShellMessages = config.showShellMessages

      if (shellOutput) {
        config.showShellMessages = false
        const projectName = path.basename(dir)
        const startTime = Date.now()
        process.stderr.write(`🔧 Setting up project environment for ${projectName}...\n`)

        // Set up progress tracking for shell mode
        const originalStdoutWrite = process.stdout.write.bind(process.stdout)
        const originalConsoleLog = console.log.bind(console)
        const originalConsoleWarn = console.warn.bind(console)

        // Redirect output to stderr for progress display
        process.stdout.write = (chunk: any, encoding?: any, cb?: any) => {
          return process.stderr.write(chunk, encoding, cb)
        }

        console.log = (...args: any[]) => {
          const message = args.join(' ')
          if (message.includes('✅') || message.includes('⬇️') || message.includes(' bytes ') || message.includes('%') || message.includes('🔍')) {
            process.stderr.write(`${message}\n`)
          }
        }

        console.warn = (...args: any[]) => {
          process.stderr.write(`${args.join(' ')}\n`)
        }

        try {
          const localResults = await install(localPackages, envDir)
          results.push(...localResults)

          cleanupSpinner()
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
          process.stderr.write(`✅ Project environment activated for ${projectName} \x1B[2m\x1B[3m(${elapsed}s)\x1B[0m\n`)

          if (process.stderr.isTTY) {
            try {
              fs.writeSync(process.stderr.fd, '')
            }
            catch {
              // Ignore flush errors
            }
          }
        }
        catch (error) {
          process.stderr.write(`❌ Failed to install local packages: ${error instanceof Error ? error.message : String(error)}\n`)
        }
        finally {
          // Restore original stdout and console methods
          process.stdout.write = originalStdoutWrite
          console.log = originalConsoleLog
          console.warn = originalConsoleWarn
        }
      }
      else {
        if (!quiet) {
          console.log(`🔧 Setting up project environment for ${localPackages.length} packages...`)
        }
        const localResults = await install(localPackages, envDir)
        results.push(...localResults)
      }

      config.verbose = originalVerbose
      config.showShellMessages = originalShowShellMessages
    }

    // Cache the sniff result for future use
    cacheSniffResult(projectHash, sniffResult)

    if (shellOutput) {
      outputShellCode(dir, envBinPath, envSbinPath, projectHash, sniffResult, globalBinPath, globalSbinPath)
    }
    else if (!quiet) {
      if (results.length > 0) {
        console.log(`✅ Successfully set up environment with ${localPackages.length + globalPackages.length} packages`)
        console.log(`Environment directory: ${envDir}`)
        if (globalPackages.length > 0) {
          console.log(`🌍 Global environment: ${globalEnvDir}`)
        }
        console.log(`Installed ${results.length} binaries:`)
        results.forEach((file) => {
          console.log(`  ${file}`)
        })
      }
      else {
        console.log('⚠️  No binaries were installed')
      }

      // Output environment variables if any exist
      const envVars = Object.entries(sniffResult.env || {})
      if (envVars.length > 0) {
        console.log(`Environment variables:`)
        envVars.forEach(([key, value]) => {
          console.log(`  ${key}=${value}`)
        })
      }
    }
  }
  catch (error) {
    if (shellOutput) {
      // For shell mode, don't throw errors - just output empty result
      process.stderr.write(`Error: ${error instanceof Error ? error.message : String(error)}\n`)
      return
    }
    throw error
  }
}

/**
 * Create stable global stubs in system locations that point to the global environment
 */
async function createGlobalStubs(globalEnvDir: string, globalPackages: string[]): Promise<void> {
  const globalBinDir = path.join(globalEnvDir, 'bin')
  const globalSbinDir = path.join(globalEnvDir, 'sbin')
  const systemBinDir = '/usr/local/bin'

  // Ensure system bin directory exists and is writable
  try {
    if (!fs.existsSync(systemBinDir)) {
      fs.mkdirSync(systemBinDir, { recursive: true })
    }
  }
  catch (error) {
    if (config.verbose) {
      console.warn(`Warning: Cannot create ${systemBinDir}: ${error instanceof Error ? error.message : String(error)}`)
    }
    return
  }

  // Find all binaries in the global environment
  const binaryDirs = [
    { sourceDir: globalBinDir, targetDir: systemBinDir },
    { sourceDir: globalSbinDir, targetDir: systemBinDir },
  ]

  for (const { sourceDir, targetDir } of binaryDirs) {
    if (!fs.existsSync(sourceDir)) {
      continue
    }

    try {
      const binaries = fs.readdirSync(sourceDir)

      for (const binary of binaries) {
        const sourcePath = path.join(sourceDir, binary)
        const targetPath = path.join(targetDir, binary)

        // Check if it's an executable file
        const stat = fs.statSync(sourcePath)
        if (stat.isFile() && (stat.mode & 0o111)) {
          // Create a robust stub that handles missing paths gracefully
          const stubContent = createRobustGlobalStub(binary, sourcePath, globalPackages)

          try {
            fs.writeFileSync(targetPath, stubContent)
            fs.chmodSync(targetPath, 0o755)

            if (config.verbose) {
              console.warn(`Created global stub: ${binary} -> ${sourcePath}`)
            }
          }
          catch (error) {
            if (config.verbose) {
              console.warn(`Warning: Failed to create global stub for ${binary}: ${error instanceof Error ? error.message : String(error)}`)
            }
          }
        }
      }
    }
    catch (error) {
      if (config.verbose) {
        console.warn(`Warning: Failed to read ${sourceDir}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }
}

/**
 * Create robust global stub content that handles missing paths gracefully
 */
function createRobustGlobalStub(binaryName: string, globalBinaryPath: string, globalPackages: string[]): string {
  // Determine which package this binary belongs to
  const packageName = globalPackages.find((pkg) => {
    const [name] = pkg.split('@')
    return binaryName.includes(name.split('.').pop() || '') || name.includes(binaryName)
  }) || globalPackages[0] || 'unknown'

  return `#!/bin/sh
# Global Launchpad stub for ${binaryName} (${packageName})
# This stub is stable and survives environment rebuilds

# First try the current global installation path
if [ -x "${globalBinaryPath}" ]; then
  exec "${globalBinaryPath}" "$@"
fi

# If the direct path doesn't work, try to find the binary in the global environment
GLOBAL_ENV_DIR="${path.dirname(path.dirname(globalBinaryPath))}"
if [ -d "$GLOBAL_ENV_DIR" ]; then
  # Try both bin and sbin directories
  for bin_dir in "$GLOBAL_ENV_DIR/bin" "$GLOBAL_ENV_DIR/sbin"; do
    if [ -x "$bin_dir/${binaryName}" ]; then
      exec "$bin_dir/${binaryName}" "$@"
    fi
  done
fi

# If global environment is missing, try to reinstall it
if command -v launchpad >/dev/null 2>&1; then
  echo "⚠️  Global environment missing, attempting to reinstall..." >&2
  if launchpad dev ~/.dotfiles >/dev/null 2>&1; then
    # Try again after reinstall
    if [ -x "${globalBinaryPath}" ]; then
      exec "${globalBinaryPath}" "$@"
    fi
  fi
fi

# Final fallback to system command if available
if command -v "${binaryName}" >/dev/null 2>&1 && [ "$(command -v "${binaryName}")" != "$0" ]; then
  echo "⚠️  Using system version of ${binaryName}..." >&2
  exec "$(command -v "${binaryName}")" "$@"
fi

# If all else fails, provide helpful error message
echo "❌ ${binaryName} not found. Please run: launchpad dev ~/.dotfiles" >&2
echo "   This will reinstall global dependencies including ${binaryName}" >&2
exit 127
`
}

function outputShellCode(dir: string, envBinPath: string, envSbinPath: string, projectHash: string, sniffResult?: any, globalBinPath?: string, globalSbinPath?: string): void {
  // Output shell code directly without extra newlines
  process.stdout.write(`# Launchpad environment setup for ${dir}\n`)
  process.stdout.write(`if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" ]]; then\n`)
  process.stdout.write(`  export LAUNCHPAD_ORIGINAL_PATH="$PATH"\n`)
  process.stdout.write(`fi\n`)
  process.stdout.write(`# Ensure we have basic system paths if LAUNCHPAD_ORIGINAL_PATH is empty\n`)
  process.stdout.write(`if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" ]]; then\n`)
  process.stdout.write(`  export LAUNCHPAD_ORIGINAL_PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"\n`)
  process.stdout.write(`fi\n`)

  // Build PATH with both project and global environments
  const pathComponents = []

  // Add project-specific paths first (highest priority)
  if (fs.existsSync(envBinPath)) {
    pathComponents.push(envBinPath)
  }
  if (fs.existsSync(envSbinPath)) {
    pathComponents.push(envSbinPath)
  }

  // Add global paths if they exist
  if (globalBinPath && fs.existsSync(globalBinPath)) {
    pathComponents.push(globalBinPath)
  }
  if (globalSbinPath && fs.existsSync(globalSbinPath)) {
    pathComponents.push(globalSbinPath)
  }

  // Add original PATH
  pathComponents.push('$LAUNCHPAD_ORIGINAL_PATH')

  process.stdout.write(`export PATH="${pathComponents.join(':')}"\n`)
  process.stdout.write(`export LAUNCHPAD_ENV_BIN_PATH="${envBinPath}"\n`)
  process.stdout.write(`export LAUNCHPAD_PROJECT_DIR="${dir}"\n`)
  process.stdout.write(`export LAUNCHPAD_PROJECT_HASH="${projectHash}"\n`)

  // Export environment variables from the dependency file
  if (sniffResult && sniffResult.env) {
    for (const [key, value] of Object.entries(sniffResult.env)) {
      process.stdout.write(`export ${key}=${value}\n`)
    }
  }

  // Generate the deactivation function that the test expects
  process.stdout.write(`\n# Deactivation function for directory checking\n`)
  process.stdout.write(`_pkgx_dev_try_bye() {\n`)
  process.stdout.write(`  case "$PWD" in\n`)
  process.stdout.write(`    "${dir}"*)\n`)
  process.stdout.write(`      # Still in project directory, don't deactivate\n`)
  process.stdout.write(`      return 0\n`)
  process.stdout.write(`      ;;\n`)
  process.stdout.write(`    *)\n`)
  process.stdout.write(`      # Left project directory, deactivate\n`)
  process.stdout.write(`      if [[ -n "$LAUNCHPAD_ORIGINAL_PATH" ]]; then\n`)
  process.stdout.write(`        export PATH="$LAUNCHPAD_ORIGINAL_PATH"\n`)
  process.stdout.write(`      fi\n`)
  process.stdout.write(`      unset LAUNCHPAD_ENV_BIN_PATH\n`)
  process.stdout.write(`      unset LAUNCHPAD_PROJECT_DIR\n`)
  process.stdout.write(`      unset LAUNCHPAD_PROJECT_HASH\n`)
  process.stdout.write(`      echo "dev environment deactivated"\n`)
  process.stdout.write(`      ;;\n`)
  process.stdout.write(`  esac\n`)
  process.stdout.write(`}\n`)
}
