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
import { DynamoDBClient } from './storage/dynamodb-client'
import { S3Client } from './storage/aws-client'

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

  // Extract name (handles .name = .@"quoted-name", .name = .identifier, and .name = "string")
  const nameMatch = content.match(/\.name\s*=\s*(?:\.@"([^"]+)"|\.(\w+)|"([^"]+)")/)
  if (nameMatch) {
    manifest.name = nameMatch[1] || nameMatch[2] || nameMatch[3]
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
  /** Delete a package and all its versions */
  deletePackage(name: string): Promise<void>
  /** Return total number of published Zig packages */
  count(): Promise<number>
}

/**
 * In-memory Zig package storage for development
 */
export class InMemoryZigStorage implements ZigPackageStorage {
  private packages: Map<string, ZigPackageRecord> = new Map()
  private tarballs: Map<string, ArrayBuffer> = new Map()
  private hashIndex: Map<string, { name: string, version: string }> = new Map()

  async count(): Promise<number> {
    return this.packages.size
  }

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

  async deletePackage(name: string): Promise<void> {
    const record = this.packages.get(name)
    if (record) {
      for (const version of Object.keys(record.versions)) {
        const key = `${name}@${version}`
        this.tarballs.delete(key)
        const meta = record.versions[version]
        if (meta?.hash) this.hashIndex.delete(meta.hash)
      }
      this.packages.delete(name)
    }
  }
}

/**
 * DynamoDB + S3 backed Zig package storage for production.
 *
 * DynamoDB schema (same table as regular packages):
 *   PK: ZIG_PACKAGE#{name}  SK: METADATA       — package record (name, latest, description, etc.)
 *   PK: ZIG_PACKAGE#{name}  SK: VERSION#{ver}   — per-version metadata (tarballUrl, hash, etc.)
 *   PK: ZIG_HASH#{hash}     SK: ZIG_HASH        — hash → (name, version) reverse index
 *
 * S3 key: zig-packages/{name}/{version}/{name}-{version}.tar.gz
 */
