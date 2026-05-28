import type {
  CommitPublish,
  CommitPublishSummary,
  MetadataStorage,
  PackageMetadata,
  PackagePublisherSettings,
  PackageRecord,
  PublisherPackageSummary,
  RegistryConfig,
  SearchResult,
  TarballStorage,
} from './types'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { downloadNpmTarball, fetchFromNpm, listNpmVersions, searchNpm } from './npm-fallback'
import { FileMetadataStorage } from './storage/metadata'
import { DynamoDBMetadataStorage } from './storage/dynamodb-metadata'
import { ObjectMetadataStorage } from './storage/object-metadata'
import { createS3Client, resolveStorageProvider } from './storage/provider'
import { LocalStorage, S3Storage, sanitizePackageName } from './storage/s3'

/** Reject version strings containing shell-unsafe or path-unsafe characters. */
function isSafeVersion(v: string): boolean {
  return typeof v === 'string' && v.length > 0 && v.length <= 64 && /^[a-zA-Z0-9._+-]+$/.test(v)
}

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase()
  // Exact matches
  if (['localhost', '0.0.0.0', '[::1]', '[::]'].includes(lower)) return true
  // IPv4 loopback and private ranges
  if (/^127\./.test(lower)) return true
  if (/^10\./.test(lower)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(lower)) return true
  if (/^192\.168\./.test(lower)) return true
  if (/^169\.254\./.test(lower)) return true
  // IPv6 private
  if (lower.startsWith('[fc') || lower.startsWith('[fd') || lower === '[::1]') return true
  return false
}

/**
 * Pantry Registry - Main registry class
 */
export class Registry {
  private config: RegistryConfig
  private tarballStorage: TarballStorage
  private metadataStorage: MetadataStorage

  /** Public accessor for tarball storage (used by short URL handler for S3 prefix search) */
  get tarball(): TarballStorage { return this.tarballStorage }

  constructor(config: RegistryConfig) {
    this.config = config
    const localStoragePath = config.localStoragePath
      || (process.env.NODE_ENV === 'test' ? mkdtempSync(join(tmpdir(), 'pantry-registry-')) : './.registry')

    // Resolve the object-storage provider once (AWS S3 / Backblaze B2 / Hetzner),
    // shared by both the tarball store and the object metadata store so they
    // always point at the same bucket/endpoint/credentials.
    const usingObjectStorage = Boolean(config.s3Bucket && config.s3Bucket !== 'local')
    const storage = usingObjectStorage
      ? resolveStorageProvider({
          provider: config.storageProvider,
          region: config.s3Region,
          endpoint: config.s3Endpoint,
          forcePathStyle: config.forcePathStyle,
        })
      : undefined

    // Initialize tarball storage
    if (storage) {
      this.tarballStorage = new S3Storage(config.s3Bucket, storage, config.baseUrl)
    }
    else {
      // Use local storage for development
      this.tarballStorage = new LocalStorage(join(localStoragePath, 'tarballs'), config.baseUrl)
    }

    // Initialize metadata storage. Default backend follows the provider: object
    // storage for any S3-compatible provider (fully off DynamoDB), DynamoDB only
    // when explicitly requested, and the local file store for development.
    const metadataBackend = config.metadataBackend
      ?? (storage && storage.provider !== 'aws' ? 'object' : undefined)
      ?? (config.dynamoTable && config.dynamoTable !== 'local' ? 'dynamodb' : 'file')

    if (metadataBackend === 'object' && storage) {
      this.metadataStorage = new ObjectMetadataStorage(
        createS3Client(storage),
        config.s3Bucket,
        config.metadataKey,
      )
    }
    else if (metadataBackend === 'dynamodb' && config.dynamoTable && config.dynamoTable !== 'local') {
      this.metadataStorage = new DynamoDBMetadataStorage(config.dynamoTable, config.s3Region || 'us-east-1')
    }
    else {
      // Use file-based storage for development
      this.metadataStorage = new FileMetadataStorage(join(localStoragePath, 'metadata.json'))
    }
  }

