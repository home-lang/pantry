/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import { resolveAllDependencies } from './dependency-resolution'
import { getPackageInfo, resolvePackageName } from './install'
import { Path } from './path'

/**
 * Get all possible binary directories where packages might be installed
 */
function getPossibleBinaryDirectories(isGlobal: boolean = false): Path[] {
  const directories: Path[] = []

  if (isGlobal) {
    // For global uninstalls, only look in the launchpad global directory
    const globalBin = Path.home().join('.local', 'share', 'launchpad', 'global', 'bin')
    if (globalBin.isDirectory()) {
      directories.push(globalBin)
    }
  }
  else {
    // For local uninstalls, check standard locations
    // Add /usr/local/bin if it exists
    const usrLocalBin = new Path('/usr/local/bin')
    if (usrLocalBin.isDirectory()) {
      directories.push(usrLocalBin)
    }

    // Add ~/.local/bin if it exists
    const localBin = Path.home().join('.local', 'bin')
    if (localBin.isDirectory()) {
      directories.push(localBin)
    }

    // Also check launchpad global directory for backwards compatibility
    const globalBin = Path.home().join('.local', 'share', 'launchpad', 'global', 'bin')
    if (globalBin.isDirectory()) {
      directories.push(globalBin)
    }
  }

  return directories
}

/**
 * Get all currently installed packages in the global directory
 */
