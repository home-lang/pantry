/**
 * PHP/Composer Package Support
 *
 * PHP uses Composer as its package manager:
 * - Packages are identified by vendor/package name
 * - composer.json is the manifest file
 * - Versions use semver
 * - Uses SHA256 checksums for integrity
 *
 * This module provides PHP/Composer package hosting support for the Pantry registry.
 */

import * as crypto from 'node:crypto'
import { DynamoDBClient } from './storage/dynamodb-client'
import { S3Client } from './storage/aws-client'

/**
 * Composer package manifest (composer.json structure)
 */
export interface ComposerManifest {
  name: string
  version?: string
  description?: string
  license?: string | string[]
  type?: string
  keywords?: string[]
  authors?: ComposerAuthor[]
  require?: Record<string, string>
  'require-dev'?: Record<string, string>
  autoload?: ComposerAutoload
  homepage?: string
  'minimum-stability'?: string
}

export interface ComposerAuthor {
  name?: string
  email?: string
  homepage?: string
  role?: string
}

export interface ComposerAutoload {
  'psr-4'?: Record<string, string | string[]>
  'psr-0'?: Record<string, string | string[]>
  classmap?: string[]
  files?: string[]
}

/**
 * PHP package metadata stored in registry (per-version)
 */
export interface PhpPackageMetadata {
  name: string
  version: string
  description?: string
  license?: string | string[]
  type?: string
  keywords?: string[]
  authors?: ComposerAuthor[]
  homepage?: string
  repository?: string
  tarballUrl: string
  checksum: string // SHA256 hex
  require?: Record<string, string>
  publishedAt: string
}

/**
 * PHP package record (all versions)
 */
export interface PhpPackageRecord {
  name: string
  description?: string
  license?: string | string[]
  type?: string
  keywords?: string[]
  authors?: ComposerAuthor[]
  homepage?: string
  repository?: string
  versions: Record<string, PhpPackageMetadata>
  latest: string
  createdAt: string
  updatedAt: string
}

/**
 * Compute SHA256 checksum for package contents
 */
export function computePhpChecksum(data: ArrayBuffer | Buffer): string {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data)
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

/**
 * Parse a composer.json file content
 */
export function parseComposerJson(content: string): ComposerManifest {
  let parsed: any
  try {
    parsed = JSON.parse(content)
  }
  catch {
    throw new Error('Invalid composer.json: malformed JSON')
  }

  const manifest: ComposerManifest = {
    name: parsed.name || '',
  }

  if (parsed.version) manifest.version = parsed.version
  if (parsed.description) manifest.description = parsed.description
  if (parsed.license) manifest.license = parsed.license
  if (parsed.type) manifest.type = parsed.type
  if (parsed.keywords) manifest.keywords = parsed.keywords
  if (parsed.authors) manifest.authors = parsed.authors
  if (parsed.require) manifest.require = parsed.require
  if (parsed['require-dev']) manifest['require-dev'] = parsed['require-dev']
  if (parsed.autoload) manifest.autoload = parsed.autoload
  if (parsed.homepage) manifest.homepage = parsed.homepage
  if (parsed['minimum-stability']) manifest['minimum-stability'] = parsed['minimum-stability']

  return manifest
}

/**
 * Generate a composer require command for a package
 */
export function generateComposerRequire(name: string, version: string): string {
  const safeName = name.replace(/[^a-z0-9/_.-]/gi, '')
  const safeVersion = version.replace(/[^a-z0-9._-]/gi, '')
  return `composer require '${safeName}:^${safeVersion}'`
}

/**
 * Storage interface for PHP packages
 */
export interface PhpPackageStorage {
  getPackage(name: string, version?: string): Promise<PhpPackageMetadata | null>
  listVersions(name: string): Promise<string[]>
  search(query: string, limit?: number): Promise<PhpPackageRecord[]>
  publish(metadata: PhpPackageMetadata, tarball: ArrayBuffer): Promise<void>
  exists(name: string, version: string): Promise<boolean>
  downloadTarball(name: string, version: string): Promise<ArrayBuffer | null>
  /** Delete a package and all its versions */
  deletePackage(name: string): Promise<void>
  /** Return total number of published PHP packages */
  count(): Promise<number>
}

/**
 * In-memory PHP package storage for development
 */
export class InMemoryPhpStorage implements PhpPackageStorage {
  private packages: Map<string, PhpPackageRecord> = new Map()
  private tarballs: Map<string, ArrayBuffer> = new Map()

  async count(): Promise<number> {
    return this.packages.size
  }

