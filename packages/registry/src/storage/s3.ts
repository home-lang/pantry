import type { TarballStorage } from '../types'
// TODO: Switch to ts-cloud when published on npm
// import { S3Client } from 'ts-cloud/aws'
import { S3Client } from './aws-client'

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
    // Handle scoped packages (@scope/name -> scope-name)
    const safeName = packageName.replace('@', '').replace('/', '-')
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
    const safeName = name.replace('@', '').replace('/', '-')
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

    return Array.from(versions).sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
      const [bMajor, bMinor, bPatch] = b.split('.').map(Number)
      if (aMajor !== bMajor)
        return bMajor - aMajor
      if (aMinor !== bMinor)
        return bMinor - aMinor
      return bPatch - aPatch
    })
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
    return `${this.basePath}/${key}`
  }

  async upload(key: string, data: ArrayBuffer): Promise<string> {
    const filePath = this.getFilePath(key)
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
    await fs.unlink(filePath).catch(() => {})
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/storage/${key}`
  }
}
