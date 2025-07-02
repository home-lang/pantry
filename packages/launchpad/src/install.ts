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

// Cache configuration for packages
const CACHE_DIR = path.join(process.env.HOME || '.', '.cache', 'launchpad')
const BINARY_CACHE_DIR = path.join(CACHE_DIR, 'binaries', 'packages')
const CACHE_METADATA_FILE = path.join(CACHE_DIR, 'cache-metadata.json')

/**
 * Cache metadata structure
 */
interface CacheMetadata {
  version: string
  packages: Record<string, {
    domain: string
    version: string
    format: string
    downloadedAt: string
    size: number
    checksum?: string
    lastAccessed: string
  }>
}

/**
 * Load cache metadata
 */
function loadCacheMetadata(): CacheMetadata {
  try {
    if (fs.existsSync(CACHE_METADATA_FILE)) {
      const content = fs.readFileSync(CACHE_METADATA_FILE, 'utf-8')
      return JSON.parse(content)
    }
  }
  catch (error) {
    if (config.verbose) {
      console.warn('Failed to load cache metadata:', error)
    }
  }

  return { version: '1.0', packages: {} }
}

/**
 * Save cache metadata
 */
function saveCacheMetadata(metadata: CacheMetadata): void {
  try {
    fs.mkdirSync(path.dirname(CACHE_METADATA_FILE), { recursive: true })
    fs.writeFileSync(CACHE_METADATA_FILE, JSON.stringify(metadata, null, 2))
  }
  catch (error) {
    if (config.verbose) {
      console.warn('Failed to save cache metadata:', error)
    }
  }
}

/**
 * Get cached package archive path for a specific domain and version with validation
 */
function getCachedPackagePath(domain: string, version: string, format: string): string | null {
  const cacheKey = `${domain}-${version}`
  const cachedArchivePath = path.join(BINARY_CACHE_DIR, cacheKey, `package.${format}`)

  if (fs.existsSync(cachedArchivePath)) {
    // Validate cache integrity
    const metadata = loadCacheMetadata()
    const packageMeta = metadata.packages[cacheKey]

    if (packageMeta) {
      // Update last accessed time
      packageMeta.lastAccessed = new Date().toISOString()
      saveCacheMetadata(metadata)

      // Validate file size matches metadata
      const stats = fs.statSync(cachedArchivePath)
      if (stats.size === packageMeta.size) {
        if (config.verbose) {
          console.warn(`Found cached package: ${cachedArchivePath}`)
        }
        return cachedArchivePath
      }
      else {
        if (config.verbose) {
          console.warn(`Cache file corrupted (size mismatch): ${cachedArchivePath}`)
        }
        // Remove corrupted cache
        fs.unlinkSync(cachedArchivePath)
        delete metadata.packages[cacheKey]
        saveCacheMetadata(metadata)
      }
    }
    else {
      // Cache file exists but no metadata - validate basic integrity
      const stats = fs.statSync(cachedArchivePath)
      if (stats.size > 100) { // Basic size check
        if (config.verbose) {
          console.warn(`Found cached package (no metadata): ${cachedArchivePath}`)
        }
        return cachedArchivePath
      }
    }
  }

  return null
}

/**
 * Save package archive to cache with metadata
 */
function savePackageToCache(domain: string, version: string, format: string, sourcePath: string): string {
  const cacheKey = `${domain}-${version}`
  const cachePackageDir = path.join(BINARY_CACHE_DIR, cacheKey)
  const cachedArchivePath = path.join(cachePackageDir, `package.${format}`)

  try {
    // Create cache directory
    fs.mkdirSync(cachePackageDir, { recursive: true })

    // Copy the downloaded file to cache
    fs.copyFileSync(sourcePath, cachedArchivePath)

    // Update metadata
    const metadata = loadCacheMetadata()
    const stats = fs.statSync(cachedArchivePath)

    metadata.packages[cacheKey] = {
      domain,
      version,
      format,
      downloadedAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      size: stats.size,
    }

    saveCacheMetadata(metadata)

    if (config.verbose) {
      console.warn(`Cached package to: ${cachedArchivePath}`)
    }

    return cachedArchivePath
  }
  catch (error) {
    if (config.verbose) {
      console.warn(`Failed to cache package: ${error instanceof Error ? error.message : String(error)}`)
    }
    // Return original path if caching fails
    return sourcePath
  }
}

/**
 * Clean up old cache entries to free disk space
 */