export class DynamoDBZigStorage implements ZigPackageStorage {
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
    const safeName = name.replace('@', '').replace('/', '-')
    return `zig-packages/${safeName}/${version}/${safeName}-${version}.tar.gz`
  }

  async count(): Promise<number> {
    // Scan for all ZIG_PACKAGE# metadata records (count only)
    const result = await this.db.scan({
      TableName: this.tableName,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
      ExpressionAttributeValues: {
        ':prefix': { S: 'ZIG_PACKAGE#' },
        ':sk': { S: 'METADATA' },
      },
      ProjectionExpression: 'PK',
    })
    return result.Count || 0
  }

  async getPackage(name: string, version?: string): Promise<ZigPackageMetadata | null> {
    if (version) {
      const result = await this.db.getItem({
        TableName: this.tableName,
        Key: { PK: { S: `ZIG_PACKAGE#${name}` }, SK: { S: `VERSION#${version}` } },
      })
      if (!result.Item) return null
      const d = this.unmarshal(result.Item)
      return { name: d.name, version: d.version, description: d.description, tarballUrl: d.tarballUrl, hash: d.hash, publishedAt: d.publishedAt, license: d.license, repository: d.repository, homepage: d.homepage, author: d.author, keywords: d.keywords }
    }

    // Get latest
    const meta = await this.db.getItem({
      TableName: this.tableName,
      Key: { PK: { S: `ZIG_PACKAGE#${name}` }, SK: { S: 'METADATA' } },
    })
    if (!meta.Item) return null
    const md = this.unmarshal(meta.Item)
    return this.getPackage(name, md.latest)
  }

  async listVersions(name: string): Promise<string[]> {
    const result = await this.db.query({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': { S: `ZIG_PACKAGE#${name}` },
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

  async search(query: string, limit = 20): Promise<ZigPackageRecord[]> {
    const lowerQuery = query.toLowerCase()
    // Scan METADATA records and filter client-side (no GSI)
    const result = await this.db.scan({
      TableName: this.tableName,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
      ExpressionAttributeValues: {
        ':prefix': { S: 'ZIG_PACKAGE#' },
        ':sk': { S: 'METADATA' },
      },
    })

    const matches: ZigPackageRecord[] = []
    for (const item of result.Items) {
      const d = this.unmarshal(item)
      const searchText = [d.name, d.description, ...(d.keywords || [])].filter(Boolean).join(' ').toLowerCase()
      if (!lowerQuery || searchText.includes(lowerQuery)) {
        // Fetch versions for each match
        const versions = await this.listVersions(d.name)
        const versionMap: Record<string, ZigPackageMetadata> = {}
        for (const v of versions.slice(0, 10)) {
          const pkg = await this.getPackage(d.name, v)
          if (pkg) versionMap[v] = pkg
        }
        matches.push({
          name: d.name,
          description: d.description,
          license: d.license,
          repository: d.repository,
          homepage: d.homepage,
          author: d.author,
          keywords: d.keywords,
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

  async publish(metadata: ZigPackageMetadata, tarball: ArrayBuffer): Promise<void> {
    const { name, version } = metadata
    const now = new Date().toISOString()

    // Upload tarball to S3
    const key = this.s3Key(name, version)
    await this.s3.putObject({ bucket: this.bucket, key, body: Buffer.from(tarball), contentType: 'application/gzip' })

    const tarballUrl = metadata.tarballUrl || `${this.baseUrl}/zig/packages/${encodeURIComponent(name)}/${version}/tarball`

    // Store version record
    await this.db.putItem({
      TableName: this.tableName,
      Item: this.marshal({
        PK: `ZIG_PACKAGE#${name}`,
        SK: `VERSION#${version}`,
        name, version, tarballUrl,
        hash: metadata.hash,
        description: metadata.description || '',
        license: metadata.license || '',
        repository: metadata.repository || '',
        homepage: metadata.homepage || '',
        author: metadata.author || '',
        keywords: metadata.keywords || [],
        publishedAt: metadata.publishedAt || now,
      }),
    })

    // Upsert metadata record
    await this.db.putItem({
      TableName: this.tableName,
      Item: this.marshal({
        PK: `ZIG_PACKAGE#${name}`,
        SK: 'METADATA',
        name,
        latest: version,
        description: metadata.description || '',
        license: metadata.license || '',
        repository: metadata.repository || '',
        homepage: metadata.homepage || '',
        author: metadata.author || '',
        keywords: metadata.keywords || [],
        createdAt: now,
        updatedAt: now,
      }),
    })

    // Hash index
    await this.db.putItem({
      TableName: this.tableName,
      Item: this.marshal({
        PK: `ZIG_HASH#${metadata.hash}`,
        SK: 'ZIG_HASH',
        name, version, tarballUrl,
      }),
    })
  }

  async exists(name: string, version: string): Promise<boolean> {
    const result = await this.db.getItem({
      TableName: this.tableName,
      Key: { PK: { S: `ZIG_PACKAGE#${name}` }, SK: { S: `VERSION#${version}` } },
    })
    return result.Item !== undefined
  }

  async downloadTarball(name: string, version: string): Promise<ArrayBuffer | null> {
    const key = this.s3Key(name, version)
    try {
      const buf = await this.s3.getObjectBuffer(this.bucket, key)
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    }
    catch {
      return null
    }
  }

  async getByHash(hash: string): Promise<{ name: string, version: string, tarballUrl: string } | null> {
    const result = await this.db.getItem({
      TableName: this.tableName,
      Key: { PK: { S: `ZIG_HASH#${hash}` }, SK: { S: 'ZIG_HASH' } },
    })
    if (!result.Item) return null
    const d = this.unmarshal(result.Item)
    return { name: d.name, version: d.version, tarballUrl: d.tarballUrl }
  }

  async deletePackage(name: string): Promise<void> {
    // Get all version records for this package
    const result = await this.db.query({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: `ZIG_PACKAGE#${name}` },
      },
    })

    // Delete each version's hash index and S3 tarball
    for (const item of result.Items) {
      const d = this.unmarshal(item)
      if (d.hash) {
        await this.db.deleteItem({
          TableName: this.tableName,
          Key: { PK: { S: `ZIG_HASH#${d.hash}` }, SK: { S: 'ZIG_HASH' } },
        })
      }
      if (d.version) {
        const s3Key = this.s3Key(name, d.version)
        try { await this.s3.deleteObject(this.bucket, s3Key) }
        catch { /* ignore missing */ }
      }
      // Delete the DynamoDB record (METADATA or VERSION#x.y.z)
      await this.db.deleteItem({
        TableName: this.tableName,
        Key: { PK: { S: `ZIG_PACKAGE#${name}` }, SK: item.SK },
      })
    }
  }
}

/**
 * Create Zig package storage.
 * Uses DynamoDB + S3 when DYNAMODB_TABLE and S3_BUCKET env vars are set, otherwise in-memory.
 */
export function createZigStorage(): ZigPackageStorage {
  const table = process.env.DYNAMODB_TABLE
  const bucket = process.env.S3_BUCKET
  const region = process.env.AWS_REGION || 'us-east-1'
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

  if (table && bucket && bucket !== 'local') {
    return new DynamoDBZigStorage({ tableName: table, bucket, region, baseUrl })
  }
  return new InMemoryZigStorage()
}