function getInstalledGlobalPackages(): string[] {
  const globalDir = Path.home().join('.local', 'share', 'launchpad', 'global')

  if (!globalDir.exists()) {
    return []
  }

  const installedPackages: string[] = []

  try {
    // Look for all domain directories (like nodejs.org, openssl.org, etc.)
    const domainDirs = fs.readdirSync(globalDir.string, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.') && dirent.name !== 'bin' && dirent.name !== 'sbin' && dirent.name !== 'pkgs')
      .map(dirent => dirent.name)

    for (const domain of domainDirs) {
      const domainPath = globalDir.join(domain)

      try {
        // Check for version directories inside each domain
        const versionDirs = fs.readdirSync(domainPath.string, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'))
          .map(dirent => dirent.name)

        if (versionDirs.length > 0) {
          // Convert domain back to package name (reverse of resolvePackageName)
          const packageName = getPackageNameFromDomain(domain)
          if (packageName) {
            installedPackages.push(packageName)
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
    // If we can't read the global directory, return empty array
    return []
  }

  return installedPackages
}

/**
 * Convert a domain back to package name (best effort)
 */
function getPackageNameFromDomain(domain: string): string | null {
  // Common mappings from domain to package name
  const domainToPackage: Record<string, string> = {
    'nodejs.org': 'node',
    'python.org': 'python',
    'rust-lang.org': 'rust',
    'go.dev': 'go',
    'openjdk.org': 'java',
    'php.net': 'php',
    'ruby-lang.org': 'ruby',
  }

  return domainToPackage[domain] || domain.replace(/\.(org|com|net|dev)$/, '')
}

/**
 * Handle cleanup of dependencies that are no longer needed
 */
export async function handleDependencyCleanup(packageName: string, isDryRun: boolean = false): Promise<void> {
  try {
    console.log(`\n🔍 Checking for unused dependencies...`)

    // Get the dependencies that were installed with this package
    let packageDependencies: string[] = []
    try {
      packageDependencies = await resolveAllDependencies([packageName])
      // Remove the main package itself from the dependencies list
      packageDependencies = packageDependencies.filter((dep) => {
        const depName = dep.split('@')[0]
        const resolvedDep = resolvePackageName(depName)
        const resolvedMain = resolvePackageName(packageName)
        return resolvedDep !== resolvedMain
      })
    }
    catch (error) {
      console.warn(`⚠️  Could not resolve dependencies for ${packageName}: ${error instanceof Error ? error.message : String(error)}`)
      console.log(`   Skipping dependency cleanup.`)
      return
    }

    if (packageDependencies.length === 0) {
      console.log(`   No dependencies found for ${packageName}`)
      return
    }

    // Get all currently installed packages (after removing the main package)
    const installedPackages = getInstalledGlobalPackages()
    const remainingPackages = installedPackages.filter((pkg) => {
      const resolvedPkg = resolvePackageName(pkg)
      const resolvedMain = resolvePackageName(packageName)
      return resolvedPkg !== resolvedMain
    })

    // Find dependencies that are no longer needed
    const unusedDependencies: string[] = []

    for (const dep of packageDependencies) {
      const depName = dep.split('@')[0]
      let isStillNeeded = false

      // Check if any remaining package still needs this dependency
      for (const remainingPkg of remainingPackages) {
        try {
          const remainingDeps = await resolveAllDependencies([remainingPkg])
          const remainingDepNames = remainingDeps.map(d => d.split('@')[0])

          if (remainingDepNames.some(rdep => resolvePackageName(rdep) === resolvePackageName(depName))) {
            isStillNeeded = true
            break
          }
        }
        catch {
          // If we can't resolve dependencies for a remaining package,
          // assume its dependencies might be needed
          isStillNeeded = true
          break
        }
      }

      if (!isStillNeeded) {
        unusedDependencies.push(depName)
      }
    }

    if (unusedDependencies.length === 0) {
      console.log(`   All dependencies are still needed by other packages`)
      return
    }

    const depWord = unusedDependencies.length === 1 ? 'dependency' : 'dependencies'
    const actionWord = isDryRun ? 'Would find' : 'Found'
    console.log(`\n🧹 ${actionWord} ${unusedDependencies.length} unused ${depWord}: ${unusedDependencies.join(', ')}`)
    console.log(`   These ${unusedDependencies.length === 1 ? 'was' : 'were'} installed as ${depWord} of ${packageName} but ${unusedDependencies.length === 1 ? 'is' : 'are'} no longer needed.`)

    // Show removal suggestions
    console.log(`\n💡 To remove unused ${depWord}, run:`)
    for (const dep of unusedDependencies) {
      console.log(`   launchpad uninstall -g ${dep}`)
    }
    console.log(`\n   Or remove all at once: launchpad uninstall -g ${unusedDependencies.join(' ')}`)
  }
  catch (error) {
    console.warn(`⚠️  Error during dependency cleanup: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Uninstall a package by name (supports aliases like 'node' -> 'nodejs.org')
 */
export async function uninstall(arg: string, isGlobal: boolean = false): Promise<boolean> {
  // Extract package name without version
  const [packageName] = arg.split('@')

  // Resolve package alias (e.g., 'node' -> 'nodejs.org')
  const resolvedDomain = resolvePackageName(packageName)

  // Get package information to find out which programs it provides
  const packageInfo = getPackageInfo(packageName)

  if (!packageInfo) {
    console.error(`❌ Package '${packageName}' not found in registry`)
    return false
  }

  if (!packageInfo.programs || packageInfo.programs.length === 0) {
    console.error(`❌ Package '${packageName}' does not provide any programs`)
    return false
  }

  // Get all possible binary directories
  const binDirectories = getPossibleBinaryDirectories(isGlobal)

  if (binDirectories.length === 0) {
    const checkedPaths = isGlobal
      ? `${Path.home().string}/.local/share/launchpad/global/bin`
      : `/usr/local/bin, ${Path.home().string}/.local/bin, and ${Path.home().string}/.local/share/launchpad/global/bin`
    console.error(`❌ No binary directories found (checked ${checkedPaths})`)
    return false
  }

  console.log(`🗑️  Uninstalling ${packageName} (\x1B[3m${resolvedDomain}\x1B[0m)...`)

  const removedFiles: Array<{ program: string, location: string }> = []
  const missingFiles: string[] = []
  let foundAnyBinary = false

  // Check each program/binary provided by this package in all possible locations
  for (const program of packageInfo.programs) {
    let foundInAnyLocation = false

    for (const binDir of binDirectories) {
      const binaryPath = binDir.join(program)

      if (binaryPath.exists() && !binaryPath.isDirectory()) {
        foundInAnyLocation = true
        foundAnyBinary = true

        try {
          await fs.promises.unlink(binaryPath.string)
          removedFiles.push({ program, location: binDir.string })

          console.log(`  🗑️  Removed ${program} from ${binDir.string}`)
        }
        catch (error) {
          // Check if it's a permission error
          if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
            console.log(`  ⚠️  Permission denied: ${program} in ${binDir.string} (try with sudo)`)
          }
          else {
            console.error(`  ❌ Failed to remove ${program} from ${binDir.string}: ${error}`)
            return false
          }
        }
      }
    }

    if (!foundInAnyLocation) {
      missingFiles.push(program)
    }
  }

  // Report results with smart grammar
  if (removedFiles.length > 0) {
    const binaryWord = removedFiles.length === 1 ? 'binary' : 'binaries'
    const packageDisplay = packageName !== resolvedDomain ? `${packageName} (\x1B[3m${resolvedDomain}\x1B[0m)` : packageName

    console.log(`✅ Successfully uninstalled ${packageDisplay}`)

    console.log(`   Removed ${removedFiles.length} ${binaryWord}:`)

    // Group by location for cleaner output
    const locationGroups = removedFiles.reduce((groups, file) => {
      if (!groups[file.location]) {
        groups[file.location] = []
      }
      groups[file.location].push(file.program)
      return groups
    }, {} as Record<string, string[]>)

    for (const [location, programs] of Object.entries(locationGroups)) {
      console.log(`     • ${location}: ${programs.join(', ')}`)
    }
  }

  if (missingFiles.length > 0) {
    const binaryWord = missingFiles.length === 1 ? 'binary was' : 'binaries were'

    console.log(`⚠️  ${missingFiles.length} expected ${binaryWord} not found: ${missingFiles.join(', ')}`)

    console.log(`   (May have been previously removed or installed elsewhere)`)
  }

  if (!foundAnyBinary) {
    console.log(`ℹ️  No binaries were found for ${packageName} - package may not be installed`)

    console.log(`   (Checked: ${binDirectories.map(d => d.string).join(', ')})`)
    return false
  }

  // Handle dependency cleanup for global uninstalls
  if (isGlobal && removedFiles.length > 0) {
    await handleDependencyCleanup(packageName, false)
  }

  return true
}

/**
 * Uninstall all packages and remove the entire installation
 */
export async function uninstall_all(): Promise<void> {
  console.log('🗑️  Uninstalling all Launchpad packages and data...')

  try {
    // Check both possible installation locations
    const possibleRoots = [
      new Path('/usr/local'),
      Path.home().join('.local'),
    ]

    let removedCount = 0
    const removedLocations: string[] = []

    for (const root of possibleRoots) {
      if (!root.isDirectory())
        continue

      const dirsToRemove = [
        root.join('bin'),
        root.join('lib'),
        root.join('share'),
        root.join('pkgs'),
      ]

      let locationRemovedCount = 0
      for (const dir of dirsToRemove) {
        if (dir.isDirectory()) {
          await fs.promises.rm(dir.string, { recursive: true, force: true })
          locationRemovedCount++
          removedCount++

          console.log(`  🗑️  Removed ${path.basename(dir.string)} directory from ${root.string}`)
        }
      }

      if (locationRemovedCount > 0) {
        removedLocations.push(root.string)
      }
    }

    if (removedCount > 0) {
      console.log(`✅ Successfully uninstalled all Launchpad data (${removedCount} directories removed)`)

      console.log(`   Cleaned locations: ${removedLocations.join(', ')}`)
    }
    else {
      console.log('ℹ️  No Launchpad installations found to remove')
    }
  }
  catch (error) {
    console.error('❌ Error during complete uninstallation:', error)
    throw error
  }
}