  /**
   * Get package metadata
   */
  async getPackage(name: string, version?: string): Promise<PackageMetadata | null> {
    // First check our registry
    const metadata = version
      ? await this.metadataStorage.getPackageVersion(name, version)
      : await this.getLatestVersion(name)

    if (metadata) {
      return metadata
    }

    // Fallback to npm if enabled
    if (this.config.npmFallback) {
      return fetchFromNpm(name, version)
    }

    return null
  }

  /**
   * Get the latest version of a package
   */
  private async getLatestVersion(name: string): Promise<PackageMetadata | null> {
    const pkg = await this.metadataStorage.getPackage(name)
    if (!pkg)
      return null

    return this.metadataStorage.getPackageVersion(name, pkg.latestVersion)
  }

  /**
   * List all versions of a package
   */
  async listVersions(name: string): Promise<string[]> {
    const versions = await this.metadataStorage.listVersions(name)

    if (versions.length > 0) {
      return versions
    }

    // Fallback to npm if enabled
    if (this.config.npmFallback) {
      return listNpmVersions(name)
    }

    return []
  }

  /**
   * Search for packages
   */
  async search(query: string, limit = 20): Promise<SearchResult[]> {
    const safeQuery = query.slice(0, 256)
    const safeLimit = Math.min(Math.max(limit, 1), 100)
    const results = await this.metadataStorage.search(safeQuery, safeLimit)

    // If we have enough results or npm fallback is disabled, return
    if (results.length >= limit || !this.config.npmFallback) {
      return results
    }

    // Supplement with npm results
    const npmResults = await searchNpm(query, limit - results.length)
    const existingNames = new Set(results.map(r => r.name))

    for (const npmResult of npmResults) {
      if (!existingNames.has(npmResult.name)) {
        results.push(npmResult)
      }
    }

    return results.slice(0, limit)
  }

  /**
   * Download package tarball
   */
  async downloadTarball(name: string, version: string): Promise<ArrayBuffer | null> {
    // Check if we have it in our storage
    const metadata = await this.metadataStorage.getPackageVersion(name, version)

    if (metadata?.tarballUrl) {
      try {
        // Increment download count
        await this.metadataStorage.incrementDownloads(name, version)

        // If it's a local URL, download from our storage
        if (metadata.tarballUrl.startsWith(this.config.baseUrl)) {
          const key = metadata.tarballUrl.replace(`${this.config.baseUrl}/`, '')
          return this.tarballStorage.download(key)
        }

        // Otherwise, fetch from the URL (validate HTTPS to prevent SSRF)
        const tarballUrlObj = new URL(metadata.tarballUrl)
        if (tarballUrlObj.protocol !== 'https:' || isBlockedHost(tarballUrlObj.hostname)) {
          throw new Error(`Blocked tarball URL: ${tarballUrlObj.hostname}`)
        }
        const response = await fetch(metadata.tarballUrl)
        if (response.ok) {
          return response.arrayBuffer()
        }
      }
      catch {
        // Fall through to npm fallback
      }
    }

    // Fallback to npm if enabled
    if (this.config.npmFallback) {
      return downloadNpmTarball(name, version)
    }

    return null
  }

  /**
   * Publish a package
   */
  async publish(metadata: PackageMetadata, tarball: ArrayBuffer, publishedBy?: string): Promise<void> {
    const safeName = sanitizePackageName(metadata.name)
    if (!isSafeVersion(metadata.version)) {
      throw new Error(`Invalid package version: ${metadata.version}`)
    }
    const key = `packages/pantry/${safeName}/${metadata.version}/${safeName}-${metadata.version}.tgz`

    // Upload tarball
    const tarballUrl = await this.tarballStorage.upload(key, tarball)

    // Calculate checksum
    const hashBuffer = await crypto.subtle.digest('SHA-256', tarball)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const checksum = `sha256:${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`

    // Store metadata
    await this.metadataStorage.putVersion(metadata.name, metadata.version, {
      ...metadata,
      tarballUrl,
      checksum,
      publishedAt: new Date().toISOString(),
    })

    if (publishedBy && publishedBy !== '_admin') {
      await this.metadataStorage.setPackagePublisher(metadata.name, publishedBy)
    }
  }

