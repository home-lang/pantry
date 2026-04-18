import { resolve, relative } from 'node:path'
import type { TarballStorage } from '../types'
// TODO: Switch to ts-cloud when published on npm
// import { S3Client } from 'ts-cloud/aws'
import { S3Client } from './aws-client'

/**
 * Semver descending comparator that handles prerelease suffixes.
 * Shared between list-versions and S3-prefix listing.
 */
function compareSemverDesc(a: string, b: string): number {
  const parse = (v: string) => {
    const dash = v.indexOf('-')
    const num = (dash === -1 ? v : v.slice(0, dash)).replace(/^v/, '')
      .split('.').map(n => Number.parseInt(n, 10) || 0)
    return { num, pre: dash === -1 ? null : v.slice(dash + 1) }
  }
  const pa = parse(a)
  const pb = parse(b)
  for (let i = 0; i < Math.max(pa.num.length, pb.num.length); i++) {
    const av = pa.num[i] ?? 0
    const bv = pb.num[i] ?? 0
    if (av !== bv) return bv - av
  }
  if (pa.pre === null && pb.pre !== null) return -1
  if (pa.pre !== null && pb.pre === null) return 1
  return (pb.pre || '').localeCompare(pa.pre || '')
}

/**
 * Validate and normalize a package name for use in S3 keys. Strips @ and /
 * characters, then rejects anything that could still traverse or contain
 * unsafe filesystem/URL characters. Shared entry point for every path that
 * builds an S3 key from user input.
 */
export function sanitizePackageName(name: string): string {
  const safe = name.replaceAll('@', '').replaceAll('/', '-')
  if (!safe || safe.length > 214 || safe.includes('..') || /^[.\-]|[.\-]$/.test(safe) || !/^[a-zA-Z0-9._-]+$/.test(safe)) {
    throw new Error(`Invalid package name: ${name}`)
  }
  return safe
}

/**
 * S3-based tarball storage using ts-cloud
 */
export class S3Storage implements TarballStorage {
  private bucket: string
  private region: string
  private baseUrl: string
  private s3: S3Client

  constructor(bucket: string, region = 'us-east-1', baseUrl?: string) {
    this.bucket = bucket
    this.region = region
    this.baseUrl = baseUrl || `https://${bucket}.s3.${region}.amazonaws.com`
    this.s3 = new S3Client(region)
  }

  /**
   * Generate S3 key for a package tarball
   */
  private getKey(packageName: string, version: string): string {
    const safeName = sanitizePackageName(packageName)
    if (!/^[a-zA-Z0-9._+-]+$/.test(version)) {
      throw new Error(`Invalid version: ${version}`)
    }
    return `packages/pantry/${safeName}/${version}/${safeName}-${version}.tgz`
  }

  async upload(key: string, data: ArrayBuffer): Promise<string> {
    await this.s3.putObject({
      bucket: this.bucket,
      key,
      body: Buffer.from(data),
      contentType: 'application/gzip',
    })

    return this.getUrl(key)
  }

