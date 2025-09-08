import process from 'node:process'
import { config } from './config'
import { installPackage } from './install-core'
import { logUniqueMessage } from './logging'
import { getAvailableVersions, getLatestVersion, getPackageInfo, parsePackageSpec, resolvePackageName, resolveVersion } from './package-resolution'
import { deduplicatePackagesByVersion, getPlatform } from './utils'

// Global variables for processing message management
let hasTemporaryProcessingMessage = false
let spinnerInterval: Timer | null = null

// Global tracker for deduplicating packages across all install calls
const globalInstalledTracker = new Set<string>()

// Use ts-pkgx API to resolve all dependencies with proper version conflict resolution
export async function resolveAllDependencies(packages: string[]): Promise<string[]> {
  try {
    // Import resolveDependencies from ts-pkgx with better error handling
    let resolveDependencies: any
    try {
      const tsPkgx = await import('ts-pkgx')
      resolveDependencies = tsPkgx.resolveDependencies
      if (typeof resolveDependencies !== 'function') {
        throw new Error('resolveDependencies is not available or not a function')
      }
    } catch (importError) {
      console.warn(`⚠️  ts-pkgx import failed: ${importError instanceof Error ? importError.message : String(importError)}`)
      console.warn('Falling back to simple deduplication...')
      return deduplicatePackagesByVersion(packages)
    }

    // Create a temporary dependency file content
    const depsYaml = packages.reduce((acc, pkg) => {
      const { name, version } = parsePackageSpec(pkg)
      // Use the resolved domain name, not the original alias
      const domain = resolvePackageName(name)
      acc[domain] = version || '*'
      return acc
    }, {} as Record<string, string>)

    // Write to temporary file for ts-pkgx
    const fs = await import('node:fs')
    const path = await import('node:path')
    const os = await import('node:os')

    const tempDir = os.tmpdir()
    const tempFile = path.join(tempDir, `launchpad-deps-${Date.now()}.yaml`)

    // Create YAML content
    const yamlContent = `dependencies:\n${Object.entries(depsYaml).map(([name, version]) => `  ${name}: ${version}`).join('\n')}\n`

    if (config.verbose) {
      console.warn(`📝 Generated dependency file for ts-pkgx:`)
      console.warn(yamlContent)
    }

    await fs.promises.writeFile(tempFile, yamlContent)

    try {
      // Resolve dependencies using ts-pkgx with additional error handling
      const result = await resolveDependencies(tempFile, {
        targetOs: getPlatform() as 'darwin' | 'linux',
        includeOsSpecific: true,
      })

      // Validate the result structure
      if (!result || typeof result !== 'object' || !Array.isArray(result.packages)) {
        throw new Error('Invalid result structure from ts-pkgx resolveDependencies')
      }

      if (config.verbose) {
        console.warn(`🔍 ts-pkgx resolved ${result.totalCount || result.packages.length} total packages from ${packages.length} input packages`)
        console.warn(`📦 Resolved packages: ${result.packages.map(pkg => `${pkg.name}@${pkg.version || 'latest'}`).join(', ')}`)
      }

      // Convert resolved packages back to package specs
      const resolvedSpecs = result.packages.map(pkg =>
        pkg.version ? `${pkg.name}@${pkg.version}` : pkg.name,
      )

      // Clean up temp file
      await fs.promises.unlink(tempFile)

      return resolvedSpecs
    }
    catch (error) {
      // Clean up temp file on error
      await fs.promises.unlink(tempFile).catch(() => {})
      throw error
    }
  }
  catch (error) {
    // Fallback to simple deduplication if ts-pkgx fails
    console.error(`❌ ts-pkgx dependency resolution failed: ${error instanceof Error ? error.message : String(error)}`)
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack)
    }
    console.warn('Falling back to simple deduplication...')
    return deduplicatePackagesByVersion(packages)
  }
}

/**
 * Resolves and installs package dependencies recursively
 */
