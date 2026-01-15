/**
 * Zig Package Support
 *
 * Zig uses a decentralized, content-addressed package system:
 * - Packages are identified by hash, not URL
 * - build.zig.zon is the manifest file
 * - Uses multihash format for package hashes
 *
 * This module provides Zig package hosting support for the Pantry registry.
 */

import * as crypto from 'node:crypto'

/**
 * Zig package manifest (build.zig.zon structure)
 */
export interface ZigManifest {
  name: string
  version: string
  fingerprint?: string
  minimum_zig_version?: string
  dependencies?: Record<string, ZigDependency>
  paths?: string[]
}

export interface ZigDependency {
  url?: string
  hash?: string
  path?: string
  lazy?: boolean
}

/**
 * Zig package metadata stored in registry
 */
export interface ZigPackageMetadata {
  name: string
  version: string
  fingerprint?: string
  minimum_zig_version?: string
  description?: string
  license?: string
  repository?: string
  homepage?: string
  author?: string
  keywords?: string[]
  tarballUrl: string
  hash: string // multihash
  publishedAt: string
  paths?: string[]
}

/**
 * Zig package record (all versions)
 */
export interface ZigPackageRecord {
  name: string
  description?: string
  license?: string
  repository?: string
  homepage?: string
  author?: string
  keywords?: string[]
  versions: Record<string, ZigPackageMetadata>
  latest: string
  createdAt: string
  updatedAt: string
}

/**
 * Compute Zig-compatible multihash for package contents
 *
 * Zig uses a specific multihash format:
 * - SHA256 hash (0x12 = sha2-256)
 * - 32 bytes length (0x20)
 * - Followed by the hash bytes
 *
 * Returns the hash as a hex string prefixed with "1220" (sha256 multihash prefix)
 */
export function computeZigHash(data: ArrayBuffer | Buffer): string {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data)
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')
  // Multihash format: 0x12 (sha256) + 0x20 (32 bytes) + hash
  return `1220${sha256}`
}

/**
 * Validate a Zig multihash
 */
export function validateZigHash(hash: string): boolean {
  // Must start with 1220 (sha256 multihash prefix) and be 68 chars total
  return /^1220[a-f0-9]{64}$/i.test(hash)
}

/**
 * Parse a build.zig.zon file content
 * Note: ZON is similar to Zig's struct syntax, not JSON
 */
export function parseZigZon(content: string): ZigManifest {
  // Simple ZON parser for manifest extraction
  // This handles the basic structure, not full ZON syntax
  const manifest: ZigManifest = {
    name: '',
    version: '',
  }

  // Extract name (handles both .name = .identifier and .name = "string")
  const nameMatch = content.match(/\.name\s*=\s*(?:\.(\w+)|"([^"]+)")/)
  if (nameMatch) {
    manifest.name = nameMatch[1] || nameMatch[2]
  }

  // Extract version
  const versionMatch = content.match(/\.version\s*=\s*"([^"]+)"/)
  if (versionMatch) {
    manifest.version = versionMatch[1]
  }

  // Extract fingerprint
  const fingerprintMatch = content.match(/\.fingerprint\s*=\s*(0x[a-fA-F0-9]+)/)
  if (fingerprintMatch) {
    manifest.fingerprint = fingerprintMatch[1]
  }

  // Extract minimum_zig_version
  const minVersionMatch = content.match(/\.minimum_zig_version\s*=\s*"([^"]+)"/)
  if (minVersionMatch) {
    manifest.minimum_zig_version = minVersionMatch[1]
  }

  // Extract paths (simple extraction)
  const pathsMatch = content.match(/\.paths\s*=\s*\.{([\s\S]*?)}/)
  if (pathsMatch) {
    const pathsContent = pathsMatch[1]
    const paths = pathsContent.match(/"([^"]+)"/g)
    if (paths) {
      manifest.paths = paths.map(p => p.replace(/"/g, ''))
    }
  }

  return manifest
}

/**
 * Generate a build.zig.zon dependency entry for a package
 */
