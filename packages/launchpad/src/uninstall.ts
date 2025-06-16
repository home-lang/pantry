import fs from 'node:fs'
import path from 'node:path'
import { getPackageInfo, resolvePackageName } from './install'
import { Path } from './path'

/**
 * Get all possible binary directories where packages might be installed
 */
function getPossibleBinaryDirectories(): Path[] {
  const directories: Path[] = []

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

  return directories
}

/**
 * Uninstall a package by name (supports aliases like 'node' -> 'nodejs.org')
 */
export async function uninstall(arg: string): Promise<boolean> {
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
  const binDirectories = getPossibleBinaryDirectories()

  if (binDirectories.length === 0) {
    console.error(`❌ No binary directories found (checked /usr/local/bin and ~/.local/bin)`)
    return false
  }

  // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
          console.log(`  🗑️  Removed ${program} from ${binDir.string}`)
        }
        catch (error) {
          // Check if it's a permission error
          if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
            // eslint-disable-next-line no-console
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

    // eslint-disable-next-line no-console
    console.log(`✅ Successfully uninstalled ${packageDisplay}`)
    // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.log(`     • ${location}: ${programs.join(', ')}`)
    }
  }

  if (missingFiles.length > 0) {
    const binaryWord = missingFiles.length === 1 ? 'binary was' : 'binaries were'
    // eslint-disable-next-line no-console
    console.log(`⚠️  ${missingFiles.length} expected ${binaryWord} not found: ${missingFiles.join(', ')}`)
    // eslint-disable-next-line no-console
    console.log(`   (May have been previously removed or installed elsewhere)`)
  }

  if (!foundAnyBinary) {
    // eslint-disable-next-line no-console
    console.log(`ℹ️  No binaries were found for ${packageName} - package may not be installed`)
    // eslint-disable-next-line no-console
    console.log(`   (Checked: ${binDirectories.map(d => d.string).join(', ')})`)
    return false
  }

  return true
}

/**
 * Uninstall all packages and remove the entire installation
 */
export async function uninstall_all(): Promise<void> {
  // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
          console.log(`  🗑️  Removed ${path.basename(dir.string)} directory from ${root.string}`)
        }
      }

      if (locationRemovedCount > 0) {
        removedLocations.push(root.string)
      }
    }

    if (removedCount > 0) {
      // eslint-disable-next-line no-console
      console.log(`✅ Successfully uninstalled all Launchpad data (${removedCount} directories removed)`)
      // eslint-disable-next-line no-console
      console.log(`   Cleaned locations: ${removedLocations.join(', ')}`)
    }
    else {
      // eslint-disable-next-line no-console
      console.log('ℹ️  No Launchpad installations found to remove')
    }
  }
  catch (error) {
    console.error('❌ Error during complete uninstallation:', error)
    throw error
  }
}