  async download(key: string): Promise<ArrayBuffer> {
    const buffer = await this.s3.getObjectBuffer(this.bucket, key)
    if (!buffer || buffer.byteLength === 0) {
      throw new Error(`S3 download returned empty data for key: ${key}`)
    }
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.s3.headObject(this.bucket, key)
      return true
    }
    catch {
      return false
    }
  }

  async delete(key: string): Promise<void> {
    await this.s3.deleteObject(this.bucket, key)
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`
  }

  /**
   * Upload a package tarball
   */
  async uploadPackage(name: string, version: string, data: ArrayBuffer): Promise<string> {
    const key = this.getKey(name, version)
    return this.upload(key, data)
  }

  /**
   * Download a package tarball
   */
  async downloadPackage(name: string, version: string): Promise<ArrayBuffer> {
    const key = this.getKey(name, version)
    return this.download(key)
  }

  /**
   * Check if a package tarball exists
   */
  async packageExists(name: string, version: string): Promise<boolean> {
    const key = this.getKey(name, version)
    return this.exists(key)
  }

  /**
   * Get the URL for a package tarball
   */
  getPackageUrl(name: string, version: string): string {
    const key = this.getKey(name, version)
    return this.getUrl(key)
  }

  /**
   * List all versions of a package
   */
  async listPackageVersions(name: string): Promise<string[]> {
    const safeName = name.replaceAll('@', '').replaceAll('/', '-')
    const prefix = `packages/pantry/${safeName}/`

    const objects = await this.s3.list({
      bucket: this.bucket,
      prefix,
    })

    // Extract versions from keys like "packages/pantry/name/1.0.0/name-1.0.0.tgz"
    const versions = new Set<string>()
    for (const obj of objects) {
      const match = obj.Key?.match(/packages\/pantry\/[^/]+\/([^/]+)\//)
      if (match) {
        versions.add(match[1])
      }
    }

    return Array.from(versions).sort(compareSemverDesc)
  }

  /**
   * Generate a presigned URL for downloading a package (useful for direct downloads)
   */
  getPresignedDownloadUrl(name: string, version: string, expiresInSeconds = 3600): string {
    const key = this.getKey(name, version)
    return this.s3.generatePresignedGetUrl(this.bucket, key, expiresInSeconds)
  }

  /**
   * Generate a presigned URL for uploading a package (useful for direct uploads)
   */
  getPresignedUploadUrl(name: string, version: string, expiresInSeconds = 3600): string {
    const key = this.getKey(name, version)
    return this.s3.generatePresignedPutUrl(this.bucket, key, 'application/gzip', expiresInSeconds)
  }

  /**
   * List object keys matching a prefix (used for short SHA resolution)
   */
  async list(prefix: string): Promise<string[]> {
    // Raise the ceiling to 1000 (single S3 page) so callers like short-SHA
    // resolution don't silently miss matches when >10 tarballs share a prefix.
    // aws-client.ts handles continuation tokens automatically.
    const objects = await this.s3.list({ bucket: this.bucket, prefix, maxKeys: 1000 })
    return objects.map((o: any) => o.Key).filter(Boolean)
  }
}

/**
 * Local file storage for development/testing
 */
export class LocalStorage implements TarballStorage {
  private basePath: string
  private baseUrl: string

  constructor(basePath: string, baseUrl: string) {
    this.basePath = basePath
    this.baseUrl = baseUrl
  }

  private getFilePath(key: string): string {
    if (/[\x00-\x1f]/.test(key)) {
      throw new Error(`Invalid characters in key: ${key}`)
    }
    const resolved = resolve(this.basePath, key)
    if (relative(this.basePath, resolved).startsWith('..')) {
      throw new Error(`Path traversal detected: ${key}`)
    }
    return resolved
  }

  async upload(key: string, data: ArrayBuffer): Promise<string> {
    const filePath = this.getFilePath(key)
    // Ensure parent directories exist
    const dir = filePath.substring(0, filePath.lastIndexOf('/'))
    if (dir) {
      const fs = await import('node:fs/promises')
      await fs.mkdir(dir, { recursive: true }).catch(err => console.warn(`LocalStorage: mkdir failed for ${dir}:`, err))
    }
    await Bun.write(filePath, data)
    return this.getUrl(key)
  }

  async download(key: string): Promise<ArrayBuffer> {
    const filePath = this.getFilePath(key)
    const file = Bun.file(filePath)
    return file.arrayBuffer()
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key)
    const file = Bun.file(filePath)
    return file.exists()
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key)
    const fs = await import('node:fs/promises')
    await fs.unlink(filePath).catch(err => {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn(`LocalStorage: delete failed for ${filePath}:`, err)
      }
    })
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/storage/${key}`
  }

  async list(prefix: string): Promise<string[]> {
    const fs = await import('node:fs/promises')
    const nodePath = await import('node:path')
    // Emulate S3 prefix matching: if prefix ends with /, list that dir directly; otherwise filter parent
    const fullPrefix = this.getFilePath(prefix)
    const isDir = prefix.endsWith('/')
    const parentDir = isDir ? fullPrefix : nodePath.dirname(fullPrefix)
    const prefixBase = isDir ? '' : nodePath.basename(fullPrefix)

    try {
      const entries = await fs.readdir(parentDir, { withFileTypes: true })
      const results: string[] = []
      for (const entry of entries) {
        if (prefixBase && !entry.name.startsWith(prefixBase)) continue
        const entryPath = nodePath.join(parentDir, entry.name)
        const keyPrefix = isDir ? prefix : prefix.slice(0, prefix.length - prefixBase.length)
        if (entry.isDirectory()) {
          const subEntries = await fs.readdir(entryPath, { recursive: true })
          for (const sub of subEntries) {
            results.push(`${keyPrefix}${entry.name}/${sub}`)
          }
        }
        else {
          results.push(`${keyPrefix}${entry.name}`)
        }
      }
      return results
    }
    catch {
      return []
    }
  }
}
