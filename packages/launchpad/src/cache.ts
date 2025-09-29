/* eslint-disable no-console */
import type { CacheMetadata } from './types'
import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { config } from './config'

// Cache configuration for packages
const CACHE_DIR = path.join(homedir(), '.cache', 'launchpad')
const BINARY_CACHE_DIR = path.join(CACHE_DIR, 'binaries', 'packages')
const CACHE_METADATA_FILE = path.join(CACHE_DIR, 'cache-metadata.json')

/**
 * Load cache metadata
 */
export function loadCacheMetadata(): CacheMetadata {
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
export function saveCacheMetadata(metadata: CacheMetadata): void {
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
export function getCachedPackagePath(domain: string, version: string, format: string): string | null {
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
export function savePackageToCache(domain: string, version: string, format: string, sourcePath: string): string {
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