export function generateDependencyEntry(
  name: string,
  tarballUrl: string,
  hash: string,
): string {
  return `.${name} = .{
    .url = "${tarballUrl}",
    .hash = "${hash}",
},`
}

/**
 * Generate the zig fetch command for a package
 */
export function generateFetchCommand(tarballUrl: string): string {
  return `zig fetch --save ${tarballUrl}`
}

/**
 * Storage interface for Zig packages
 */
export interface ZigPackageStorage {
  getPackage(name: string, version?: string): Promise<ZigPackageMetadata | null>
  listVersions(name: string): Promise<string[]>
  search(query: string, limit?: number): Promise<ZigPackageRecord[]>
  publish(metadata: ZigPackageMetadata, tarball: ArrayBuffer): Promise<void>
  exists(name: string, version: string): Promise<boolean>
  downloadTarball(name: string, version: string): Promise<ArrayBuffer | null>
  getByHash(hash: string): Promise<{ name: string, version: string, tarballUrl: string } | null>
}

/**
 * In-memory Zig package storage for development
 */
export class InMemoryZigStorage implements ZigPackageStorage {
  private packages: Map<string, ZigPackageRecord> = new Map()
  private tarballs: Map<string, ArrayBuffer> = new Map()
  private hashIndex: Map<string, { name: string, version: string }> = new Map()

  async getPackage(name: string, version?: string): Promise<ZigPackageMetadata | null> {
    const record = this.packages.get(name)
    if (!record)
      return null

    const targetVersion = version || record.latest
    return record.versions[targetVersion] || null
  }

  async listVersions(name: string): Promise<string[]> {
    const record = this.packages.get(name)
    if (!record)
      return []

    return Object.keys(record.versions).sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
      const [bMajor, bMinor, bPatch] = b.split('.').map(Number)
      if (aMajor !== bMajor)
        return bMajor - aMajor
      if (aMinor !== bMinor)
        return bMinor - aMinor
      return bPatch - aPatch
    })
  }

  async search(query: string, limit = 20): Promise<ZigPackageRecord[]> {
    const lowerQuery = query.toLowerCase()
    const results: ZigPackageRecord[] = []

    for (const record of this.packages.values()) {
      if (
        record.name.toLowerCase().includes(lowerQuery)
        || record.description?.toLowerCase().includes(lowerQuery)
        || record.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
      ) {
        results.push(record)
        if (results.length >= limit)
          break
      }
    }

    return results
  }

  async publish(metadata: ZigPackageMetadata, tarball: ArrayBuffer): Promise<void> {
    const { name, version } = metadata
    const key = `${name}@${version}`

    let record = this.packages.get(name)
    if (!record) {
      record = {
        name,
        description: metadata.description,
        license: metadata.license,
        repository: metadata.repository,
        homepage: metadata.homepage,
        author: metadata.author,
        keywords: metadata.keywords,
        versions: {},
        latest: version,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    record.versions[version] = metadata
    record.latest = version
    record.updatedAt = new Date().toISOString()

    this.packages.set(name, record)
    this.tarballs.set(key, tarball)
    this.hashIndex.set(metadata.hash, { name, version })
  }

  async exists(name: string, version: string): Promise<boolean> {
    const record = this.packages.get(name)
    return record?.versions[version] !== undefined
  }

  async downloadTarball(name: string, version: string): Promise<ArrayBuffer | null> {
    const key = `${name}@${version}`
    return this.tarballs.get(key) || null
  }

  async getByHash(hash: string): Promise<{ name: string, version: string, tarballUrl: string } | null> {
    const info = this.hashIndex.get(hash)
    if (!info)
      return null

    const metadata = await this.getPackage(info.name, info.version)
    if (!metadata)
      return null

    return {
      name: info.name,
      version: info.version,
      tarballUrl: metadata.tarballUrl,
    }
  }
}

/**
 * Create Zig package storage
 */
export function createZigStorage(): ZigPackageStorage {
  return new InMemoryZigStorage()
}
