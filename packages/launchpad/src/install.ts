import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import { arch, platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { aliases, packages } from 'ts-pkgx'
import { config } from './config'
import { Path } from './path'

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
function getPlatform(): string {
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
function getArchitecture(): string {
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
  const alias = aliases.find(a => a.name === packageName)
  return alias ? alias.domain : packageName
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
export function listAvailablePackages(): Array<{ name: string, domain: string }> {
  return aliases
}

/**
 * Checks if a package name is a known alias
 */
export function isPackageAlias(packageName: string): boolean {
  return aliases.some(alias => alias.name === packageName)
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
    name: 'name' in pkg ? pkg.name : packageName,
    domain,
    description: 'description' in pkg ? pkg.description : undefined,
    latestVersion: versions[0] || undefined,
    totalVersions: versions.length,
    programs: 'programs' in pkg ? pkg.programs : undefined,
    dependencies: 'dependencies' in pkg ? pkg.dependencies : undefined,
    companions: 'companions' in pkg ? pkg.companions : undefined,
  }
}

/**
 * Download and extract package
 */
async function downloadPackage(
  domain: string,
  version: string,
  os: string,
  arch: string,
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
          const buffer = await response.arrayBuffer()
          await fs.promises.writeFile(file, Buffer.from(buffer))
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
 * Main installation function
 */
export async function install(packages: string | string[], basePath?: string): Promise<string[]> {
  const packageList = Array.isArray(packages) ? packages : [packages]
  const installPath = basePath || install_prefix().string

  // Create installation directory even if no packages to install
  await fs.promises.mkdir(installPath, { recursive: true })

  // If no packages specified, just ensure directory exists and return
  if (packageList.length === 0 || (packageList.length === 1 && packageList[0] === '')) {
    if (config.verbose) {
      console.warn(`No packages to install, created directory: ${installPath}`)
    }
    return []
  }

  if (config.verbose) {
    console.warn(`Installing packages: ${packageList.join(', ')}`)
    console.warn(`Install path: ${installPath}`)
  }

  const os = getPlatform()
  const architecture = getArchitecture()

  if (config.verbose) {
    console.warn(`Platform: ${os}/${architecture}`)
  }

  const allInstalledFiles: string[] = []

  for (const pkg of packageList) {
    try {
      if (config.verbose) {
        console.warn(`Processing package: ${pkg}`)
      }

      // Parse package name and version
      const [packageName, requestedVersion] = pkg.split('@')
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

  return allInstalledFiles
}