  async getPackage(name: string, version?: string): Promise<PhpPackageMetadata | null> {
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

  async search(query: string, limit = 20): Promise<PhpPackageRecord[]> {
    const lowerQuery = query.toLowerCase()
    const results: PhpPackageRecord[] = []

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

  async publish(metadata: PhpPackageMetadata, tarball: ArrayBuffer): Promise<void> {
    const { name, version } = metadata
    const key = `${name}@${version}`

    let record = this.packages.get(name)
    if (!record) {
      record = {
        name,
        description: metadata.description,
        license: metadata.license,
        type: metadata.type,
        keywords: metadata.keywords,
        authors: metadata.authors,
        homepage: metadata.homepage,
        repository: metadata.repository,
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
  }

  async exists(name: string, version: string): Promise<boolean> {
    const record = this.packages.get(name)
    return record?.versions[version] !== undefined
  }

  async downloadTarball(name: string, version: string): Promise<ArrayBuffer | null> {
    const key = `${name}@${version}`
    return this.tarballs.get(key) || null
  }

  async deletePackage(name: string): Promise<void> {
    const record = this.packages.get(name)
    if (record) {
      for (const version of Object.keys(record.versions)) {
        const key = `${name}@${version}`
        this.tarballs.delete(key)
      }
      this.packages.delete(name)
    }
  }
}

/**
 * DynamoDB + S3 backed PHP package storage for production.
 *
 * DynamoDB schema (same table as regular packages):
 *   PK: PHP_PACKAGE#{name}  SK: METADATA       — package record (name, latest, description, etc.)
 *   PK: PHP_PACKAGE#{name}  SK: VERSION#{ver}   — per-version metadata (tarballUrl, checksum, etc.)
 *
 * S3 key: php-packages/{safeName}/{version}/{safeName}-{version}.tar.gz
 *   where safeName replaces `/` with `-`
 */
export class DynamoDBPhpStorage implements PhpPackageStorage {
  private tableName: string
  private db: DynamoDBClient
  private s3: S3Client
  private bucket: string
  private baseUrl: string

  constructor(opts: { tableName: string, bucket: string, region?: string, baseUrl: string }) {
    this.tableName = opts.tableName
    this.bucket = opts.bucket
    this.baseUrl = opts.baseUrl
    this.db = new DynamoDBClient(opts.region || 'us-east-1')
    this.s3 = new S3Client(opts.region || 'us-east-1')
  }

  private marshal(obj: Record<string, any>) {
    return DynamoDBClient.marshal(obj)
  }

  private unmarshal(item: Record<string, any>) {
    return DynamoDBClient.unmarshal(item)
  }

  private s3Key(name: string, version: string): string {
    const safeName = name.replaceAll('/', '-').replaceAll('@', '')
    return `php-packages/${safeName}/${version}/${safeName}-${version}.tar.gz`
  }

  async count(): Promise<number> {
    // Scan for all PHP_PACKAGE# metadata records (count only)
    const result = await this.db.scan({
      TableName: this.tableName,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
      ExpressionAttributeValues: {
        ':prefix': { S: 'PHP_PACKAGE#' },
        ':sk': { S: 'METADATA' },
      },
      ProjectionExpression: 'PK',
    })
    return result.Count || 0
  }

  async getPackage(name: string, version?: string): Promise<PhpPackageMetadata | null> {
    if (version) {
      const result = await this.db.getItem({
        TableName: this.tableName,
        Key: { PK: { S: `PHP_PACKAGE#${name}` }, SK: { S: `VERSION#${version}` } },
      })
      if (!result.Item) return null
      const d = this.unmarshal(result.Item)
      return { name: d.name, version: d.version, description: d.description, tarballUrl: d.tarballUrl, checksum: d.checksum, publishedAt: d.publishedAt, license: d.license, type: d.type, keywords: d.keywords, authors: d.authors, homepage: d.homepage, repository: d.repository, require: d.require }
    }

    // Get latest
    const meta = await this.db.getItem({
      TableName: this.tableName,
      Key: { PK: { S: `PHP_PACKAGE#${name}` }, SK: { S: 'METADATA' } },
    })
    if (!meta.Item) return null
    const md = this.unmarshal(meta.Item)
    if (!md.latest) return null
    return this.getPackage(name, md.latest)
  }

  async listVersions(name: string): Promise<string[]> {
    const result = await this.db.query({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': { S: `PHP_PACKAGE#${name}` },
        ':prefix': { S: 'VERSION#' },
      },
    })
    return result.Items.map((item: any) => {
      const d = this.unmarshal(item)
      return d.version as string
    }).sort((a: string, b: string) => {
      const [am, ai, ap] = a.split('.').map(Number)
      const [bm, bi, bp] = b.split('.').map(Number)
      return bm !== am ? bm - am : bi !== ai ? bi - ai : bp - ap
    })
  }

  async search(query: string, limit = 20): Promise<PhpPackageRecord[]> {
    const lowerQuery = query.toLowerCase()
    // Scan METADATA records and filter client-side (no GSI)
    const result = await this.db.scan({
      TableName: this.tableName,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
      ExpressionAttributeValues: {
        ':prefix': { S: 'PHP_PACKAGE#' },
        ':sk': { S: 'METADATA' },
      },
    })

    const matches: PhpPackageRecord[] = []
    for (const item of result.Items) {
      const d = this.unmarshal(item)
      const searchText = [d.name, d.description, ...(d.keywords || [])].filter(Boolean).join(' ').toLowerCase()
      if (!lowerQuery || searchText.includes(lowerQuery)) {
        // Fetch versions for each match
        const versions = await this.listVersions(d.name)
        const versionMap: Record<string, PhpPackageMetadata> = {}
        for (const v of versions.slice(0, 10)) {
          const pkg = await this.getPackage(d.name, v)
          if (pkg) versionMap[v] = pkg
        }
        matches.push({
          name: d.name,
          description: d.description,
          license: d.license,
          type: d.type,
          keywords: d.keywords,
          authors: d.authors,
          homepage: d.homepage,
          repository: d.repository,
          versions: versionMap,
          latest: d.latest,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })
        if (matches.length >= limit) break
      }
    }
    return matches
  }

  async publish(metadata: PhpPackageMetadata, tarball: ArrayBuffer): Promise<void> {
    const { name, version } = metadata
    const now = new Date().toISOString()

    // Upload tarball to S3
    const key = this.s3Key(name, version)
    await this.s3.putObject({ bucket: this.bucket, key, body: Buffer.from(tarball), contentType: 'application/gzip' })

    const tarballUrl = metadata.tarballUrl || `${this.baseUrl}/php/packages/${encodeURIComponent(name)}/${version}/tarball`

    // Store version record
    await this.db.putItem({
      TableName: this.tableName,
      Item: this.marshal({
        PK: `PHP_PACKAGE#${name}`,
        SK: `VERSION#${version}`,
        name, version, tarballUrl,
        checksum: metadata.checksum,
        description: metadata.description || '',
        license: metadata.license || '',
        type: metadata.type || '',
        keywords: metadata.keywords || [],
        authors: metadata.authors || [],
        homepage: metadata.homepage || '',
        repository: metadata.repository || '',
        require: metadata.require || {},
        publishedAt: metadata.publishedAt || now,
      }),
    })

    // Upsert metadata record
    await this.db.putItem({
      TableName: this.tableName,
      Item: this.marshal({
        PK: `PHP_PACKAGE#${name}`,
        SK: 'METADATA',
        name,
        latest: version,
        description: metadata.description || '',
        license: metadata.license || '',
        type: metadata.type || '',
        keywords: metadata.keywords || [],
        authors: metadata.authors || [],
        homepage: metadata.homepage || '',
        repository: metadata.repository || '',
        createdAt: now,
        updatedAt: now,
      }),
    })
  }

  async exists(name: string, version: string): Promise<boolean> {
    const result = await this.db.getItem({
      TableName: this.tableName,
      Key: { PK: { S: `PHP_PACKAGE#${name}` }, SK: { S: `VERSION#${version}` } },
    })
    return result.Item !== undefined
  }

  async downloadTarball(name: string, version: string): Promise<ArrayBuffer | null> {
    const key = this.s3Key(name, version)
    try {
      const buf = await this.s3.getObjectBuffer(this.bucket, key)
      return (buf.buffer as ArrayBuffer).slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    }
    catch {
      return null
    }
  }

  async deletePackage(name: string): Promise<void> {
    // Get all records for this package (METADATA + VERSION#*)
    const result = await this.db.query({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: `PHP_PACKAGE#${name}` },
      },
    })

    // Delete each version's S3 tarball and DynamoDB record
    for (const item of result.Items) {
      const d = this.unmarshal(item)
      if (d.version) {
        const s3Key = this.s3Key(name, d.version)
        try { await this.s3.deleteObject(this.bucket, s3Key) }
        catch { /* ignore missing */ }
      }
      // Delete the DynamoDB record (METADATA or VERSION#x.y.z)
      await this.db.deleteItem({
        TableName: this.tableName,
        Key: { PK: { S: `PHP_PACKAGE#${name}` }, SK: item.SK },
      })
    }
  }
}

/**
 * Create PHP package storage.
 * Uses DynamoDB + S3 when DYNAMODB_TABLE and S3_BUCKET env vars are set, otherwise in-memory.
 */
export function createPhpStorage(): PhpPackageStorage {
  const table = process.env.DYNAMODB_TABLE
  const bucket = process.env.S3_BUCKET
  const region = process.env.AWS_REGION || 'us-east-1'
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

  if (table && bucket && bucket !== 'local') {
    return new DynamoDBPhpStorage({ tableName: table, bucket, region, baseUrl })
  }
  return new InMemoryPhpStorage()
}
