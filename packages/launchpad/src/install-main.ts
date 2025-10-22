/* eslint-disable no-console */
import type { PackageSpec } from './types'
import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from './config'
import { resolveAllDependencies } from './dependency-resolution'
import { installPackage } from './install-core'
import { clearMessageCache, logUniqueMessage } from './logging'
import { getPackageInfo, parsePackageSpec, resolvePackageName } from './package-resolution'
import { startService } from './services/manager'
import { install_prefix } from './utils'

/**
 * Main installation function with type-safe package specifications
 */
export async function install(
  packages: PackageSpec | PackageSpec[],
  basePath?: string,
  options?: { skipServiceInit?: boolean },
): Promise<string[]> {
  const packageList = Array.isArray(packages) ? packages : [packages]
  const installPath = basePath || install_prefix().string

  // Clear message cache at start of installation to avoid stale duplicates
  clearMessageCache()

  // Add global timeout to prevent infinite hangs
  const globalTimeout = setTimeout(() => {
    console.error('❌ Installation process timed out after 10 minutes, forcing exit')
    process.exit(1)
  }, 10 * 60 * 1000) // 10 minute global timeout

  try {
    const result = await installInternal(packageList, installPath, options?.skipServiceInit ?? false)
    clearTimeout(globalTimeout)
    return result
  }
  catch (error) {
    clearTimeout(globalTimeout)
    throw error
  }
}

/**
 * Internal installation function
 */