  /** List packages owned by a publisher account (admins see all registry packages) */
  async listPublisherPackages(userId: string, limit = 50, isAdmin = false): Promise<PublisherPackageSummary[]> {
    if (isAdmin) {
      return this.metadataStorage.listAllRegistryPackages(limit)
    }
    return this.metadataStorage.listPackagesByPublisher(userId, limit)
  }

  /** Update package metadata/settings (publisher dashboard) */
  async updatePublisherPackage(
    name: string,
    userId: string,
    updates: Partial<PackageRecord> & { settings?: PackagePublisherSettings },
    isAdmin = false,
  ): Promise<PackageRecord> {
    const effectiveUser = isAdmin ? '_admin' : userId
    return this.metadataStorage.updatePublisherPackage(name, effectiveUser, updates)
  }

  async getPublisherPackageRecord(name: string): Promise<PackageRecord | null> {
    return this.metadataStorage.getPackage(name)
  }

  async claimPublisherPackage(name: string, userId: string): Promise<void> {
    await this.metadataStorage.setPackagePublisher(name, userId)
  }

  /**
   * Check if a package version exists
   */
  async exists(name: string, version: string): Promise<boolean> {
    const metadata = await this.metadataStorage.getPackageVersion(name, version)
    return metadata !== null
  }

  /**
   * Publish a package from a specific git commit (pkg-pr-new equivalent)
   */
  async publishCommit(
    name: string,
    sha: string,
    tarball: ArrayBuffer,
    options?: { repository?: string, packageDir?: string, version?: string, publishedBy?: string },
  ): Promise<CommitPublish> {
    const safeName = sanitizePackageName(name)
    if (!/^[a-f0-9]{7,40}$/i.test(sha)) {
      throw new Error(`Invalid commit SHA: ${sha}`)
    }
    const key = `commits/${sha}/${safeName}/${safeName}.tgz`

    // Upload tarball
    const tarballUrl = await this.tarballStorage.upload(key, tarball)

    // Calculate checksum
    const hashBuffer = await crypto.subtle.digest('SHA-256', tarball)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const checksum = `sha256:${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`

    const publish: CommitPublish = {
      name,
      sha,
      tarballUrl,
      checksum,
      publishedAt: new Date().toISOString(),
      repository: options?.repository,
      packageDir: options?.packageDir,
      version: options?.version,
      size: tarball.byteLength,
      publishedBy: options?.publishedBy,
    }

    // Store metadata
    await this.metadataStorage.putCommitPublish(publish)

    if (options?.publishedBy && options.publishedBy !== '_admin') {
      await this.metadataStorage.setCommitPublisher(name, sha, options.publishedBy)
    }

    return publish
  }

  /**
   * Get a commit-published package.
   * Supports both full and short (7+ char) SHA prefixes.
   */
  async getCommitPackage(sha: string, name: string): Promise<CommitPublish | null> {
    // Try exact match first (catch errors from DynamoDB for non-existent keys)
    try {
      const exact = await this.metadataStorage.getCommitPublish(sha, name)
      if (exact) return exact
    }
    catch {
      // DynamoDB may throw for non-existent items — fall through to S3 prefix search
    }

    // If short SHA (< 40 chars), try prefix match via S3 listing
    if (sha.length < 40 && sha.length >= 7 && /^[a-f0-9]+$/i.test(sha)) {
      try {
        const safeName = sanitizePackageName(name)
        const prefix = `commits/${sha}`
        const keys = await this.tarballStorage.list(prefix)
        // Find a key that matches our package
        const matchKey = keys.find((k: string) => k.includes(`/${safeName}/`))
        if (matchKey) {
          // Extract full SHA from the key: commits/{fullSha}/{safeName}/{safeName}.tgz
          const parts = matchKey.split('/')
          const fullSha = parts[1]
          if (fullSha && fullSha.startsWith(sha)) {
            // Try DynamoDB first, but if that fails, construct a synthetic result
            const dbResult = await this.metadataStorage.getCommitPublish(fullSha, name).catch(() => null)
            if (dbResult) return dbResult
            // Construct from S3 data as fallback
            return {
              name,
              sha: fullSha,
              tarballUrl: this.tarballStorage.getUrl(matchKey),
              checksum: '',
              publishedAt: new Date().toISOString(),
            }
          }
        }
      }
      catch {
        // Fall through to null
      }
    }

    return null
  }

