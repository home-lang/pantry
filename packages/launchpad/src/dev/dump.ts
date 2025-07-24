/* eslint-disable no-console */
import crypto from 'node:crypto'
import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { parse } from 'yaml'
import { config } from '../config'
import { findDependencyFile } from '../env'
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
  skipGlobal?: boolean // Skip global package processing for testing
}

// Cache for environment readiness to avoid repeated filesystem calls
const envReadinessCache = new Map<string, { ready: boolean, timestamp: number, envDir?: string, sniffResult?: any }>()

/**
 * Check if a version satisfies a constraint with enhanced update detection
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

    // Fallback: enhanced constraint checking
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
 * Check if a package needs update by comparing with latest available version
 */
async function shouldUpdatePackage(project: string, currentVersion: string, constraint: string): Promise<boolean> {
  // Don't update if constraint is satisfied and is exact version
  if (!/[\^~*]/.test(constraint) && currentVersion === constraint) {
    return false
  }

  try {
    // Get latest version from the package registry
    const { getLatestVersion } = await import('../install')
    const latestVersion = getLatestVersion(project)

    if (!latestVersion) {
      return false
    }

    // Convert to string to handle Version objects
    const latestVersionStr = typeof latestVersion === 'string' ? latestVersion : String(latestVersion)

    // Use Bun's semver to compare versions
    if (typeof Bun !== 'undefined' && Bun.semver) {
      // Check if latest version is newer than current
      const isNewer = Bun.semver.order(latestVersionStr, currentVersion) > 0
      // Check if latest version satisfies the constraint
      const satisfiesConstraint = Bun.semver.satisfies(latestVersionStr, constraint)

      return isNewer && satisfiesConstraint
    }

    // Fallback comparison
    return latestVersionStr !== currentVersion
  }
  catch {
    return false
  }
}

/**
 * Check if packages are satisfied specifically within a single environment directory
 * (doesn't check system binaries or other environments)
 */
async function checkEnvironmentSpecificSatisfaction(
  envDir: string,
  packages: Array<{ project: string, constraint: string }>,
): Promise<boolean> {
  if (!fs.existsSync(envDir) || packages.length === 0) {
    return packages.length === 0 // True if no packages required, false if env doesn't exist
  }

  try {
    const { list } = await import('../list')
    const installedPackages = await list(envDir)

    for (const requiredPkg of packages) {
      const { project, constraint } = requiredPkg

      const installedPkg = installedPackages.find(pkg =>
        pkg.project === project || pkg.project.includes(project.split('.')[0]),
      )

      if (!installedPkg) {
        return false // Package not found in this environment
      }

      const installedVersion = installedPkg.version.toString()
      const satisfiesConstraint = await checkVersionSatisfiesConstraint(installedVersion, constraint)

      if (!satisfiesConstraint) {
        return false // Package exists but doesn't satisfy constraint
      }
    }

    return true // All packages found and satisfy constraints
  }
  catch {
    return false
  }
}

/**
 * Enhanced constraint satisfaction check with update detection across multiple environments
 */
