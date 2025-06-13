/* eslint-disable no-console */
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import { arch, platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { aliases, packages } from 'ts-pkgx'
import { config } from './config'
import { Path } from './path'
import { ProgressBar, Spinner } from './progress'

// Extract all package alias names from ts-pkgx
export type PackageAlias = keyof typeof aliases

// Extract all package domain names from ts-pkgx packages
export type PackageDomain = keyof typeof packages

// Union type of all valid package identifiers (aliases + domains)
export type PackageName = PackageAlias | PackageDomain

// Type for package with optional version (allowing string for flexibility)
export type PackageSpec = string

// Supported distribution formats
export type SupportedFormat = 'tar.xz' | 'tar.gz'
export type SupportedPlatform = 'darwin' | 'linux' | 'windows'
export type SupportedArchitecture = 'x86_64' | 'aarch64' | 'armv7l'

/**
 * Distribution configuration
 */
export const DISTRIBUTION_CONFIG = {
  baseUrl: 'https://dist.pkgx.dev',
  // Future: we can switch this to our own endpoint
  // baseUrl: 'https://dist.launchpad.dev',
}

/**
 * Get the installation prefix
 */
export function install_prefix(): Path {
  // Check if there's a configured installation path
  if (config.installPath)
    return new Path(config.installPath)

  // if /usr/local is writable, use that
  if (writable('/usr/local')) {
    return new Path('/usr/local')
  }

  return Path.home().join('.local')
}

/**
 * Check if a directory is writable
 */
function writable(dirPath: string): boolean {
  try {
    fs.accessSync(dirPath, fs.constants.W_OK)
    return true
  }
  catch {
    return false
  }
}

/**
 * Get platform string for distribution
 */
function getPlatform(): SupportedPlatform {
  const os = platform()
  switch (os) {
    case 'darwin': return 'darwin'
    case 'linux': return 'linux'
    case 'win32': return 'windows'
    default: throw new Error(`Unsupported platform: ${os}`)
  }
}

/**
 * Get architecture string for distribution
 */
function getArchitecture(): SupportedArchitecture {
  const nodeArch = arch()
  switch (nodeArch) {
    case 'x64': return 'x86_64'
    case 'arm64': return 'aarch64'
    case 'arm': return 'armv7l'
    default: throw new Error(`Unsupported architecture: ${nodeArch}`)
  }
}

/**
 * Resolves a package name to its canonical domain using ts-pkgx aliases
 */
export function resolvePackageName(packageName: string): string {
  return (aliases as Record<string, string>)[packageName] || packageName
}

/**
 * Gets the latest version for a package
 */
export function getLatestVersion(packageName: string): string | null {
  const domain = resolvePackageName(packageName)
  const domainKey = domain.replace(/[.-]/g, '_') as keyof typeof packages
  const pkg = packages[domainKey]

  if (pkg && 'versions' in pkg && Array.isArray(pkg.versions) && pkg.versions.length > 0) {
    return pkg.versions[0] // versions[0] is always the latest
  }

  return null
}

/**
 * Gets all available versions for a package
 */
export function getAvailableVersions(packageName: string): string[] {
  const domain = resolvePackageName(packageName)
  const domainKey = domain.replace(/[.-]/g, '_') as keyof typeof packages
  const pkg = packages[domainKey]

  if (pkg && 'versions' in pkg && Array.isArray(pkg.versions)) {
    return pkg.versions
  }

  return []
}

/**
 * Checks if a specific version exists for a package
 */
export function isVersionAvailable(packageName: string, version: string): boolean {
  const versions = getAvailableVersions(packageName)
  return versions.includes(version)
}

/**
 * Resolves a version specification to an actual version
 * @param packageName - The package name or alias
 * @param versionSpec - Version specification (e.g., "latest", "^20", "20.1.0", etc.)
 * @returns The resolved version or null if not found
 */
export function resolveVersion(packageName: string, versionSpec?: string): string | null {
  const versions = getAvailableVersions(packageName)

  if (!versions.length) {
    return null
  }

  // If no version specified or "latest", return the latest version
  if (!versionSpec || versionSpec === 'latest') {
    return versions[0] // versions[0] is always the latest
  }

  // If exact version specified, check if it exists
  if (versions.includes(versionSpec)) {
    return versionSpec
  }

  // Handle semver ranges (basic implementation)
  if (versionSpec.startsWith('^')) {
    const majorVersion = versionSpec.slice(1)
    const matchingVersion = versions.find(v => v.startsWith(majorVersion))
    return matchingVersion || null
  }

  if (versionSpec.startsWith('~')) {
    const baseVersion = versionSpec.slice(1)
    const [major, minor] = baseVersion.split('.')
    const matchingVersion = versions.find((v) => {
      const [vMajor, vMinor] = v.split('.')
      return vMajor === major && vMinor === minor
    })
    return matchingVersion || null
  }

  // Try to find a version that starts with the spec (for partial matches)
  const matchingVersion = versions.find(v => v.startsWith(versionSpec))
  return matchingVersion || null
}

/**
 * Returns all available package aliases from ts-pkgx
 */
export function listAvailablePackages(): Array<{ name: PackageAlias, domain: string }> {
  const aliasRecord = aliases as Record<string, string>
  return Object.entries(aliasRecord).map(([name, domain]) => ({
    name: name as PackageAlias,
    domain,
  }))
}

/**
 * Checks if a package name is a known alias
 */
export function isPackageAlias(packageName: string): packageName is PackageAlias {
  return packageName in (aliases as Record<string, string>)
}

/**
 * Type guard to check if a string is a valid package domain
 */
export function isPackageDomain(domain: string): domain is PackageDomain {
  const domainKey = domain.replace(/[.-]/g, '_')
  return domainKey in packages
}

/**
 * Type guard to check if a string is a valid package name (alias or domain)
 */
export function isValidPackageName(name: string): name is PackageName {
  return isPackageAlias(name) || isPackageDomain(name)
}

/**
 * Type-safe function to get all available package aliases
 */
export function getAllPackageAliases(): PackageAlias[] {
  return Object.keys(aliases) as PackageAlias[]
}

/**
 * Type-safe function to get all available package domains
 */
export function getAllPackageDomains(): PackageDomain[] {
  return Object.keys(packages) as PackageDomain[]
}

/**
 * Type-safe function to get all available package names (aliases + domains)
 */
export function getAllPackageNames(): PackageName[] {
  return [...getAllPackageAliases(), ...getAllPackageDomains()]
}

/**
 * Parse a package specification into name and version
 */
export function parsePackageSpec(spec: string): { name: string, version?: string } {
  const atIndex = spec.lastIndexOf('@')
  if (atIndex === -1 || atIndex === 0) {
    return { name: spec }
  }

  const name = spec.slice(0, atIndex)
  const version = spec.slice(atIndex + 1)

  return { name, version: version || undefined }
}

/**
 * Gets package information including description and available versions
 */
export function getPackageInfo(packageName: string): {
  name: string
  domain: string
  description?: string
  latestVersion?: string
  totalVersions: number
  programs?: readonly string[]
  dependencies?: readonly string[]
  companions?: readonly string[]
} | null {
  const domain = resolvePackageName(packageName)
  const domainKey = domain.replace(/[.-]/g, '_') as keyof typeof packages
  const pkg = packages[domainKey]

  if (!pkg) {
    return null
  }

  const versions = 'versions' in pkg && Array.isArray(pkg.versions) ? pkg.versions : []

  return {
    name: 'name' in pkg ? (pkg.name as string) : packageName,
    domain,
    description: 'description' in pkg ? (pkg.description as string) : undefined,
    latestVersion: versions[0] || undefined,
    totalVersions: versions.length,
    programs: 'programs' in pkg ? (pkg.programs as readonly string[]) : undefined,
    dependencies: 'dependencies' in pkg ? (pkg.dependencies as readonly string[]) : undefined,
    companions: 'companions' in pkg ? (pkg.companions as readonly string[]) : undefined,
  }
}

/**
 * Download and extract package
 */
async function downloadPackage(
  domain: string,
  version: string,
  os: SupportedPlatform,
  arch: SupportedArchitecture,
  installPath: string,
): Promise<string[]> {
  const tempDir = path.join(installPath, '.tmp', `${domain}-${version}`)

  try {
    // Create temp directory
    await fs.promises.mkdir(tempDir, { recursive: true })

    // Try different archive formats
    const formats = ['tar.xz', 'tar.gz']
    let downloadUrl: string | null = null
    let archiveFile: string | null = null

    for (const format of formats) {
      const url = `${DISTRIBUTION_CONFIG.baseUrl}/${domain}/${os}/${arch}/v${version}.${format}`
      const file = path.join(tempDir, `package.${format}`)

      try {
        if (config.verbose) {
          console.warn(`Trying to download: ${url}`)
        }

        // Skip actual downloads in test environment
        if (process.env.NODE_ENV === 'test') {
          throw new Error('Network calls disabled in test environment')
        }

        const response = await fetch(url)
        if (response.ok) {
          const contentLength = response.headers.get('content-length')
          const totalBytes = contentLength ? Number.parseInt(contentLength, 10) : 0

          if (!config.verbose && totalBytes > 0) {
            // Show progress bar for downloads
            const progressBar = new ProgressBar(totalBytes, {
              showBytes: true,
              showSpeed: true,
              showETA: true,
            })

            console.log(`📦 Downloading ${domain} v${version}...`)

            const reader = response.body?.getReader()
            if (reader) {
              const chunks: Uint8Array[] = []
              let receivedBytes = 0

              while (true) {
                const { done, value } = await reader.read()
                if (done)
                  break

                if (value) {
                  chunks.push(value)
                  receivedBytes += value.length
                  progressBar.update(receivedBytes, totalBytes)
                }
              }

              progressBar.complete()

              // Combine all chunks into a single buffer
              const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
              const buffer = new Uint8Array(totalLength)
              let offset = 0
              for (const chunk of chunks) {
                buffer.set(chunk, offset)
                offset += chunk.length
              }

              await fs.promises.writeFile(file, buffer)
            }
            else {
              // Fallback for when reader is not available
              const buffer = await response.arrayBuffer()
              await fs.promises.writeFile(file, Buffer.from(buffer))
            }
          }
          else {
            // Fallback for when content-length is not available or verbose mode
            const buffer = await response.arrayBuffer()
            await fs.promises.writeFile(file, Buffer.from(buffer))
          }

          downloadUrl = url
          archiveFile = file
          break
        }
      }
      catch (error) {
        if (config.verbose) {
          console.warn(`Failed to download ${format} format:`, error)
        }
      }
    }

    if (!downloadUrl || !archiveFile) {
      throw new Error(`Failed to download package ${domain} v${version}`)
    }

    if (config.verbose) {
      console.warn(`Downloaded: ${downloadUrl}`)
    }

    // Extract archive
    const extractDir = path.join(tempDir, 'extracted')
    await fs.promises.mkdir(extractDir, { recursive: true })

    const isXz = archiveFile.endsWith('.tar.xz')

    // Show spinner during extraction
    const extractSpinner = new Spinner()
    if (!config.verbose) {
      extractSpinner.start(`🔧 Extracting ${domain} v${version}...`)
    }

    // Use Bun's spawn directly to avoid shell dependency issues
    const tarPath = process.platform === 'win32' ? 'tar' : '/usr/bin/tar'
    const tarArgs = isXz
      ? ['-xf', archiveFile, '-C', extractDir]
      : ['-xzf', archiveFile, '-C', extractDir]

    const proc = Bun.spawn([tarPath, ...tarArgs], {
      cwd: tempDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    const result = await proc.exited

    if (!config.verbose) {
      extractSpinner.stop()
    }

    if (result !== 0) {
      const stderr = await new Response(proc.stderr).text()
      throw new Error(`Failed to extract archive: ${stderr}`)
    }

    if (config.verbose) {
      console.warn(`Extracted to: ${extractDir}`)
    }

    // Find and copy binaries
    const installedFiles: string[] = []
    const binDir = path.join(installPath, 'bin')
    await fs.promises.mkdir(binDir, { recursive: true })

    // Show spinner during installation
    const installSpinner = new Spinner()
    if (!config.verbose) {
      installSpinner.start(`⚡ Installing ${domain} v${version}...`)
    }

    // Look for executables in common locations
    const searchDirs = [
      extractDir,
      path.join(extractDir, 'bin'),
      path.join(extractDir, 'usr', 'bin'),
      path.join(extractDir, 'usr', 'local', 'bin'),
      // pkgx-specific structure: {domain}/v{version}/bin/
      path.join(extractDir, domain, `v${version}`, 'bin'),
    ]

    for (const searchDir of searchDirs) {
      if (!fs.existsSync(searchDir))
        continue

      try {
        const files = await fs.promises.readdir(searchDir)

        for (const file of files) {
          const filePath = path.join(searchDir, file)
          const stat = await fs.promises.stat(filePath)

          // Check if it's an executable file
          if (stat.isFile() && (stat.mode & 0o111)) {
            const targetPath = path.join(binDir, file)
            await fs.promises.copyFile(filePath, targetPath)
            await fs.promises.chmod(targetPath, 0o755)
            installedFiles.push(targetPath)

            if (config.verbose) {
              console.warn(`Installed binary: ${file}`)
            }
          }
        }
      }
      catch (error) {
        if (config.verbose) {
          console.warn(`Error processing directory ${searchDir}:`, error)
        }
      }
    }

    if (!config.verbose) {
      installSpinner.stop(`✅ Successfully installed ${domain} v${version}`)
    }

    // Clean up temp directory
    await fs.promises.rm(tempDir, { recursive: true, force: true })

    return installedFiles
  }
  catch (error) {
    // Clean up on error
    if (fs.existsSync(tempDir)) {
      await fs.promises.rm(tempDir, { recursive: true, force: true })
    }
    throw error
  }
}

/**
 * Main installation function with type-safe package specifications
 */
export async function install(packages: PackageSpec | PackageSpec[], basePath?: string): Promise<string[]> {
  const packageList = Array.isArray(packages) ? packages : [packages]
  const installPath = basePath || install_prefix().string

  // Create installation directory even if no packages to install
  await fs.promises.mkdir(installPath, { recursive: true })

  // If no packages specified, just ensure directory exists and return
  if (packageList.length === 0 || (packageList.length === 1 && !packageList[0])) {
    if (config.verbose) {
      console.warn(`No packages to install, created directory: ${installPath}`)
    }
    return []
  }

  if (config.verbose) {
    console.warn(`Installing packages: ${packageList.join(', ')}`)
    console.warn(`Install path: ${installPath}`)
  }
  else if (packageList.length > 1) {
    console.log(`🚀 Installing ${packageList.length} packages...`)
  }

  const os = getPlatform()
  const architecture = getArchitecture()

  if (config.verbose) {
    console.warn(`Platform: ${os}/${architecture}`)
  }

  const allInstalledFiles: string[] = []

  for (let i = 0; i < packageList.length; i++) {
    const pkg = packageList[i]
    try {
      if (config.verbose) {
        console.warn(`Processing package: ${pkg}`)
      }
      else if (packageList.length > 1) {
        console.log(`📦 [${i + 1}/${packageList.length}] ${pkg}`)
      }

      // Parse package name and version
      const { name: packageName, version: requestedVersion } = parsePackageSpec(pkg)
      const domain = resolvePackageName(packageName)

      if (config.verbose) {
        console.warn(`Resolved ${packageName} to domain: ${domain}`)
      }

      // Get version to install
      let version = requestedVersion
      if (!version) {
        const latestVersion = await getLatestVersion(packageName)
        if (!latestVersion) {
          throw new Error(`No versions found for ${packageName} on ${os}/${architecture}`)
        }
        version = latestVersion
      }

      if (config.verbose) {
        console.warn(`Installing version: ${version}`)
      }

      // Download and install
      const installedFiles = await downloadPackage(domain, version, os, architecture, installPath)
      allInstalledFiles.push(...installedFiles)

      if (config.verbose) {
        console.warn(`Successfully installed ${domain} v${version}`)
      }
    }
    catch (error) {
      console.error(`Failed to install ${pkg}:`, error)
      throw error
    }
  }

  if (config.verbose) {
    console.warn(`Installation complete. Installed ${allInstalledFiles.length} files.`)
  }
  else if (packageList.length > 0) {
    const packageCount = packageList.length
    const fileCount = allInstalledFiles.length
    if (packageCount === 1) {
      console.log(`🎉 Installation complete!`)
    }
    else {
      console.log(`🎉 Successfully installed ${packageCount} packages (${fileCount} files)`)
    }
  }

  return allInstalledFiles
}
