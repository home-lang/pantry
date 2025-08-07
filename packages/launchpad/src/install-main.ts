/* eslint-disable no-console */
import type { PackageSpec } from './types'
import fs from 'node:fs'
import process from 'node:process'
import { config } from './config'
import { resolveAllDependencies } from './dependency-resolution'
import { installPackage } from './install-core'
import { clearMessageCache, logUniqueMessage } from './logging'
import { parsePackageSpec } from './package-resolution'
import { install_prefix } from './utils'

/**
 * Main installation function with type-safe package specifications
 */
export async function install(packages: PackageSpec | PackageSpec[], basePath?: string): Promise<string[]> {
  const packageList = Array.isArray(packages) ? packages : [packages]
  const installPath = basePath || install_prefix().string

  // Clear message cache at start of installation to avoid stale duplicates
  clearMessageCache()

  // Create installation directory even if no packages to install
  await fs.promises.mkdir(installPath, { recursive: true })

  // If no packages specified, just ensure directory exists and return
  if (packageList.length === 0 || (packageList.length === 1 && !packageList[0])) {
    if (config.verbose) {
      console.warn(`No packages to install, created directory: ${installPath}`)
    }
    return []
  }

  // Use ts-pkgx to resolve all dependencies with proper version conflict resolution
  const resolvedPackages = await resolveAllDependencies(packageList)

  const deduplicatedPackages = resolvedPackages

  // Skip recursive dependency resolution since ts-pkgx already resolved everything
  const useDirectInstallation = true

  if (config.verbose) {
    console.warn(`Installing packages: ${deduplicatedPackages.join(', ')}`)
    console.warn(`Install path: ${installPath}`)
    if (deduplicatedPackages.length < packageList.length) {
      console.warn(`Deduplicated ${packageList.length} packages to ${deduplicatedPackages.length} packages`)
    }
  }

  const allInstalledFiles: string[] = []

  if (useDirectInstallation) {
    // ts-pkgx already resolved all dependencies, install all packages directly
    for (let i = 0; i < deduplicatedPackages.length; i++) {
      const pkg = deduplicatedPackages[i]
      let packageName: string
      try {
        const parsed = parsePackageSpec(pkg)
        packageName = parsed.name
        // Direct installation without dependency resolution
        const packageFiles = await installPackage(packageName, pkg, installPath)
        allInstalledFiles.push(...packageFiles)
      }
      catch (error) {
        // Handle OS-specific packages (e.g., darwin@package -> package)
        const osMatch = pkg.match(/^(darwin|linux|windows|freebsd|openbsd|netbsd)@([^:]+)(:.*)?$/)
        if (osMatch) {
          const [, _osPrefix, basePkg, versionConstraint] = osMatch
          // Fix malformed version constraints: ": ^1" -> "@^1"
          let fallbackPkg = basePkg
          if (versionConstraint) {
            const cleanVersion = versionConstraint.replace(/^:\s*/, '@')
            fallbackPkg = `${basePkg}${cleanVersion}`
          }

          if (config.verbose) {
            console.warn(`⚠️ OS-specific package ${pkg} failed, trying fallback: ${fallbackPkg}`)
          }
          // Try the fallback package
          try {
            const fallbackFiles = await installPackage(basePkg, fallbackPkg, installPath)
            allInstalledFiles.push(...fallbackFiles)
            if (config.verbose) {
              console.log(`✅ Fallback succeeded for ${fallbackPkg}`)
            }
            continue // Success, move to next package
          }
          catch {
            // If fallback with version fails, try without version
            if (versionConstraint) {
              try {
                const simpleFiles = await installPackage(basePkg, basePkg, installPath)
                allInstalledFiles.push(...simpleFiles)
                if (config.verbose) {
                  console.log(`✅ Fallback succeeded for ${basePkg} (without version constraint)`)
                }
                continue // Success, move to next package
              }
              catch {
                // Both attempts failed
                if (config.verbose) {
                  console.error(`❌ Failed to install ${pkg}, fallback ${fallbackPkg}, and simple ${basePkg}`)
                }
                else {
                  logUniqueMessage(`⚠️  Warning: Failed to install ${pkg} (tried multiple fallbacks)`)
                }
                continue
              }
            }
            else {
              // No version constraint, just log the error
              if (config.verbose) {
                console.error(`❌ Failed to install ${pkg} and fallback ${fallbackPkg}`)
              }
              else {
                logUniqueMessage(`⚠️  Warning: Failed to install ${pkg}`)
              }
              continue
            }
          }
        }
        else {
          // Not an OS-specific package, just log the error
          if (config.verbose) {
            console.error(`❌ Failed to install ${pkg}: ${error instanceof Error ? error.message : String(error)}`)
          }
          else {
            logUniqueMessage(`⚠️  Warning: Failed to install ${pkg}`)
          }
          continue
        }
      }
    }
  }
  else {
    // Legacy dependency resolution (not used with ts-pkgx)
    for (const pkg of deduplicatedPackages) {
      const { name: packageName } = parsePackageSpec(pkg)
      try {
        const packageFiles = await installPackage(packageName, pkg, installPath)
        allInstalledFiles.push(...packageFiles)
      }
      catch (error) {
        if (config.verbose) {
          console.error(`❌ Failed to install ${pkg}: ${error instanceof Error ? error.message : String(error)}`)
        }
        else {
          logUniqueMessage(`⚠️  Warning: Failed to install ${pkg}`)
        }
      }
    }
  }

  // Show final summary (allow CLI to suppress this to avoid duplicate success lines)
  const suppressSummary = process.env.LAUNCHPAD_SUPPRESS_INSTALL_SUMMARY === 'true'
  if (allInstalledFiles.length > 0 && !suppressSummary) {
    if (config.verbose) {
      console.log(`✅ Successfully installed ${allInstalledFiles.length} files`)
    }
    else {
      logUniqueMessage(`✅ Successfully set up environment with ${allInstalledFiles.length} files`)
    }
  }
  else if (!suppressSummary) {
    if (config.verbose) {
      console.log(`ℹ️  No new files installed (packages may have been already installed)`)
    }
    else {
      logUniqueMessage(`✅ Environment activated`)
    }
  }

  return allInstalledFiles
}

/**
 * Install packages in parallel with concurrency control
 */
export async function installPackagesInParallel(
  packages: string[],
  installPath: string,
  _maxConcurrency: number,
): Promise<Array<{ package: string, success: boolean, files: string[], error?: string }>> {
  const results: Array<{ package: string, success: boolean, files: string[], error?: string }> = []

  // Process packages sequentially for now to avoid conflicts
  // TODO: Implement proper parallel installation with concurrency control
  for (const pkg of packages) {
    try {
      const { name: packageName } = parsePackageSpec(pkg)
      const files = await installPackage(packageName, pkg, installPath)
      results.push({ package: pkg, success: true, files, error: undefined })
    }
    catch (error) {
      results.push({
        package: pkg,
        success: false,
        files: [],
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return results
}

/**
 * Download with resumption support for large files
 */
export async function _downloadWithResumption(
  _url: string,
  _destination: string,
  _expectedSize?: number,
): Promise<void> {
  // Implementation for resumable downloads
  // This is a placeholder for future implementation
  throw new Error('Resumable downloads not yet implemented')
}