async function installInternal(packageList: PackageSpec[], installPath: string, skipServiceInit: boolean = false): Promise<string[]> {
  // Create installation directory even if no packages to install
  await fs.promises.mkdir(installPath, { recursive: true })

  // Optional short-circuit: if we're targeting the Launchpad global directory and a
  // persistent ready marker exists, skip redundant global reinstalls initiated by
  // shell integration. Users can force a reinstall via config.forceReinstall.
  try {
    const globalTargetDir = path.join(homedir(), '.local', 'share', 'launchpad', 'global')
    const isGlobalTarget = installPath === globalTargetDir
    const isShellInitiated = process.env.LAUNCHPAD_SHELL_INTEGRATION === '1'
    if (isGlobalTarget && isShellInitiated && !config.forceReinstall) {
      const readyCacheMarker = path.join(homedir(), '.cache', 'launchpad', 'global_ready')
      const readyGlobalMarker = path.join(globalTargetDir, '.ready')
      if (fs.existsSync(readyCacheMarker) || fs.existsSync(readyGlobalMarker)) {
        if (config.verbose) {
          console.warn('♻️  Reusing existing global tools (ready marker present) — skipping global install')
        }
        return []
      }
    }
  }
  catch {
    // Non-fatal: proceed with normal install flow if any check fails
  }

  // If no packages specified, just ensure directory exists and return
  if (packageList.length === 0 || (packageList.length === 1 && !packageList[0])) {
    if (config.verbose) {
      console.warn(`No packages to install, created directory: ${installPath}`)
    }
    return []
  }

  // Decide whether to resolve runtime dependencies
  let deduplicatedPackages: string[]
  let useDirectInstallation = true
  if (config.installDependencies) {
    // Use ts-pkgx to resolve all dependencies with proper version conflict resolution
    const resolvedPackages = await resolveAllDependencies(packageList)
    deduplicatedPackages = resolvedPackages
    useDirectInstallation = true // already fully resolved
  }
  else {
    // Install only the requested packages (no runtime dependency resolution)
    // Deduplicate while preserving order
    const seen = new Set<string>()
    deduplicatedPackages = []
    for (const p of packageList) {
      if (!seen.has(p)) {
        seen.add(p)
        deduplicatedPackages.push(p)
      }
    }
    if (config.verbose) {
      console.warn('⏭️  Skipping runtime dependency resolution (installDependencies=false).')
    }
  }

  // Expand with companion packages (e.g., npm for node) using ts-pkgx metadata
  try {
    const seen = new Set<string>(deduplicatedPackages)
    const companionsToAdd: string[] = []

    // Only guarantee companions for the user-requested packages
    for (const requested of packageList) {
      const { name } = parsePackageSpec(requested)
      const info = getPackageInfo(name)
      if (!info || !info.companions || info.companions.length === 0)
        continue

      for (const comp of info.companions) {
        // Normalize companion identifier: allow aliases or domains
        const compName = parsePackageSpec(comp).name
        const normalized = resolvePackageName(compName)

        // Avoid duplicates if already present either as alias, domain, or any versioned spec
        const alreadyPresent = Array.from(seen).some((p) => {
          const n = parsePackageSpec(p).name
          const r = resolvePackageName(n)
          return r === normalized
        })

        if (!alreadyPresent) {
          companionsToAdd.push(comp)
          seen.add(comp)
        }
      }
    }

    if (companionsToAdd.length > 0) {
      if (config.verbose) {
        console.warn(`➕ Adding companion packages: ${companionsToAdd.join(', ')}`)
      }
      deduplicatedPackages.push(...companionsToAdd)
    }
  }
  catch (e) {
    if (config.verbose) {
      console.warn(`Failed to expand companions: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

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

        // Add timeout to individual package installation to prevent hangs
        // Use longer timeout in CI environments
        const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
        const timeoutMinutes = isCI ? 15 : 5 // 15 minutes for CI, 5 for local
        const installPromise = installPackage(packageName, pkg, installPath)
        const timeoutPromise = new Promise<string[]>((_, reject) => {
          setTimeout(() => {
            console.warn(`⚠️  Package installation timeout after ${timeoutMinutes} minutes: ${pkg}`)
            reject(new Error(`Package installation timeout: ${pkg}`))
          }, timeoutMinutes * 60 * 1000)
        })

        const packageFiles = await Promise.race([installPromise, timeoutPromise])
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
  }
  else if (!suppressSummary) {
    if (config.verbose) {
      console.log(`ℹ️  No new files installed (packages may have been already installed)`)
    }
    else {
      logUniqueMessage(`✅ Environment activated`)
    }
  }

  // Auto-initialize and start services for newly installed packages
  if (allInstalledFiles.length > 0 && !skipServiceInit) {
    await autoInitializeServicesForPackages(deduplicatedPackages)
  }

  return allInstalledFiles
}

/**
 * Auto-initialize and start services for newly installed packages
 */
async function autoInitializeServicesForPackages(packageList: PackageSpec[]): Promise<void> {
  if (!config.services?.autoStart) {
    return // Auto-start is disabled
  }

  // Map package names to potential services
  const servicePackageMap = new Map([
    ['mysql.com', 'mysql'],
    ['mysql', 'mysql'],
    ['postgres', 'postgres'],
    ['postgresql.org', 'postgres'],
    ['redis', 'redis'],
    ['redis.io', 'redis'],
    ['nginx', 'nginx'],
    ['nginx.org', 'nginx'],
    ['apache', 'apache'],
    ['httpd.apache.org', 'apache'],
  ])

  const servicesToStart: string[] = []

  for (const pkg of packageList) {
    const { name } = parsePackageSpec(pkg)
    const domain = resolvePackageName(name)

    // Check if this package has an associated service
    if (servicePackageMap.has(name)) {
      servicesToStart.push(servicePackageMap.get(name)!)
    }
    else if (servicePackageMap.has(domain)) {
      servicesToStart.push(servicePackageMap.get(domain)!)
    }
  }

  if (servicesToStart.length === 0) {
    return // No services to start
  }

  // Remove duplicates
  const uniqueServices = [...new Set(servicesToStart)]

  try {
    console.log(`🔧 Initializing services for installed packages...`)

    for (const serviceName of uniqueServices) {
      try {
        const success = await startService(serviceName)
        if (success) {
          console.log(`✅ Service ${serviceName} initialized and started`)
        }
        else {
          console.warn(`⚠️ Service ${serviceName} failed to start`)
        }
      }
      catch (error) {
        if (config.verbose) {
          console.warn(`⚠️ Failed to auto-start service ${serviceName}: ${error instanceof Error ? error.message : String(error)}`)
        }
        // Don't fail the entire installation if service start fails
      }
    }
  }
  catch (error) {
    if (config.verbose) {
      console.warn(`⚠️ Error during service auto-initialization: ${error instanceof Error ? error.message : String(error)}`)
    }
    // Don't fail the installation if service initialization fails
  }
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