  /**
   * Download a commit-published package tarball.
   * Supports both full and short (7+ char) SHA prefixes.
   */
  async downloadCommitTarball(sha: string, name: string): Promise<ArrayBuffer | null> {
    // Use getCommitPackage which handles short SHA resolution
    const publish = await this.getCommitPackage(sha, name)
    if (!publish)
      return null

    const safeName = sanitizePackageName(name)
    const resolvedSha = publish.sha || sha
    if (!/^[a-f0-9]{7,40}$/i.test(resolvedSha)) return null
    const key = `commits/${resolvedSha}/${safeName}/${safeName}.tgz`

    try {
      return await this.tarballStorage.download(key)
    }
    catch {
      return null
    }
  }

  /**
   * Get all packages published for a commit
   */
  async getCommitPackages(sha: string): Promise<CommitPublishSummary | null> {
    const packages = await this.metadataStorage.getCommitPackages(sha)
    if (packages.length === 0)
      return null

    return {
      sha,
      repository: packages[0]?.repository,
      publishedAt: packages[0]?.publishedAt || new Date().toISOString(),
      packages,
    }
  }

  /**
   * Get recent commits for a package
   */
  async getPackageCommits(name: string, limit = 20): Promise<CommitPublish[]> {
    return this.metadataStorage.getPackageCommits(name, limit)
  }

  /**
   * Get storage backends (for advanced use)
   */
  getStorageBackends(): { tarball: TarballStorage, metadata: MetadataStorage } {
    return {
      tarball: this.tarballStorage,
      metadata: this.metadataStorage,
    }
  }

  /** Public accessor for metadata storage (used by paywall, etc.) */
  get metadata(): MetadataStorage {
    return this.metadataStorage
  }
}

/**
 * Create a registry with default local configuration
 */
export function createLocalRegistry(baseUrl = 'http://localhost:3000'): Registry {
  return new Registry({
    s3Bucket: 'local',
    dynamoTable: 'local',
    baseUrl,
    npmFallback: true,
    port: 3000,
  })
}

/**
 * Create a production registry with S3 and DynamoDB
 */
export function createProductionRegistry(config: {
  s3Bucket: string
  dynamoTable: string
  baseUrl: string
  region?: string
  npmFallback?: boolean
  storageProvider?: 'aws' | 'backblaze' | 'hetzner'
  s3Endpoint?: string
  forcePathStyle?: boolean
  metadataBackend?: 'dynamodb' | 'object' | 'file'
}): Registry {
  return new Registry({
    s3Bucket: config.s3Bucket,
    s3Region: config.region,
    storageProvider: config.storageProvider,
    s3Endpoint: config.s3Endpoint,
    forcePathStyle: config.forcePathStyle,
    dynamoTable: config.dynamoTable,
    metadataBackend: config.metadataBackend,
    baseUrl: config.baseUrl,
    npmFallback: config.npmFallback ?? true,
  })
}

/**
 * Create a registry from environment variables.
 *
 * Storage provider is selected via STORAGE_PROVIDER (aws | backblaze | hetzner);
 * endpoint/region/credentials are resolved by the storage provider helper from
 * the matching env vars (S3_ENDPOINT, S3_REGION or B2_REGION, and the
 * provider credential vars B2_... / HETZNER_S3_...).
 */
export function createRegistryFromEnv(): Registry {
  const s3Bucket = process.env.S3_BUCKET || 'local'
  const dynamoTable = process.env.DYNAMODB_TABLE || 'pantry-registry'
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  const npmFallback = process.env.NPM_FALLBACK !== 'false'

  return new Registry({
    s3Bucket,
    // Leave region undefined unless explicitly set so the provider default applies.
    s3Region: process.env.S3_REGION || process.env.AWS_REGION,
    storageProvider: process.env.STORAGE_PROVIDER as 'aws' | 'backblaze' | 'hetzner' | undefined,
    s3Endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    dynamoTable,
    metadataBackend: process.env.METADATA_BACKEND as 'dynamodb' | 'object' | 'file' | undefined,
    metadataKey: process.env.METADATA_KEY,
    baseUrl,
    npmFallback,
  })
}
