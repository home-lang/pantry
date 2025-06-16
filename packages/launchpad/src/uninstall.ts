import fs from 'node:fs'
import path from 'node:path'
import { getPackageInfo, install_prefix, resolvePackageName } from './install'

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

  const root = install_prefix()
  const binDir = root.join('bin')

  if (!binDir.isDirectory()) {
    console.error(`❌ Binary directory ${binDir.string} does not exist`)
    return false
  }

  // eslint-disable-next-line no-console
  console.log(`🗑️  Uninstalling ${packageName} (${resolvedDomain})...`)

  const removedFiles: string[] = []
  const missingFiles: string[] = []

  // Remove each program/binary provided by this package
  for (const program of packageInfo.programs) {
    const binaryPath = binDir.join(program)

    if (binaryPath.exists() && !binaryPath.isDirectory()) {
      try {
        await fs.promises.unlink(binaryPath.string)
        removedFiles.push(program)
        // eslint-disable-next-line no-console
        console.log(`  🗑️  Removed ${program}`)
      }
      catch (error) {
        console.error(`  ❌ Failed to remove ${program}: ${error}`)
        return false
      }
    }
    else {
      missingFiles.push(program)
    }
  }

  // Report results with smart grammar
  if (removedFiles.length > 0) {
    const binaryWord = removedFiles.length === 1 ? 'binary' : 'binaries'
    const packageDisplay = packageName !== resolvedDomain ? `${packageName} (${resolvedDomain})` : packageName

    // eslint-disable-next-line no-console
    console.log(`✅ Successfully uninstalled ${packageDisplay}`)
    // eslint-disable-next-line no-console
    console.log(`   Removed ${removedFiles.length} ${binaryWord}: ${removedFiles.join(', ')}`)
  }

  if (missingFiles.length > 0) {
    const binaryWord = missingFiles.length === 1 ? 'binary was' : 'binaries were'
    // eslint-disable-next-line no-console
    console.log(`⚠️  ${missingFiles.length} expected ${binaryWord} not found: ${missingFiles.join(', ')}`)
    // eslint-disable-next-line no-console
    console.log(`   (May have been previously removed or installed elsewhere)`)
  }

  if (removedFiles.length === 0) {
    // eslint-disable-next-line no-console
    console.log(`ℹ️  No binaries were removed for ${packageName} - package may not be installed`)
    return false
  }

  return true
}

/**
 * Uninstall all packages and remove the entire installation
 */
export async function uninstall_all(): Promise<void> {
  const root = install_prefix()

  // eslint-disable-next-line no-console
  console.log('🗑️  Uninstalling all Launchpad packages and data...')

  try {
    // Remove the entire .local directory structure
    const dirsToRemove = [
      root.join('bin'),
      root.join('lib'),
      root.join('share'),
      root.join('pkgs'),
    ]

    let removedCount = 0
    for (const dir of dirsToRemove) {
      if (dir.isDirectory()) {
        await fs.promises.rm(dir.string, { recursive: true, force: true })
        removedCount++
        // eslint-disable-next-line no-console
        console.log(`  🗑️  Removed ${path.basename(dir.string)} directory`)
      }
    }

    if (removedCount > 0) {
      // eslint-disable-next-line no-console
      console.log(`✅ Successfully uninstalled all Launchpad data (${removedCount} directories removed)`)
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