async function checkConstraintSatisfaction(
  envDir: string,
  packages: Array<{ project: string, constraint: string }>,
  envType: 'local' | 'global' = 'local',
): Promise<{ satisfied: boolean, missingPackages: Array<{ project: string, constraint: string }>, outdatedPackages: Array<{ project: string, constraint: string, currentVersion: string }> }> {
  try {
    const { list } = await import('../list')
    const { spawnSync } = await import('node:child_process')
    const missingPackages: Array<{ project: string, constraint: string }> = []
    const outdatedPackages: Array<{ project: string, constraint: string, currentVersion: string }> = []

    // Build list of directories to check (prioritize by environment type)
    const dirsToCheck: string[] = [envDir]

    // Always check global environment for global packages or as fallback
    const globalEnvDir = path.join(homedir(), '.local', 'share', 'launchpad', 'global')
    if (envType === 'global' || fs.existsSync(globalEnvDir)) {
      if (!dirsToCheck.includes(globalEnvDir)) {
        dirsToCheck.push(globalEnvDir)
      }
    }

    // Also check for global dependencies in ~/.dotfiles and other common locations
    const globalDepsDirs = [
      path.join(homedir(), '.dotfiles'),
      path.join(homedir()),
    ]

    for (const globalDepsDir of globalDepsDirs) {
      if (fs.existsSync(globalDepsDir)) {
        const { default: sniff } = await import('./sniff')
        try {
          const globalSniffResult = await sniff({ string: globalDepsDir })
          const globalDependencies = globalSniffResult.pkgs.filter(pkg => pkg.global)

          if (globalDependencies.length > 0 && config.verbose) {
            console.warn(`Found ${globalDependencies.length} global dependencies in ${globalDepsDir}`)
          }
        }
        catch {
          // Ignore sniff errors for global directories
        }
      }
    }

    for (const requiredPkg of packages) {
      const { project, constraint } = requiredPkg

      let satisfied = false
      let foundVersion = ''
      let foundSource = ''
      let needsUpdate = false

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
            const shouldUpdate = await shouldUpdatePackage(project, installedVersion, constraint)

            if (satisfiesConstraint && !shouldUpdate) {
              satisfied = true
              foundVersion = installedVersion
              foundSource = checkDir === envDir ? envType : 'global'
              break
            }
            else if (satisfiesConstraint && shouldUpdate) {
              // Package satisfies constraint but is outdated
              needsUpdate = true
              foundVersion = installedVersion
              foundSource = checkDir === envDir ? envType : 'global'
            }
          }
        }
      }

      // Check system PATH for any package by trying common binary names
      if (!satisfied) {
        try {
          // Extract potential binary names from the project domain
          const potentialCommands = []

          // Handle common patterns: domain.com/package -> package, domain.sh -> domain
          if (project.includes('/')) {
            const parts = project.split('/')
            potentialCommands.push(parts[parts.length - 1]) // last part (package name)
            potentialCommands.push(parts[0].split('.')[0]) // first part without TLD
          }
          else if (project.includes('.')) {
            potentialCommands.push(project.split('.')[0]) // remove TLD
          }
          else {
            potentialCommands.push(project) // use as-is
          }

          // Common mappings for well-known packages
          const commonMappings: Record<string, string[]> = {
            'bun.sh': ['bun'],
            'nodejs.org': ['node'],
            'python.org': ['python', 'python3'],
            'go.dev': ['go'],
            'rust-lang.org': ['rustc', 'cargo'],
            'deno.com': ['deno'],
            'git-scm.com': ['git'],
            'docker.com': ['docker'],
            'kubernetes.io': ['kubectl', 'kubelet'],
          }

          if (commonMappings[project]) {
            potentialCommands.unshift(...commonMappings[project])
          }

          // Try each potential command
          for (const command of potentialCommands) {
            const result = spawnSync(command, ['--version'], { encoding: 'utf8', timeout: 5000 })
            if (result.status === 0 && result.stdout) {
              const systemVersion = result.stdout.trim()
              // Extract version number from output (handle various formats)
              const versionMatch = systemVersion.match(/(\d+\.\d+(?:\.\d+)?(?:-[\w.-]+)?)/)
              if (versionMatch) {
                const cleanVersion = versionMatch[1]
                const satisfiesConstraint = await checkVersionSatisfiesConstraint(cleanVersion, constraint)

                // For system binaries, if they satisfy the constraint, we consider them satisfied
                // Don't check for updates since we can't control system installations
                if (satisfiesConstraint) {
                  satisfied = true
                  foundVersion = cleanVersion
                  foundSource = 'system'
                  break
                }
              }
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
      else if (needsUpdate) {
        if (config.verbose) {
          console.warn(`🔄 ${project}@${foundVersion} (${foundSource}) needs update for ${constraint}`)
        }
        outdatedPackages.push({ project, constraint, currentVersion: foundVersion })
        // Treat outdated packages as missing to trigger reinstallation
        missingPackages.push(requiredPkg)
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
      if (outdatedPackages.length > 0) {
        console.warn(`Found ${outdatedPackages.length} outdated packages that will be updated`)
      }
    }

    return { satisfied: allSatisfied, missingPackages, outdatedPackages }
  }
  catch (error) {
    if (config.verbose) {
      console.warn(`Failed to check ${envType} environment constraints: ${error}`)
    }
    return { satisfied: false, missingPackages: packages, outdatedPackages: [] }
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
): Promise<{ ready: boolean, sniffResult?: any, missingPackages?: Array<{ project: string, constraint: string }>, outdatedPackages?: Array<{ project: string, constraint: string, currentVersion: string }> }> {
  const cacheKey = `${projectHash}_${envType}_${packages?.length || 0}_${Date.now() % 60000}` // Include timestamp to reduce caching for updates
  const cached = envReadinessCache.get(cacheKey)
  const now = Date.now()

  // Reduce cache TTL to 5 seconds for more responsive updates
  const reducedCacheTTL = 5000

  // Return cached result if still valid and we have packages to check
  if (cached && (now - cached.timestamp) < reducedCacheTTL && packages) {
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

  // Enhanced check: validate that required packages are actually installed in this environment
  // Don't just check if constraints are satisfied by any source (including system binaries)
  const localSatisfactionCheck = await checkEnvironmentSpecificSatisfaction(envDir, packages)

  // Environment is ready only if the specific environment directory has the required packages
  const ready = localSatisfactionCheck || (hasBinaries && packages.length === 0)

  // Also get full constraint check for error reporting
  const constraintCheck = await checkConstraintSatisfaction(envDir, packages, envType)

  // Cache the result with shorter TTL for update responsiveness
  envReadinessCache.set(cacheKey, {
    ready,
    timestamp: now,
    envDir: ready ? envDir : undefined,
  })

  return {
    ready,
    missingPackages: constraintCheck.missingPackages,
    outdatedPackages: constraintCheck.outdatedPackages,
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
  const { dryrun = false, quiet = false, shellOutput = false, skipGlobal = process.env.NODE_ENV === 'test' } = options

  try {
    // Find dependency file
    const dependencyFile = findDependencyFile(dir)
    if (!dependencyFile) {
      if (!quiet && !shellOutput) {
        console.log('No dependency file found')
      }
      return
    }

    // For shell output mode, first check if environment is already ready without heavy operations
    const projectDir = path.dirname(dependencyFile)

    // Fast path for shell output: check if environments exist and have binaries
    // Skip fast path in test mode to ensure proper package discovery
    if (shellOutput && process.env.NODE_ENV !== 'test') {
      const fastProjectHash = generateProjectHash(dir)
      const fastEnvDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', fastProjectHash)
      const fastGlobalEnvDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'global')

      const envBinPath = path.join(fastEnvDir, 'bin')
      const envSbinPath = path.join(fastEnvDir, 'sbin')
      const globalBinPath = path.join(fastGlobalEnvDir, 'bin')
      const globalSbinPath = path.join(fastGlobalEnvDir, 'sbin')

      const hasLocalBinaries = fs.existsSync(envBinPath) && fs.readdirSync(envBinPath).length > 0
      const hasGlobalBinaries = fs.existsSync(globalBinPath) && fs.readdirSync(globalBinPath).length > 0

      // Fast path disabled - always do proper constraint checking to ensure correct versions
      // The fast path was causing issues where global binaries would activate environments
      // even when local packages weren't properly installed
      // if (hasLocalBinaries || hasGlobalBinaries) {
      //   outputShellCode(dir, envBinPath, envSbinPath, fastProjectHash, minimalSniffResult, globalBinPath, globalSbinPath)
      //   return
      // }
    }

    // Parse dependency file and separate global vs local dependencies
    const { default: sniff } = await import('./sniff')
    let sniffResult: { pkgs: any[], env: Record<string, string> }

    try {
      sniffResult = await sniff({ string: projectDir })
    }
    catch (error) {
      // Handle malformed dependency files gracefully
      if (config.verbose) {
        console.warn(`Failed to parse dependency file: ${error instanceof Error ? error.message : String(error)}`)
      }
      sniffResult = { pkgs: [], env: {} }
    }

    // Always check for global dependencies when not skipping global
    const globalSniffResults: Array<{ pkgs: any[], env: Record<string, string> }> = []

    if (!skipGlobal) {
      // Also check for global dependencies from well-known locations
      const globalDepLocations = [
        path.join(homedir(), '.dotfiles'),
        path.join(homedir()),
      ]

      for (const globalLocation of globalDepLocations) {
        if (fs.existsSync(globalLocation)) {
          try {
            const globalSniff = await sniff({ string: globalLocation })
            if (globalSniff.pkgs.length > 0) {
              globalSniffResults.push(globalSniff)
              if (config.verbose) {
                console.warn(`Found ${globalSniff.pkgs.length} packages in global location: ${globalLocation}`)
              }
            }
          }
          catch {
            // Ignore errors sniffing global locations
          }
        }
      }
    }

    // Separate global and local packages
    const globalPackages: string[] = []
    const localPackages: string[] = []

    // Process packages from the project directory
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

      // Check if this is a global dependency (only if not skipping global)
      if (pkg.global && !skipGlobal) {
        globalPackages.push(packageString)
      }
      else {
        localPackages.push(packageString)
      }
    }

    // Process packages from global locations
    for (const globalSniffResult of globalSniffResults) {
      for (const pkg of globalSniffResult.pkgs) {
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

        // All packages from global locations are treated as global
        // Check if already added to avoid duplicates
        if (!globalPackages.includes(packageString)) {
          globalPackages.push(packageString)
        }
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

      // For shell output mode, still generate basic shell setup even with no packages
      if (shellOutput) {
        const projectHash = generateProjectHash(dir)
        const envDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', projectHash)
        const envBinPath = path.join(envDir, 'bin')
        const envSbinPath = path.join(envDir, 'sbin')
        const globalEnvDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'global')
        const globalBinPath = path.join(globalEnvDir, 'bin')
        const globalSbinPath = path.join(globalEnvDir, 'sbin')

        // Use empty sniff result since no packages were found
        const emptySniffResult = { pkgs: [], env: {} }
        outputShellCode(dir, envBinPath, envSbinPath, projectHash, emptySniffResult, globalBinPath, globalSbinPath)
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

    // Check if we have outdated packages that need updating
    const hasOutdatedLocal = localReadyResult.outdatedPackages && localReadyResult.outdatedPackages.length > 0
    const hasOutdatedGlobal = globalReadyResult.outdatedPackages && globalReadyResult.outdatedPackages.length > 0

    if (config.verbose) {
      console.warn(`Environment readiness - local: ${localReady}, global: ${globalReady}`)
      if (hasOutdatedLocal) {
        console.warn(`Local outdated packages: ${localReadyResult.outdatedPackages?.map(p => `${p.project}@${p.currentVersion}`).join(', ')}`)
      }
      if (hasOutdatedGlobal) {
        console.warn(`Global outdated packages: ${globalReadyResult.outdatedPackages?.map(p => `${p.project}@${p.currentVersion}`).join(', ')}`)
      }
    }

    // Handle dry run after constraint checking
    if (dryrun) {
      if (!quiet && !shellOutput) {
        if (globalPackages.length > 0) {
          // Check if constraints are satisfied (either by installed packages or system binaries)
          const globalConstraintsSatisfied = globalReadyResult.missingPackages?.length === 0
          const globalStatus = (globalReady || globalConstraintsSatisfied) ? 'satisfied by existing installations' : 'would install globally'
          console.log(`Global packages: ${globalPackages.join(', ')} (${globalStatus})`)
        }
        if (localPackages.length > 0) {
          // Check if constraints are satisfied (either by installed packages or system binaries)
          const localConstraintsSatisfied = localReadyResult.missingPackages?.length === 0
          const localStatus = (localReady || localConstraintsSatisfied) ? 'satisfied by existing installations' : 'would install locally'
          console.log(`Local packages: ${localPackages.join(', ')} (${localStatus})`)
        }
      }
      return
    }

        // For shell output mode, handle different scenarios
    if (shellOutput) {
      const hasLocalPackagesInstalled = localReady || localPackages.length === 0
      const hasGlobalPackagesInstalled = globalReady || globalPackages.length === 0

      // Check if we have any constraint satisfaction by system binaries
      const localConstraintsSatisfied = localReadyResult.missingPackages?.length === 0
      const globalConstraintsSatisfied = globalReadyResult.missingPackages?.length === 0

      // Also check if core dependencies (required for basic functionality) are satisfied
      // even if some optional global packages are missing
      const coreLocalSatisfied = localConstraintsSatisfied || localPackages.length === 0
      const hasOptionalGlobalMissing = globalReadyResult.missingPackages && globalReadyResult.missingPackages.length > 0
      const coreGlobalSatisfied = globalConstraintsSatisfied || (hasOptionalGlobalMissing && globalPackages.length > 0)

      if (hasLocalPackagesInstalled && hasGlobalPackagesInstalled) {
        // Ideal case: all packages properly installed
        outputShellCode(dir, envBinPath, envSbinPath, projectHash, sniffResult, globalBinPath, globalSbinPath)
        return
      }
             else if (coreLocalSatisfied && coreGlobalSatisfied) {
         // Fallback case: core constraints satisfied by system binaries, but warn user
         if (!hasLocalPackagesInstalled && localPackages.length > 0) {
           process.stderr.write(`⚠️  Local packages not installed but constraints satisfied by system binaries\n`)
           process.stderr.write(`💡 Run 'launchpad dev .' to install proper versions: ${localPackages.join(', ')}\n`)
         }
         if (!hasGlobalPackagesInstalled && hasOptionalGlobalMissing) {
           const missingGlobalPkgs = globalReadyResult.missingPackages?.map(p => p.project) || []
           process.stderr.write(`⚠️  Some global packages not available: ${missingGlobalPkgs.join(', ')}\n`)
           process.stderr.write(`💡 Install missing global packages if needed\n`)
         }
         outputShellCode(dir, envBinPath, envSbinPath, projectHash, sniffResult, globalBinPath, globalSbinPath)
         return
       }
      else {
        // No fallback available - but still generate shell code for development workflows
        process.stderr.write(`❌ Environment not ready: local=${localReady}, global=${globalReady}\n`)
        if (!localReady && localPackages.length > 0) {
          process.stderr.write(`💡 Local packages need installation: ${localPackages.join(', ')}\n`)
        }
        if (!globalReady && globalPackages.length > 0) {
          process.stderr.write(`💡 Global packages need installation: ${globalPackages.join(', ')}\n`)
        }
        process.stderr.write(`⚠️  Generating minimal shell environment for development\n`)

        // Generate basic shell code even when packages aren't installed
        // This allows development workflows to continue with system binaries
        outputShellCode(dir, envBinPath, envSbinPath, projectHash, sniffResult, globalBinPath, globalSbinPath)
        return
      }
    }

    const results: string[] = []

    // Always ensure global environment is activated first, even if already ready
    // This ensures global tools like bash are available for subsequent operations
    let globalInstallationFailed = false
    if (globalPackages.length > 0 && !skipGlobal) {
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
        // If global environment is already ready, just create/update stubs
        if (globalReady) {
          await createGlobalStubs(globalEnvDir, globalPackages)
          if (shellOutput) {
            process.stderr.write(`✅ Global dependencies ready\n`)
          }
        }
        else {
          // Install global packages to the stable global environment
          const globalResults = await install(globalPackages, globalEnvDir)
          results.push(...globalResults)

          // Create or update global stubs in system locations (/usr/local/bin)
          await createGlobalStubs(globalEnvDir, globalPackages)

          if (shellOutput) {
            process.stderr.write(`✅ Global dependencies installed\n`)
          }
        }
      }
      catch (error) {
                if (shellOutput) {
          process.stderr.write(`❌ Failed to install global packages: ${error instanceof Error ? error.message : String(error)}\n`)

          // Don't mislead users about system binary usage
          const constraintsSatisfiedBySystem = globalReadyResult.missingPackages?.length === 0
          if (constraintsSatisfiedBySystem) {
            process.stderr.write(`⚠️  System binaries may satisfy global constraints but requested packages failed to install\n`)
          }
        }
        else {
          console.error(`Failed to install global packages: ${error instanceof Error ? error.message : String(error)}`)
        }

        // Track that global installation failed
        globalInstallationFailed = true
      }

      config.verbose = originalVerbose
      config.showShellMessages = originalShowShellMessages
    }

    // Install local packages to project-specific environment
    let localInstallationFailed = false
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
          process.stderr.write(`✅ Local packages installed for ${projectName} \x1B[2m\x1B[3m(${elapsed}s)\x1B[0m\n`)

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
          const errorMessage = error instanceof Error ? error.message : String(error)
          process.stderr.write(`❌ Failed to install local packages: ${errorMessage}\n`)

          // Don't mislead users by saying we're using system binaries when they want specific versions
          const constraintsSatisfiedBySystem = localReadyResult.missingPackages?.length === 0
          if (constraintsSatisfiedBySystem) {
            process.stderr.write(`⚠️  System binaries may satisfy version constraints but requested packages failed to install\n`)
            process.stderr.write(`💡 Consider resolving installation issues for consistent environments\n`)
          }

          // Provide helpful guidance for common issues
          if (errorMessage.includes('bun')) {
            process.stderr.write(`💡 Tip: Install bun manually with: curl -fsSL https://bun.sh/install | bash\n`)
          }
          if (errorMessage.includes('ENOENT') || errorMessage.includes('permission')) {
            process.stderr.write(`💡 Check directory permissions and disk space\n`)
          }
          if (errorMessage.includes('End-of-central-directory signature not found') || errorMessage.includes('zipfile')) {
            process.stderr.write(`💡 Download corrupted, clear cache: launchpad cache:clear --force\n`)
          }

          // Track that local installation failed
          localInstallationFailed = true
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
      // Determine environment state for better messaging
      const hasInstallationFailures = localInstallationFailed || globalInstallationFailed
      const hasRequiredPackages = localPackages.length > 0 || globalPackages.length > 0
      const systemBinariesSatisfyConstraints = (localReadyResult.missingPackages?.length === 0) &&
                                               (globalReadyResult.missingPackages?.length === 0)

      if (!hasInstallationFailures && hasRequiredPackages) {
        // Perfect case: all packages installed successfully
        process.stderr.write(`✅ Environment activated for ${path.basename(dir)}\n`)
      } else if (hasInstallationFailures && systemBinariesSatisfyConstraints) {
        // Fallback case: installations failed but system binaries work
        process.stderr.write(`⚠️  Environment activated with system binaries (installations failed)\n`)
        process.stderr.write(`💡 Some packages may not be the exact requested versions\n`)
      } else if (hasInstallationFailures) {
        // Bad case: installations failed and system doesn't satisfy requirements
        process.stderr.write(`❌ Environment activation failed - required packages unavailable\n`)
        process.stderr.write(`💡 Fix installation issues and try again\n`)
        return // Don't generate shell code if critical packages are missing
      } else {
        // No packages needed or already satisfied
        process.stderr.write(`✅ Environment ready for ${path.basename(dir)}\n`)
      }

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

  // Build library paths for global environment
  const globalEnvDir = path.dirname(path.dirname(globalBinaryPath))
  const libraryPaths: string[] = []

  // Add library paths from global packages
  try {
    const domains = fs.existsSync(globalEnvDir)
      ? fs.readdirSync(globalEnvDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory()
            && !['bin', 'sbin', 'lib', 'lib64', 'share', 'include', 'etc', 'pkgs', '.tmp', '.cache'].includes(dirent.name))
      : []

    for (const domain of domains) {
      const domainPath = path.join(globalEnvDir, domain.name)
      if (fs.existsSync(domainPath)) {
        const versions = fs.readdirSync(domainPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'))

        for (const version of versions) {
          const versionPath = path.join(domainPath, version.name)
          const libDirs = [
            path.join(versionPath, 'lib'),
            path.join(versionPath, 'lib64'),
          ]

          for (const libDir of libDirs) {
            if (fs.existsSync(libDir) && !libraryPaths.includes(libDir)) {
              libraryPaths.push(libDir)
            }
          }
        }
      }
    }
  }
  catch {
    // Ignore errors reading directories
  }

  let stubContent = `#!/bin/sh
# Global Launchpad stub for ${binaryName} (${packageName})
# This stub is stable and survives environment rebuilds

# Set up library paths for dynamic linking
setup_library_paths() {
`

  if (libraryPaths.length > 0) {
    const libraryPathString = libraryPaths.join(':')
    stubContent += `  # macOS dynamic library paths
  if [ -n "$DYLD_LIBRARY_PATH" ]; then
    export DYLD_LIBRARY_PATH="${libraryPathString}:$DYLD_LIBRARY_PATH"
  else
    export DYLD_LIBRARY_PATH="${libraryPathString}"
  fi

  if [ -n "$DYLD_FALLBACK_LIBRARY_PATH" ]; then
    export DYLD_FALLBACK_LIBRARY_PATH="${libraryPathString}:$DYLD_FALLBACK_LIBRARY_PATH"
  else
    export DYLD_FALLBACK_LIBRARY_PATH="${libraryPathString}:/usr/local/lib:/lib:/usr/lib"
  fi

  # Linux dynamic library paths
  if [ -n "$LD_LIBRARY_PATH" ]; then
    export LD_LIBRARY_PATH="${libraryPathString}:$LD_LIBRARY_PATH"
  else
    export LD_LIBRARY_PATH="${libraryPathString}"
  fi
`
  }

  stubContent += `}

# First try the current global installation path
if [ -x "${globalBinaryPath}" ]; then
  setup_library_paths
  exec "${globalBinaryPath}" "$@"
fi

# If the direct path doesn't work, try to find the binary in the global environment
GLOBAL_ENV_DIR="${globalEnvDir}"
if [ -d "$GLOBAL_ENV_DIR" ]; then
  # Try both bin and sbin directories
  for bin_dir in "$GLOBAL_ENV_DIR/bin" "$GLOBAL_ENV_DIR/sbin"; do
    if [ -x "$bin_dir/${binaryName}" ]; then
      setup_library_paths
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
      setup_library_paths
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

  return stubContent
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

  // Add global paths first to ensure critical tools like bash are always available
  if (globalBinPath && fs.existsSync(globalBinPath)) {
    pathComponents.push(globalBinPath)
  }
  if (globalSbinPath && fs.existsSync(globalSbinPath)) {
    pathComponents.push(globalSbinPath)
  }

  // Add project-specific paths second (can override global if needed)
  if (fs.existsSync(envBinPath)) {
    pathComponents.push(envBinPath)
  }
  if (fs.existsSync(envSbinPath)) {
    pathComponents.push(envSbinPath)
  }

  // Add original PATH
  pathComponents.push('$LAUNCHPAD_ORIGINAL_PATH')

  process.stdout.write(`export PATH="${pathComponents.join(':')}"\n`)

  // Ensure system paths are always available (fix for missing bash, etc.)
  process.stdout.write(`# Ensure critical system binaries are always available\n`)
  process.stdout.write(`for sys_path in /usr/local/bin /usr/bin /bin /usr/sbin /sbin; do\n`)
  process.stdout.write(`  if [[ -d "$sys_path" && ":$PATH:" != *":$sys_path:"* ]]; then\n`)
  process.stdout.write(`    export PATH="$PATH:$sys_path"\n`)
  process.stdout.write(`  fi\n`)
  process.stdout.write(`done\n`)

  // Set up dynamic library paths for packages to find their dependencies
  const libraryPathComponents = []

  // Add library paths from project environment
  const envLibPath = path.dirname(envBinPath) // Go up from bin to env root
  const projectLibDirs = [
    path.join(envLibPath, 'lib'),
    path.join(envLibPath, 'lib64'),
  ]

  for (const libDir of projectLibDirs) {
    if (fs.existsSync(libDir)) {
      libraryPathComponents.push(libDir)
    }
  }

  // Add library paths from global environment
  if (globalBinPath) {
    const globalLibPath = path.dirname(globalBinPath) // Go up from bin to env root
    const globalLibDirs = [
      path.join(globalLibPath, 'lib'),
      path.join(globalLibPath, 'lib64'),
    ]

    for (const libDir of globalLibDirs) {
      if (fs.existsSync(libDir)) {
        libraryPathComponents.push(libDir)
      }
    }
  }

  // Add library paths from all package installations in the environment
  const packageSearchDirs = [
    path.dirname(envBinPath), // Project environment root
    globalBinPath ? path.dirname(globalBinPath) : null, // Global environment root
  ].filter(Boolean) as string[]

  for (const searchDir of packageSearchDirs) {
    try {
      const domains = fs.readdirSync(searchDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !['bin', 'sbin', 'lib', 'lib64', 'share', 'include', 'etc'].includes(dirent.name))

      for (const domain of domains) {
        const domainPath = path.join(searchDir, domain.name)
        if (fs.existsSync(domainPath)) {
          const versions = fs.readdirSync(domainPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'))

          for (const version of versions) {
            const versionPath = path.join(domainPath, version.name)
            const packageLibDirs = [
              path.join(versionPath, 'lib'),
              path.join(versionPath, 'lib64'),
            ]

            for (const libDir of packageLibDirs) {
              if (fs.existsSync(libDir) && !libraryPathComponents.includes(libDir)) {
                libraryPathComponents.push(libDir)
              }
            }
          }
        }
      }
    }
    catch {
      // Ignore errors reading directories
    }
  }

  // Set up library path environment variables
  if (libraryPathComponents.length > 0) {
    const libraryPath = libraryPathComponents.join(':')

    // macOS uses DYLD_LIBRARY_PATH and DYLD_FALLBACK_LIBRARY_PATH
    process.stdout.write(`# Set up dynamic library paths for package dependencies\n`)
    process.stdout.write(`if [[ -z "$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH" ]]; then\n`)
    process.stdout.write(`  export LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH="$DYLD_LIBRARY_PATH"\n`)
    process.stdout.write(`fi\n`)
    process.stdout.write(`if [[ -z "$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH" ]]; then\n`)
    process.stdout.write(`  export LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH="$DYLD_FALLBACK_LIBRARY_PATH"\n`)
    process.stdout.write(`fi\n`)
    process.stdout.write(`if [[ -z "$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH" ]]; then\n`)
    process.stdout.write(`  export LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH="$LD_LIBRARY_PATH"\n`)
    process.stdout.write(`fi\n`)

    // Set library paths with fallbacks to original values
    process.stdout.write(`export DYLD_LIBRARY_PATH="${libraryPath}\${LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH:+:\$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH}"\n`)
    process.stdout.write(`export DYLD_FALLBACK_LIBRARY_PATH="${libraryPath}\${LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH:+:\$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH}"\n`)
    // Linux uses LD_LIBRARY_PATH
    process.stdout.write(`export LD_LIBRARY_PATH="${libraryPath}\${LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH:+:\$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH}"\n`)
  }

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
  process.stdout.write(`_launchpad_dev_try_bye() {\n`)
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
  process.stdout.write(`      # Restore original library paths\n`)
  process.stdout.write(`      if [[ -n "$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH" ]]; then\n`)
  process.stdout.write(`        export DYLD_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH"\n`)
  process.stdout.write(`      else\n`)
  process.stdout.write(`        unset DYLD_LIBRARY_PATH\n`)
  process.stdout.write(`      fi\n`)
  process.stdout.write(`      if [[ -n "$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH" ]]; then\n`)
  process.stdout.write(`        export DYLD_FALLBACK_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH"\n`)
  process.stdout.write(`      else\n`)
  process.stdout.write(`        unset DYLD_FALLBACK_LIBRARY_PATH\n`)
  process.stdout.write(`      fi\n`)
  process.stdout.write(`      if [[ -n "$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH" ]]; then\n`)
  process.stdout.write(`        export LD_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH"\n`)
  process.stdout.write(`      else\n`)
  process.stdout.write(`        unset LD_LIBRARY_PATH\n`)
  process.stdout.write(`      fi\n`)
  process.stdout.write(`      unset LAUNCHPAD_ENV_BIN_PATH\n`)
  process.stdout.write(`      unset LAUNCHPAD_PROJECT_DIR\n`)
  process.stdout.write(`      unset LAUNCHPAD_PROJECT_HASH\n`)
  process.stdout.write(`      unset LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH\n`)
  process.stdout.write(`      unset LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH\n`)
  process.stdout.write(`      unset LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH\n`)
  process.stdout.write(`      echo "dev environment deactivated"\n`)
  process.stdout.write(`      ;;\n`)
  process.stdout.write(`  esac\n`)
  process.stdout.write(`}\n`)
}