export async function installDependencies(
  packageName: string,
  installPath: string,
  installedPackages: Set<string> = new Set(),
): Promise<string[]> {
  const allInstalledFiles: string[] = []
  const packageInfo = getPackageInfo(packageName)

  if (!packageInfo || !packageInfo.dependencies) {
    return allInstalledFiles
  }

  // Known problematic packages where version resolution often fails
  const knownProblematicPackages = new Set([
    'videolan.org/x264', // Often has no matching version constraints
    'videolan.org/x265', // Often has no matching version constraints
    'webmproject.org/libvpx', // Often has no matching version constraints
  ])

  if (config.verbose) {
    console.warn(`Resolving dependencies for ${packageName}: ${packageInfo.dependencies.join(', ')}`)
  }

  for (let depIndex = 0; depIndex < packageInfo.dependencies.length; depIndex++) {
    const dep = packageInfo.dependencies[depIndex]
    const { name: depName, version: depVersion } = parsePackageSpec(dep)
    const depDomain = resolvePackageName(depName)

    // Skip platform-specific dependencies that don't match the current platform
    if (depName.includes(':')) {
      const [platformPrefix] = depName.split(':', 2)
      const currentPlatform = getPlatform()

      // Skip if the platform prefix doesn't match the current platform
      if (platformPrefix === 'linux' && currentPlatform !== 'linux') {
        if (config.verbose) {
          console.warn(`Skipping Linux-specific dependency: ${depName} (current platform: ${currentPlatform})`)
        }
        continue
      }
      if (platformPrefix === 'darwin' && currentPlatform !== 'darwin') {
        if (config.verbose) {
          console.warn(`Skipping macOS-specific dependency: ${depName} (current platform: ${currentPlatform})`)
        }
        continue
      }
      if (platformPrefix === 'windows' && currentPlatform !== 'windows') {
        if (config.verbose) {
          console.warn(`Skipping Windows-specific dependency: ${depName} (current platform: ${currentPlatform})`)
        }
        continue
      }

      // If we get here, the platform matches or it's an unknown prefix
      // For unknown prefixes, we'll continue processing (could be a namespace)
    }

    // Skip known problematic packages silently to reduce noise
    if (knownProblematicPackages.has(depDomain) || knownProblematicPackages.has(depName)) {
      if (config.verbose) {
        console.warn(`Skipping known problematic dependency: ${depName}`)
      }
      continue
    }

    // Enhanced version resolution with multiple fallback strategies
    let versionToInstall = depVersion
    if (!versionToInstall) {
      // Strategy: Get latest version if no version specified
      const latestVersion = getLatestVersion(depDomain)
      if (latestVersion && typeof latestVersion !== 'string') {
        if (config.verbose) {
          console.warn(`Warning: getLatestVersion returned non-string for ${depDomain}: ${JSON.stringify(latestVersion)}`)
        }
        versionToInstall = String(latestVersion)
      }
      else {
        versionToInstall = latestVersion || undefined
      }
    }
    else {
      // Strategy 1: Try to resolve the version constraint to an actual version
      const resolvedVersion = resolveVersion(depDomain, depVersion)
      if (resolvedVersion) {
        versionToInstall = resolvedVersion
      }
      else {
        // Enhanced fallback strategies for version mismatch scenarios
        if (config.verbose) {
          console.warn(`Cannot resolve version constraint ${depVersion} for ${depName} (domain: ${depDomain}), trying enhanced fallback strategies`)
        }

        // Strategy 2: For caret constraints (^1.1), try to find any compatible major version
        if (depVersion && depVersion.startsWith('^')) {
          const requestedMajor = depVersion.slice(1).split('.')[0]
          const availableVersions = getAvailableVersions(depDomain)

          if (availableVersions.length > 0) {
            // Check if any version has the same major version
            const sameMajorVersion = availableVersions.find((v: string) => v.startsWith(`${requestedMajor}.`))

            if (sameMajorVersion) {
              versionToInstall = sameMajorVersion
              if (config.verbose) {
                console.warn(`Found compatible major version ${sameMajorVersion} for ${depName}@${depVersion}`)
              }
            }
            else {
              // Strategy 3: Check for well-known version compatibility mappings
              const versionCompatibilityMap: Record<string, Record<string, string[]>> = {
                'openssl.org': {
                  // CORRECTED: OpenSSL 3.x is NOT backward compatible with 1.x due to ABI changes
                  // Instead, prefer 1.x versions for broader compatibility
                  '^3.0': ['1.1.1w', '1.1.1u', '1.1.1t'], // Prefer stable 1.1.1 for compatibility
                  '^3.1': ['1.1.1w', '1.1.1u', '1.1.1t'],
                  '^3.2': ['1.1.1w', '1.1.1u', '1.1.1t'],
                  '^3.3': ['1.1.1w', '1.1.1u', '1.1.1t'],
                  '^3.4': ['1.1.1w', '1.1.1u', '1.1.1t'],
                  '^3.5': ['1.1.1w', '1.1.1u', '1.1.1t'],
                },
                'zlib.net': {
                  '^1.2': ['1.3.1', '1.3.0'], // zlib 1.3.x is compatible with 1.2.x
                },
              }

              const compatibleVersions = versionCompatibilityMap[depDomain]?.[depVersion]
              if (compatibleVersions) {
                // Find the first compatible version that exists
                const compatibleVersion = compatibleVersions.find(v => availableVersions.includes(v))
                if (compatibleVersion) {
                  versionToInstall = compatibleVersion
                  if (config.verbose) {
                    console.warn(`Using compatible version ${compatibleVersion} for ${depName}@${depVersion}`)
                  }
                }
              }
            }
          }
        }

        // Strategy 4: For tilde constraints (~1.2), try to find any compatible minor version
        if (!versionToInstall && depVersion && depVersion.startsWith('~')) {
          const requestedVersion = depVersion.slice(1)
          const [requestedMajor, requestedMinor] = requestedVersion.split('.')
          const availableVersions = getAvailableVersions(depDomain)

          if (availableVersions.length > 0) {
            // Check if any version has the same major.minor version
            const sameMinorVersion = availableVersions.find((v: string) => v.startsWith(`${requestedMajor}.${requestedMinor}.`))

            if (sameMinorVersion) {
              versionToInstall = sameMinorVersion
              if (config.verbose) {
                console.warn(`Found compatible minor version ${sameMinorVersion} for ${depName}@${depVersion}`)
              }
            }
          }
        }

        // Strategy 5: For exact version constraints, try to find the closest available version
        if (!versionToInstall && depVersion && !depVersion.startsWith('^') && !depVersion.startsWith('~')) {
          const availableVersions = getAvailableVersions(depDomain)
          if (availableVersions.length > 0) {
            // Try to find an exact match first
            const exactMatch = availableVersions.find(v => v === depVersion)
            if (exactMatch) {
              versionToInstall = exactMatch
            }
            else {
              // Fall back to latest available version
              versionToInstall = availableVersions[0]
              if (config.verbose) {
                console.warn(`Using latest version ${versionToInstall} instead of requested ${depVersion} for ${depName}`)
              }
            }
          }
        }

        // Strategy 6: Try the package name as an alias or domain directly
        if (!versionToInstall) {
          const resolvedDomain = resolvePackageName(depName)
          if (resolvedDomain !== depName) {
            const aliasLatest = getLatestVersion(resolvedDomain)
            if (aliasLatest) {
              if (config.verbose) {
                console.warn(`Using latest version ${aliasLatest} for resolved domain ${resolvedDomain} instead of ${depName}@${depVersion}`)
              }
              versionToInstall = typeof aliasLatest === 'string' ? aliasLatest : String(aliasLatest)
            }
          }
        }
      }
    }

    if (!versionToInstall) {
      if (config.verbose) {
        console.warn(`Warning: No suitable version found for dependency ${depName}`)
      }
      else {
        // Clear any temporary processing message before showing warning
        if (hasTemporaryProcessingMessage) {
          if (spinnerInterval) {
            clearInterval(spinnerInterval)
            spinnerInterval = null
          }
          if (process.env.LAUNCHPAD_SHELL_INTEGRATION === '1') {
            process.stderr.write('\x1B[1A\r\x1B[K')
          }
          else {
            process.stdout.write('\x1B[1A\r\x1B[K')
          }
          hasTemporaryProcessingMessage = false
        }

        // Only show warning for direct dependencies, not nested ones
        const isDirectDependency = packageInfo.dependencies.includes(dep)
        if (isDirectDependency) {
          logUniqueMessage(`⚠️  Warning: No suitable version found for dependency ${depName}, skipping...`)
        }
      }
      continue
    }

    // Create a unique key for this specific package@version combination
    const packageVersionKey = `${depDomain}@${versionToInstall}`

    // Check if any version of this domain is already installed and compare versions
    const domainAlreadyInstalled = Array.from(installedPackages).some(pkg =>
      pkg === depDomain || pkg.startsWith(`${depDomain}@`),
    )

    if (domainAlreadyInstalled) {
      const existingEntry = Array.from(installedPackages).find(pkg =>
        pkg === depDomain || pkg.startsWith(`${depDomain}@`),
      )

      if (existingEntry) {
        // Extract the existing version
        const existingVersion = existingEntry.includes('@')
          ? existingEntry.split('@')[1]
          : null

        // If we have both versions, compare them and keep the latest
        if (existingVersion && versionToInstall) {
          try {
            // Use Bun.semver for comparison (20x faster than node-semver)
            if (typeof Bun !== 'undefined' && Bun.semver) {
              const comparison = Bun.semver.order(versionToInstall, existingVersion)

              if (comparison > 0) {
                // New version is newer, replace the existing entry
                installedPackages.delete(existingEntry)
                console.warn(`🔄 Upgrading ${depDomain} from ${existingVersion} to ${versionToInstall}`)
                // Continue to install the newer version
              }
              else {
                // Existing version is newer or equal, skip
                if (config.verbose) {
                  console.warn(`⏭️  Skipping ${depDomain}@${versionToInstall} - already have ${existingVersion}`)
                }
                continue
              }
            }
            else {
              // Fallback to basic string comparison if Bun.semver is not available
              if (versionToInstall.localeCompare(existingVersion, undefined, { numeric: true }) > 0) {
                installedPackages.delete(existingEntry)
                if (config.verbose) {
                  console.warn(`Upgrading ${depDomain} from ${existingVersion} to ${versionToInstall} (newer version, fallback comparison)`)
                }
              }
              else {
                if (config.verbose) {
                  console.warn(`⏭️  Skipping ${depDomain}@${versionToInstall} - already have ${existingVersion}`)
                }
                continue
              }
            }
          }
          catch (error) {
            // If version comparison fails, be conservative and skip
            if (config.verbose) {
              console.warn(`Could not compare versions for ${depDomain}: ${versionToInstall} vs ${existingVersion}, keeping existing. Error: ${error instanceof Error ? error.message : String(error)}`)
            }
            continue
          }
        }
        else {
          // If we can't determine versions, skip to be safe
          if (config.verbose) {
            console.warn(`⏭️  Skipping ${depDomain}@${versionToInstall} - domain already installed as ${existingEntry}`)
          }
          continue
        }
      }
    }

    // Skip if this exact package@version is already installed to avoid circular dependencies
    if (installedPackages.has(packageVersionKey)) {
      if (config.verbose) {
        console.warn(`⏭️  Skipping ${packageVersionKey} - already installed`)
      }
      continue
    }

    // Mark this specific package@version as installed to prevent cycles
    installedPackages.add(packageVersionKey)

    try {
      if (config.verbose) {
        console.warn(`Installing dependency: ${dep} -> ${depDomain}@${versionToInstall}`)
      }
      // Remove dependency resolution messages - they're too verbose

      // Recursively install dependencies of this dependency (use global tracker)
      const nestedFiles = await installDependencies(depName, installPath, globalInstalledTracker)
      allInstalledFiles.push(...nestedFiles)

      // Install the dependency itself with the resolved version
      // Add type checking to prevent [object Object] errors
      if (versionToInstall && typeof versionToInstall !== 'string') {
        if (config.verbose) {
          console.warn(`Warning: versionToInstall is not a string for ${depName}: ${JSON.stringify(versionToInstall)}`)
        }
        versionToInstall = String(versionToInstall)
      }
      const depSpec = versionToInstall ? `${depName}@${versionToInstall}` : depName

      const depFiles = await installPackage(depName, depSpec, installPath)
      allInstalledFiles.push(...depFiles)

      // Processing message now handled automatically by logUniqueMessage
    }
    catch (error) {
      if (config.verbose) {
        console.warn(`Warning: Failed to install dependency ${dep}: ${error instanceof Error ? error.message : String(error)}`)
      }
      else {
        // Clear any temporary processing message before showing warning
        if (hasTemporaryProcessingMessage) {
          if (spinnerInterval) {
            clearInterval(spinnerInterval)
            spinnerInterval = null
          }
          if (process.env.LAUNCHPAD_SHELL_INTEGRATION === '1') {
            process.stderr.write('\x1B[1A\r\x1B[K')
          }
          else {
            process.stdout.write('\x1B[1A\r\x1B[K')
          }
          hasTemporaryProcessingMessage = false
        }

        // Only show warning for permission errors or direct dependencies
        const isPermissionError = error instanceof Error && error.message.includes('EACCES')
        const isDirectDependency = packageInfo.dependencies.includes(dep)

        if (isPermissionError || isDirectDependency) {
          logUniqueMessage(`⚠️  Warning: Failed to install dependency ${depName}, but continuing...`)
        }
      }
      // Continue with other dependencies even if one fails
    }
  }

  return allInstalledFiles
}