export function cleanupCache(maxAgeDays: number = 30, maxSizeGB: number = 5): void {
  try {
    const metadata = loadCacheMetadata()
    const now = new Date()
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000
    const maxSizeBytes = maxSizeGB * 1024 * 1024 * 1024

    let totalSize = 0
    const packages = Object.entries(metadata.packages)
      .map(([key, pkg]) => ({
        key,
        ...pkg,
        lastAccessedDate: new Date(pkg.lastAccessed),
      }))
      .sort((a, b) => a.lastAccessedDate.getTime() - b.lastAccessedDate.getTime()) // Oldest first

    // Calculate total cache size
    packages.forEach(pkg => totalSize += pkg.size)

    const toDelete: string[] = []

    // Remove packages older than maxAge
    packages.forEach((pkg) => {
      const age = now.getTime() - pkg.lastAccessedDate.getTime()
      if (age > maxAgeMs) {
        toDelete.push(pkg.key)
      }
    })

    // If still over size limit, remove oldest packages
    let currentSize = totalSize
    packages.forEach((pkg) => {
      if (currentSize > maxSizeBytes && !toDelete.includes(pkg.key)) {
        toDelete.push(pkg.key)
        currentSize -= pkg.size
      }
    })

    // Delete marked packages
    toDelete.forEach((key) => {
      const cacheDir = path.join(BINARY_CACHE_DIR, key)
      if (fs.existsSync(cacheDir)) {
        fs.rmSync(cacheDir, { recursive: true, force: true })
        delete metadata.packages[key]
        if (config.verbose) {
          console.warn(`Cleaned up cached package: ${key}`)
        }
      }
    })

    if (toDelete.length > 0) {
      saveCacheMetadata(metadata)
      console.log(`🧹 Cleaned up ${toDelete.length} cached packages`)
    }
  }
  catch (error) {
    if (config.verbose) {
      console.warn('Cache cleanup failed:', error)
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { packages: number, size: string, oldestAccess: string, newestAccess: string } {
  try {
    const metadata = loadCacheMetadata()
    const packages = Object.values(metadata.packages)

    // If we have metadata, use it
    if (packages.length > 0) {
      const totalSize = packages.reduce((sum, pkg) => sum + pkg.size, 0)
      const accessTimes = packages.map(pkg => new Date(pkg.lastAccessed).getTime()).sort()

      const formatSize = (bytes: number): string => {
        if (bytes < 1024)
          return `${bytes} B`
        if (bytes < 1024 * 1024)
          return `${(bytes / 1024).toFixed(1)} KB`
        if (bytes < 1024 * 1024 * 1024)
          return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
      }

      return {
        packages: packages.length,
        size: formatSize(totalSize),
        oldestAccess: new Date(accessTimes[0]).toLocaleDateString(),
        newestAccess: new Date(accessTimes[accessTimes.length - 1]).toLocaleDateString(),
      }
    }

    // Fallback: scan actual cache directories for files
    const packageCacheDir = path.join(CACHE_DIR, 'binaries', 'packages')
    const bunCacheDir = path.join(CACHE_DIR, 'binaries', 'bun')

    let totalFiles = 0
    let totalSize = 0
    let oldestTime = Date.now()
    let newestTime = 0

    const formatSize = (bytes: number): string => {
      if (bytes < 1024)
        return `${bytes} B`
      if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`
      if (bytes < 1024 * 1024 * 1024)
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    }

    // Scan package cache
    if (fs.existsSync(packageCacheDir)) {
      const packageDirs = fs.readdirSync(packageCacheDir)
      for (const dir of packageDirs) {
        const dirPath = path.join(packageCacheDir, dir)
        if (fs.statSync(dirPath).isDirectory()) {
          const files = fs.readdirSync(dirPath)
          totalFiles += files.length

          for (const file of files) {
            const filePath = path.join(dirPath, file)
            const stats = fs.statSync(filePath)
            totalSize += stats.size

            const mtime = stats.mtime.getTime()
            if (mtime < oldestTime)
              oldestTime = mtime
            if (mtime > newestTime)
              newestTime = mtime
          }
        }
      }
    }

    // Scan bun cache
    if (fs.existsSync(bunCacheDir)) {
      const bunFiles = fs.readdirSync(bunCacheDir)
      for (const file of bunFiles) {
        const filePath = path.join(bunCacheDir, file)
        if (fs.statSync(filePath).isFile()) {
          totalFiles++
          const stats = fs.statSync(filePath)
          totalSize += stats.size

          const mtime = stats.mtime.getTime()
          if (mtime < oldestTime)
            oldestTime = mtime
          if (mtime > newestTime)
            newestTime = mtime
        }
      }
    }

    return {
      packages: totalFiles,
      size: formatSize(totalSize),
      oldestAccess: totalFiles > 0 ? new Date(oldestTime).toLocaleDateString() : 'N/A',
      newestAccess: totalFiles > 0 ? new Date(newestTime).toLocaleDateString() : 'N/A',
    }
  }
  catch {
    return { packages: 0, size: 'Error', oldestAccess: 'Error', newestAccess: 'Error' }
  }
}

/**
 * Get the installation prefix
 */
export function install_prefix(): Path {
  // Check for test environment override first
  if (process.env.LAUNCHPAD_PREFIX) {
    return new Path(process.env.LAUNCHPAD_PREFIX)
  }

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
  const domainKey = domain.replace(/[^a-z0-9]/gi, '').toLowerCase() as keyof typeof packages
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
  const domainKey = domain.replace(/[^a-z0-9]/gi, '').toLowerCase() as keyof typeof packages
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

  // Use Bun's semver for fast and accurate version resolution
  if (typeof Bun !== 'undefined' && Bun.semver) {
    try {
      // Find the best matching version using Bun's semver.satisfies
      // Sort versions in descending order to get the latest compatible version first
      const sortedVersions = [...versions].sort((a, b) => Bun.semver.order(b, a))

      for (const version of sortedVersions) {
        try {
          if (Bun.semver.satisfies(version, versionSpec)) {
            return version
          }
        }
        catch {
          // Skip individual version if it can't be parsed by Bun.semver
          // This handles cases like "1.1.1w" that aren't standard semver
          continue
        }
      }

      // If Bun.semver didn't find a match, fall through to manual parsing
      // This is important for non-standard version formats
    }
    catch (error) {
      // Fallback to manual parsing if Bun.semver fails
      if (config.verbose) {
        console.warn(`Bun.semver failed for ${versionSpec}, falling back to manual parsing: ${error}`)
      }
    }
  }

  // Enhanced manual semver-like parsing for non-Bun environments or when Bun.semver fails
  if (versionSpec.startsWith('^')) {
    const baseVersion = versionSpec.slice(1)
    const [major, minor, patch] = baseVersion.split('.')

    // For caret ranges, find the latest version compatible with the major version
    // ^1.21 means >=1.21.0 <2.0.0
    // ^1.21.3 means >=1.21.3 <2.0.0
    const matchingVersion = versions.find((v) => {
      // Handle non-standard version formats by extracting numeric parts
      const versionParts = v.split('.')
      if (versionParts.length < 2)
        return false

      const vMajor = versionParts[0]
      const vMinor = versionParts[1]
      const vPatch = versionParts[2] || '0'

      // Must have same major version
      if (vMajor !== major)
        return false

      // If only major specified (e.g., ^1), any version with same major works
      if (!minor)
        return true

      // If minor specified, check minor version constraint
      // Extract numeric part from version components to handle suffixes like "1w"
      const vMinorNum = Number.parseInt(vMinor || '0', 10)
      const minorNum = Number.parseInt(minor, 10)

      // Skip if we can't parse the version numbers
      if (Number.isNaN(vMinorNum) || Number.isNaN(minorNum))
        return false

      // Minor version must be >= specified minor
      if (vMinorNum < minorNum)
        return false

      // If patch specified, check patch version constraint when minor versions are equal
      if (patch && vMinorNum === minorNum) {
        // Extract numeric part from patch version to handle suffixes
        const vPatchNum = Number.parseInt(vPatch || '0', 10)
        const patchNum = Number.parseInt(patch, 10)

        // Skip if we can't parse the patch numbers
        if (Number.isNaN(vPatchNum) || Number.isNaN(patchNum))
          return false

        return vPatchNum >= patchNum
      }

      return true
    })
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

  // Handle range specifications like "1.0.0 - 2.0.0"
  if (versionSpec.includes(' - ')) {
    if (typeof Bun !== 'undefined' && Bun.semver) {
      try {
        const sortedVersions = [...versions].sort((a, b) => Bun.semver.order(b, a))
        for (const version of sortedVersions) {
          try {
            if (Bun.semver.satisfies(version, versionSpec)) {
              return version
            }
          }
          catch {
            // Skip versions that can't be parsed
            continue
          }
        }
      }
      catch {
        // Fallback to simple string comparison
      }
    }

    const [minVersion, maxVersion] = versionSpec.split(' - ')
    const matchingVersion = versions.find((v) => {
      // Simple string comparison - for proper semver, this would need more logic
      return v >= minVersion && v <= maxVersion
    })
    return matchingVersion || null
  }

  // Handle x.x.x patterns
  if (versionSpec.includes('x') || versionSpec.includes('X')) {
    const pattern = versionSpec.toLowerCase().replace(/x/g, '\\d+')
    const regex = new RegExp(`^${pattern}$`)
    const matchingVersion = versions.find(v => regex.test(v))
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
  const domainKey = domain.replace(/[^a-z0-9]/gi, '').toLowerCase()
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
 * Handles both standard format (package@version) and dependency format (domain^version)
 */
export function parsePackageSpec(spec: string): { name: string, version?: string } {
  // First try standard format with @ separator
  const atIndex = spec.lastIndexOf('@')
  if (atIndex !== -1 && atIndex !== 0) {
    const name = spec.slice(0, atIndex)
    const version = spec.slice(atIndex + 1)
    return { name, version: version || undefined }
  }

  // Then try dependency format with ^ separator (e.g., openssl.org^1.1)
  const caretIndex = spec.indexOf('^')
  if (caretIndex !== -1 && caretIndex !== 0) {
    const name = spec.slice(0, caretIndex)
    const version = spec.slice(caretIndex) // Include the ^ in the version
    return { name, version: version || undefined }
  }

  // Then try dependency format with ~ separator (e.g., package~1.0)
  const tildeIndex = spec.indexOf('~')
  if (tildeIndex !== -1 && tildeIndex !== 0) {
    const name = spec.slice(0, tildeIndex)
    const version = spec.slice(tildeIndex) // Include the ~ in the version
    return { name, version: version || undefined }
  }

  // No version separator found, treat as package name only
  return { name: spec }
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
  // Use the same domain key conversion logic as ts-pkgx
  const domainKey = domain.replace(/[^a-z0-9]/gi, '').toLowerCase() as keyof typeof packages
  const pkg = packages[domainKey]

  if (!pkg) {
    return null
  }

  const versions = 'versions' in pkg && Array.isArray(pkg.versions) ? pkg.versions : []

  return {
    name: 'name' in pkg ? (pkg.name as string) : packageName,
    domain: 'domain' in pkg ? (pkg.domain as string) : domain,
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

    // Try different archive formats, checking cache first
    const formats = ['tar.xz', 'tar.gz']
    let downloadUrl: string | null = null
    let archiveFile: string | null = null
    let usedCache = false

    for (const format of formats) {
      // Check if we have a cached version first
      const cachedArchivePath = getCachedPackagePath(domain, version, format)

      if (cachedArchivePath) {
        // Use cached version
        if (config.verbose) {
          console.warn(`Using cached ${domain} v${version} from: ${cachedArchivePath}`)
        }
        else {
          console.log(`📦 Using cached ${domain} v${version}...`)
        }

        // Copy cached file to temp directory
        archiveFile = path.join(tempDir, `package.${format}`)
        fs.copyFileSync(cachedArchivePath, archiveFile)
        downloadUrl = `cached:${cachedArchivePath}` // Mark as cached
        usedCache = true
        break
      }

      // If not cached, try to download
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

          // Cache the downloaded file for future use
          savePackageToCache(domain, version, format, file)

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

    if (config.verbose && !usedCache) {
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

    // Find the actual package root in the extracted directory
    async function findPackageRoot(extractDir: string, domain: string, version: string): Promise<string> {
      // Common package layouts to try:
      const candidates = [
        // Direct pkgx format: {domain}/v{version}/
        path.join(extractDir, domain, `v${version}`),
        // Direct extracted content
        extractDir,
        // Sometimes there's a single subdirectory
        ...(await fs.promises.readdir(extractDir)).map(dir => path.join(extractDir, dir)),
      ]

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          // Check if this looks like a package root (has bin, lib, or similar)
          const entries = await fs.promises.readdir(candidate, { withFileTypes: true })
          const hasPackageStructure = entries.some(entry =>
            entry.isDirectory() && ['bin', 'lib', 'include', 'share', 'sbin'].includes(entry.name),
          )

          if (hasPackageStructure) {
            if (config.verbose) {
              console.warn(`Found package root at: ${candidate}`)
            }
            return candidate
          }
        }
      }

      // Fallback to the extract directory
      if (config.verbose) {
        console.warn(`Using fallback package root: ${extractDir}`)
      }
      return extractDir
    }

    // Create pkgx-compatible directory structure: {installPath}/{domain}/v{version}/
    const packageDir = path.join(installPath, domain, `v${version}`)
    await fs.promises.mkdir(packageDir, { recursive: true })

    // Create metadata tracking directory
    const metadataDir = path.join(installPath, 'pkgs', domain, `v${version}`)
    await fs.promises.mkdir(metadataDir, { recursive: true })

    // Show spinner during installation
    const installSpinner = new Spinner()
    if (!config.verbose) {
      installSpinner.start(`⚡ Installing ${domain} v${version}...`)
    }

    // Find the actual package root in the extracted directory
    const packageSource = await findPackageRoot(extractDir, domain, version)

    // Copy the entire package structure (bin, lib, include, share, etc.)
    await copyDirectoryStructure(packageSource, packageDir)

    // Create missing library symlinks for dynamic linking
    async function createLibrarySymlinks(packageDir: string): Promise<void> {
      const libDir = path.join(packageDir, 'lib')

      if (!fs.existsSync(libDir)) {
        return
      }

      try {
        const files = await fs.promises.readdir(libDir)

        for (const file of files) {
          // Look for versioned libraries like libssl.1.1.dylib, libz.1.3.1.dylib
          const versionedMatch = file.match(/^(lib\w+)\.(\d+(?:\.\d+)*)\.dylib$/)
          if (versionedMatch) {
            const [, baseName, version] = versionedMatch
            const majorVersion = version.split('.')[0]

            // Create symlinks: libssl.dylib -> libssl.1.1.dylib
            const genericLink = `${baseName}.dylib`
            const majorLink = `${baseName}.${majorVersion}.dylib`

            const genericPath = path.join(libDir, genericLink)
            const majorPath = path.join(libDir, majorLink)

            // Create generic symlink if it doesn't exist
            if (!fs.existsSync(genericPath)) {
              try {
                await fs.promises.symlink(file, genericPath)
                if (config.verbose) {
                  console.warn(`Created library symlink: ${genericLink} -> ${file}`)
                }
              }
              catch (error) {
                if (config.verbose) {
                  console.warn(`Failed to create symlink ${genericLink}:`, error)
                }
              }
            }

            // Create major version symlink if it doesn't exist and is different from generic
            if (majorLink !== genericLink && !fs.existsSync(majorPath)) {
              try {
                await fs.promises.symlink(file, majorPath)
                if (config.verbose) {
                  console.warn(`Created library symlink: ${majorLink} -> ${file}`)
                }
              }
              catch (error) {
                if (config.verbose) {
                  console.warn(`Failed to create symlink ${majorLink}:`, error)
                }
              }
            }
          }
        }
      }
      catch (error) {
        if (config.verbose) {
          console.warn(`Error creating library symlinks in ${libDir}:`, error)
        }
      }
    }

    await createLibrarySymlinks(packageDir)

    // Create version symlinks like pkgx does
    await createVersionSymlinks(installPath, domain, version)

    // Create version compatibility symlinks for packages that expect different version paths
    // This handles cases where a package built for openssl.org/v1 needs to work with openssl.org/v3
    await createVersionCompatibilitySymlinks(installPath, domain, version)

    // Find binaries and create shims
    const installedBinaries = await createShims(packageDir, installPath, domain, version)

    // Create package metadata for tracking
    const metadata = {
      domain,
      version,
      installedAt: new Date().toISOString(),
      binaries: installedBinaries,
      installPath: packageDir,
    }

    await fs.promises.writeFile(
      path.join(metadataDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2),
    )

    if (!config.verbose) {
      installSpinner.stop()
    }

    // Clean up temp directory
    await fs.promises.rm(tempDir, { recursive: true, force: true })

    // Return paths for both bin and sbin binaries
    const binaryPaths: string[] = []

    // Check for binaries in both bin and sbin directories
    const binDir = path.join(packageDir, 'bin')
    const sbinDir = path.join(packageDir, 'sbin')

    for (const binary of installedBinaries) {
      // Check if binary exists in bin directory
      if (fs.existsSync(path.join(binDir, binary))) {
        binaryPaths.push(path.join(installPath, 'bin', binary))
      }
      // Check if binary exists in sbin directory
      else if (fs.existsSync(path.join(sbinDir, binary))) {
        binaryPaths.push(path.join(installPath, 'sbin', binary))
      }
      else {
        // Default to bin if we can't determine location
        binaryPaths.push(path.join(installPath, 'bin', binary))
      }
    }

    return binaryPaths
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
 * Copy directory structure preserving the layout
 */
async function copyDirectoryStructure(source: string, target: string): Promise<void> {
  await fs.promises.mkdir(target, { recursive: true })

  const entries = await fs.promises.readdir(source, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)

    if (entry.isDirectory()) {
      await copyDirectoryStructure(sourcePath, targetPath)
    }
    else if (entry.isFile()) {
      try {
        await fs.promises.copyFile(sourcePath, targetPath)

        // Preserve executable permissions
        const stat = await fs.promises.stat(sourcePath)
        await fs.promises.chmod(targetPath, stat.mode)
      }
      catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
          // Permission denied - try to continue with other files
          if (config.verbose) {
            console.warn(`Permission denied copying ${entry.name}, skipping...`)
          }
          continue
        }
        throw error
      }
    }
  }
}

/**
 * Create version symlinks like pkgx: v1 -> v1.3.1, v* -> v1.3.1
 */
async function createVersionSymlinks(installPath: string, domain: string, version: string): Promise<void> {
  const domainDir = path.join(installPath, domain)
  const versionDir = `v${version}`

  // Parse semantic version for creating major/minor symlinks
  const versionParts = version.split('.')
  const major = versionParts[0]
  const minor = `${major}.${versionParts[1] || '0'}`

  const symlinks = [
    { link: 'v*', target: versionDir },
    { link: `v${major}`, target: versionDir },
  ]

  // Add minor version symlink if it's different from major
  if (minor !== major) {
    symlinks.push({ link: `v${minor}`, target: versionDir })
  }

  for (const { link, target } of symlinks) {
    const linkPath = path.join(domainDir, link)

    try {
      // Remove existing symlink if it exists
      if (fs.existsSync(linkPath)) {
        await fs.promises.unlink(linkPath)
      }

      await fs.promises.symlink(target, linkPath)

      if (config.verbose) {
        console.warn(`Created symlink: ${link} -> ${target}`)
      }
    }
    catch (error) {
      if (config.verbose) {
        console.warn(`Failed to create symlink ${link} -> ${target}:`, error)
      }
    }
  }
}

/**
 * Create shims in bin directory that point to the actual binaries
 */
async function createShims(packageDir: string, installPath: string, domain: string, version: string): Promise<string[]> {
  const shimDir = path.join(installPath, 'bin')
  await fs.promises.mkdir(shimDir, { recursive: true })

  // Also create sbin directory for system binaries
  const sbinShimDir = path.join(installPath, 'sbin')
  await fs.promises.mkdir(sbinShimDir, { recursive: true })

  const installedBinaries: string[] = []

  // Check both bin and sbin directories for binaries
  const binaryDirs = [
    { sourceDir: path.join(packageDir, 'bin'), shimDir },
    { sourceDir: path.join(packageDir, 'sbin'), shimDir: sbinShimDir },
  ]

  for (const { sourceDir, shimDir: targetShimDir } of binaryDirs) {
    if (!fs.existsSync(sourceDir)) {
      continue
    }

    const binaries = await fs.promises.readdir(sourceDir)

    for (const binary of binaries) {
      const binaryPath = path.join(sourceDir, binary)
      const stat = await fs.promises.stat(binaryPath)

      // Check if it's an executable file
      if (stat.isFile() && (stat.mode & 0o111)) {
        const shimPath = path.join(targetShimDir, binary)

        // Create a shell script shim that sets up the environment
        const shimContent = `#!/bin/sh
# Launchpad shim for ${binary} (${domain} v${version})
exec "${binaryPath}" "$@"
`

        await fs.promises.writeFile(shimPath, shimContent)
        await fs.promises.chmod(shimPath, 0o755)

        installedBinaries.push(binary)

        if (config.verbose) {
          console.warn(`Created shim: ${binary} -> ${binaryPath}`)
        }
      }
    }
  }

  return installedBinaries
}

/**
 * Create version compatibility symlinks for packages that expect different version paths
 * This handles cases where a package built for openssl.org/v1 needs to work with openssl.org/v3
 */
async function createVersionCompatibilitySymlinks(installPath: string, domain: string, version: string): Promise<void> {
  const packageDir = path.join(installPath, domain)
  const versionDir = path.join(packageDir, `v${version}`)

  if (!fs.existsSync(versionDir)) {
    return
  }

  // Define compatibility mappings for common version mismatches
  const versionCompatibility: Record<string, string[]> = {
    'openssl.org': ['v1', 'v1.1', 'v1.0'], // OpenSSL v3 should be compatible with v1.x expectations
    'libssl': ['v1', 'v1.1'],
    'libcrypto': ['v1', 'v1.1'],
  }

  const compatVersions = versionCompatibility[domain] || []

  for (const compatVersion of compatVersions) {
    const compatDir = path.join(packageDir, compatVersion)

    // Only create symlink if the compat version doesn't already exist
    if (!fs.existsSync(compatDir)) {
      try {
        // Create symlink from compat version to actual version
        await fs.promises.symlink(`v${version}`, compatDir)
        if (config.verbose) {
          console.warn(`Created compatibility symlink: ${compatVersion} -> v${version} for ${domain}`)
        }
      }
      catch (error) {
        if (config.verbose) {
          console.warn(`Failed to create compatibility symlink for ${domain}: ${error}`)
        }
      }
    }
  }
}

/**
 * Resolves and installs package dependencies recursively
 */
async function installDependencies(
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

  for (const dep of packageInfo.dependencies) {
    const { name: depName, version: depVersion } = parsePackageSpec(dep)
    const depDomain = resolvePackageName(depName)

    // Skip known problematic packages silently to reduce noise
    if (knownProblematicPackages.has(depDomain) || knownProblematicPackages.has(depName)) {
      if (config.verbose) {
        console.warn(`Skipping known problematic dependency: ${depName}`)
      }
      continue
    }

    // Skip if already installed to avoid circular dependencies
    if (installedPackages.has(depDomain)) {
      if (config.verbose) {
        console.warn(`Skipping ${depDomain} - already installed`)
      }
      continue
    }

    // Mark as installed to prevent cycles
    installedPackages.add(depDomain)

    try {
      if (config.verbose) {
        console.warn(`Installing dependency: ${dep}`)
      }
      else {
        console.log(`📦 Installing dependency: ${depName}`)
      }

      // Enhanced version resolution with multiple fallback strategies
      let versionToInstall = depVersion
      if (!versionToInstall) {
        // Strategy: Get latest version if no version specified
        versionToInstall = getLatestVersion(depName) || undefined
      }
      else {
        // Strategy 1: Try to resolve the version constraint to an actual version
        const resolvedVersion = resolveVersion(depName, depVersion)
        if (resolvedVersion) {
          versionToInstall = resolvedVersion
        }
        else {
          // Enhanced fallback strategies for version mismatch scenarios
          if (config.verbose) {
            console.warn(`Cannot resolve version constraint ${depVersion} for ${depName}, trying enhanced fallback strategies`)
          }

          // Strategy 2: For caret constraints (^1.1), try to find any compatible major version
          if (depVersion && depVersion.startsWith('^')) {
            const requestedMajor = depVersion.slice(1).split('.')[0]
            const availableVersions = getAvailableVersions(depName)

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
                    '^1.1': ['3.5.0', '3.4.0', '3.3.2'], // OpenSSL 3.x is backward compatible with 1.x APIs
                    '^1.0': ['3.5.0', '3.4.0', '3.3.2'],
                  },
                  'zlib.net': {
                    '^1.2': ['1.3.1', '1.3.0'], // zlib 1.3.x is compatible with 1.2.x
                  },
                }

                const compatibleVersions = versionCompatibilityMap[depDomain]?.[depVersion]
                if (compatibleVersions) {
                  // Find the first available compatible version
                  const compatibleVersion = compatibleVersions.find((v: string) => availableVersions.includes(v))
                  if (compatibleVersion) {
                    versionToInstall = compatibleVersion
                    if (config.verbose) {
                      console.warn(`Using compatible version ${compatibleVersion} for ${depName}@${depVersion} (known compatibility mapping)`)
                    }
                  }
                  else {
                    // Strategy 4: Use latest available version as last resort
                    versionToInstall = availableVersions[0] // First version is always the latest
                    if (config.verbose) {
                      console.warn(`Using latest available version ${versionToInstall} for ${depName}@${depVersion} (fallback compatibility)`)
                    }
                  }
                }
                else {
                  // Strategy 4: Use latest available version as last resort
                  versionToInstall = availableVersions[0] // First version is always the latest
                  if (config.verbose) {
                    console.warn(`Using latest available version ${versionToInstall} for ${depName}@${depVersion} (no compatible major version found)`)
                  }
                }
              }
            }
          }
          else {
            // Strategy 5: For non-caret constraints, try to get latest version
            const latestVersion = getLatestVersion(depName)
            if (latestVersion) {
              if (config.verbose) {
                console.warn(`Using latest version ${latestVersion} for ${depName} instead of ${depVersion}`)
              }
              versionToInstall = latestVersion
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
                versionToInstall = aliasLatest
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
          // Only show warning for direct dependencies, not nested ones
          const isDirectDependency = packageInfo.dependencies.includes(dep)
          if (isDirectDependency) {
            console.log(`⚠️  Warning: No suitable version found for dependency ${depName}, skipping...`)
          }
        }
        continue
      }

      // Recursively install dependencies of this dependency
      const nestedFiles = await installDependencies(depName, installPath, installedPackages)
      allInstalledFiles.push(...nestedFiles)

      // Install the dependency itself with the resolved version
      const depSpec = versionToInstall ? `${depName}@${versionToInstall}` : depName
      const depFiles = await installPackage(depName, depSpec, installPath)
      allInstalledFiles.push(...depFiles)
    }
    catch (error) {
      if (config.verbose) {
        console.warn(`Warning: Failed to install dependency ${dep}: ${error instanceof Error ? error.message : String(error)}`)
      }
      else {
        // Only show warning for permission errors or direct dependencies
        const isPermissionError = error instanceof Error && error.message.includes('EACCES')
        const isDirectDependency = packageInfo.dependencies.includes(dep)

        if (isPermissionError || isDirectDependency) {
          console.log(`⚠️  Warning: Failed to install dependency ${depName}, but continuing...`)
        }
      }
      // Continue with other dependencies even if one fails
    }
  }

  return allInstalledFiles
}

/**
 * Install a single package without dependencies (extracted from main install function)
 */
async function installPackage(packageName: string, packageSpec: string, installPath: string): Promise<string[]> {
  const os = getPlatform()
  const architecture = getArchitecture()

  // Parse package name and version
  const { name, version: requestedVersion } = parsePackageSpec(packageSpec)
  const domain = resolvePackageName(name)

  if (config.verbose) {
    console.warn(`Resolved ${name} to domain: ${domain}`)
  }

  // Get version to install
  let version = requestedVersion
  if (!version) {
    const latestVersion = getLatestVersion(name)
    if (!latestVersion) {
      throw new Error(`No versions found for ${name} on ${os}/${architecture}`)
    }
    version = latestVersion
  }
  else {
    // Resolve version constraints (e.g., ^1.21, ~2.0, latest) to actual versions
    const resolvedVersion = resolveVersion(name, version)
    if (!resolvedVersion) {
      throw new Error(`No suitable version found for ${name}@${version}`)
    }
    version = resolvedVersion
  }

  if (config.verbose) {
    console.warn(`Installing ${domain} version: ${version}`)
  }

  // Download and install
  const installedFiles = await downloadPackage(domain, version, os, architecture, installPath)

  if (config.verbose) {
    console.warn(`Successfully installed ${domain} v${version}`)
  }

  return installedFiles
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

  const allInstalledFiles: string[] = []
  const installedPackages = new Set<string>()

  // For multiple packages, use parallel installation with controlled concurrency
  if (packageList.length > 1) {
    const maxConcurrency = Math.min(packageList.length, 3) // Limit to 3 concurrent downloads
    const results = await installPackagesInParallel(packageList, installPath, maxConcurrency)

    results.forEach((result) => {
      if (result.success) {
        allInstalledFiles.push(...result.files)
      }
      else {
        console.error(`❌ Failed to install ${result.package}: ${result.error}`)
        throw new Error(`Installation failed for ${result.package}: ${result.error}`)
      }
    })
  }
  else {
    // Single package installation (existing logic)
    for (let i = 0; i < packageList.length; i++) {
      const pkg = packageList[i]
      try {
        if (config.verbose) {
          console.warn(`Processing package: ${pkg}`)
        }
        else if (packageList.length > 1) {
          console.log(`📦 [${i + 1}/${packageList.length}] ${pkg}`)
        }

        const { name: packageName } = parsePackageSpec(pkg)
        const domain = resolvePackageName(packageName)

        // Skip if already installed
        if (installedPackages.has(domain)) {
          if (config.verbose) {
            console.warn(`Skipping ${domain} - already installed`)
          }
          continue
        }

        // Mark as installed
        installedPackages.add(domain)

        // Install dependencies first
        if (config.verbose) {
          console.warn(`Installing dependencies for ${packageName}...`)
        }
        const depFiles = await installDependencies(packageName, installPath, installedPackages)
        allInstalledFiles.push(...depFiles)

        // Install the main package
        const mainFiles = await installPackage(packageName, pkg, installPath)
        allInstalledFiles.push(...mainFiles)

        if (config.verbose) {
          console.warn(`Successfully processed ${pkg}`)
        }
      }
      catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        // Check if it's a permission error
        if (error instanceof Error && (errorMessage.includes('EACCES') || errorMessage.includes('permission denied'))) {
          console.error(`❌ Permission denied installing ${pkg}. Try:`)
          console.error(`   • Run with sudo: sudo launchpad install ${pkg}`)
          console.error(`   • Or install to user directory: launchpad install --path ~/.local ${pkg}`)
          console.error(`   • Or fix permissions: sudo chown -R $(whoami) ${installPath}`)
        }
        else {
          console.error(`❌ Failed to install ${pkg}: ${errorMessage}`)
        }
        throw error
      }
    }
  }

  if (config.verbose) {
    console.warn(`Installation complete. Installed ${allInstalledFiles.length} files.`)
  }

  return allInstalledFiles
}

/**
 * Install multiple packages in parallel with controlled concurrency
 */
async function installPackagesInParallel(
  packages: string[],
  installPath: string,
  maxConcurrency: number,
): Promise<Array<{ package: string, success: boolean, files: string[], error?: string }>> {
  const results: Array<{ package: string, success: boolean, files: string[], error?: string }> = []
  const installedPackages = new Set<string>()

  // Process packages in batches to control concurrency
  for (let i = 0; i < packages.length; i += maxConcurrency) {
    const batch = packages.slice(i, i + maxConcurrency)

    const batchPromises = batch.map(async (pkg, batchIndex) => {
      const globalIndex = i + batchIndex
      try {
        if (!config.verbose) {
          console.log(`📦 [${globalIndex + 1}/${packages.length}] ${pkg}`)
        }

        const { name: packageName } = parsePackageSpec(pkg)
        const domain = resolvePackageName(packageName)

        // Skip if already installed
        if (installedPackages.has(domain)) {
          if (config.verbose) {
            console.warn(`Skipping ${domain} - already installed`)
          }
          return { package: pkg, success: true, files: [] }
        }

        // Mark as installed
        installedPackages.add(domain)

        // Install dependencies first
        const depFiles = await installDependencies(packageName, installPath, installedPackages)

        // Install the main package
        const mainFiles = await installPackage(packageName, pkg, installPath)

        const allFiles = [...depFiles, ...mainFiles]

        if (config.verbose) {
          console.warn(`Successfully processed ${pkg}`)
        }

        return { package: pkg, success: true, files: allFiles }
      }
      catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        return { package: pkg, success: false, files: [], error: errorMessage }
      }
    })

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
  }

  return results
}

/**
 * Download with resumption support for interrupted downloads
 */
async function _downloadWithResumption(
  url: string,
  destination: string,
  expectedSize?: number,
): Promise<void> {
  const maxRetries = 3
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      // Check if partial file exists
      let startByte = 0
      if (fs.existsSync(destination)) {
        const stats = fs.statSync(destination)
        startByte = stats.size

        // If file is complete, skip download
        if (expectedSize && startByte >= expectedSize) {
          if (config.verbose) {
            console.warn(`File already complete: ${destination}`)
          }
          return
        }
      }

      const headers: Record<string, string> = {
        'User-Agent': 'launchpad/1.0.0',
      }

      // Add range header for resumption
      if (startByte > 0) {
        headers.Range = `bytes=${startByte}-`
        if (config.verbose) {
          console.warn(`Resuming download from byte ${startByte}`)
        }
      }

      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Handle partial content response
      if (response.status === 206 && startByte > 0) {
        // Append to existing file
        const buffer = await response.arrayBuffer()
        fs.appendFileSync(destination, new Uint8Array(buffer))
      }
      else {
        // Write new file
        const buffer = await response.arrayBuffer()
        fs.writeFileSync(destination, new Uint8Array(buffer))
      }

      // Verify download if expected size is known
      if (expectedSize) {
        const actualSize = fs.statSync(destination).size
        if (actualSize !== expectedSize) {
          throw new Error(`Download size mismatch: expected ${expectedSize}, got ${actualSize}`)
        }
      }

      if (config.verbose) {
        console.warn(`Download completed: ${destination}`)
      }

      return
    }
    catch (error) {
      attempt++

      if (attempt >= maxRetries) {
        // Clean up partial file on final failure
        if (fs.existsSync(destination)) {
          fs.unlinkSync(destination)
        }
        throw new Error(`Download failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`)
      }

      if (config.verbose) {
        console.warn(`Download attempt ${attempt} failed, retrying: ${error instanceof Error ? error.message : String(error)}`)
      }

      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 1000))
    }
  }
}
