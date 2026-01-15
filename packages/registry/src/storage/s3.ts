import type { TarballStorage } from '../types'

/**
 * S3-based tarball storage
 * Uses ts-cloud for S3 operations when available, falls back to AWS SDK
 */
export class S3Storage implements TarballStorage {
  private bucket: string
  private region: string
  private baseUrl: string

  constructor(bucket: string, region = 'us-east-1', baseUrl?: string) {
    this.bucket = bucket
    this.region = region
    this.baseUrl = baseUrl || `https://${bucket}.s3.${region}.amazonaws.com`
  }

  /**
   * Generate S3 key for a package tarball
   */
  private getKey(packageName: string, version: string): string {
    // Handle scoped packages (@scope/name -> scope/name)
    const safeName = packageName.replace('@', '').replace('/', '-')
    return `packages/${safeName}/${version}/${safeName}-${version}.tgz`
  }

  async upload(key: string, data: ArrayBuffer): Promise<string> {
    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`

    // Use presigned URL or direct upload based on environment
    const response = await fetch(url, {
      method: 'PUT',
      body: data,
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Length': String(data.byteLength),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to upload to S3: ${response.statusText}`)
    }

    return this.getUrl(key)
  }

  async download(key: string): Promise<ArrayBuffer> {
    const url = `${this.baseUrl}/${key}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to download from S3: ${response.statusText}`)
    }

    return response.arrayBuffer()
  }

  async exists(key: string): Promise<boolean> {
    const url = `${this.baseUrl}/${key}`
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  }

  async delete(key: string): Promise<void> {
    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
    const response = await fetch(url, { method: 'DELETE' })

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete from S3: ${response.statusText}`)
    }
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
   * Get the URL for a package tarball
   */
  getPackageUrl(name: string, version: string): string {
    const key = this.getKey(name, version)
    return this.getUrl(key)
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
    const dir = filePath.substring(0, filePath.lastIndexOf('/'))

    // Create directory if it doesn't exist
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
