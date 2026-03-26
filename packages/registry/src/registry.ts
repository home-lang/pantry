import type {
  CommitPublish,
  CommitPublishSummary,
  MetadataStorage,
  PackageMetadata,
  RegistryConfig,
  SearchResult,
  TarballStorage,
} from './types'
import { downloadNpmTarball, fetchFromNpm, listNpmVersions, searchNpm } from './npm-fallback'
import { FileMetadataStorage } from './storage/metadata'
import { DynamoDBMetadataStorage } from './storage/dynamodb-metadata'
import { LocalStorage, S3Storage } from './storage/s3'

/**
 * Pantry Registry - Main registry class
 */
export class Registry {
  private config: RegistryConfig
  private tarballStorage: TarballStorage
  private metadataStorage: MetadataStorage

  constructor(config: RegistryConfig) {
    this.config = config

    // Initialize storage backends
    if (config.s3Bucket && config.s3Bucket !== 'local') {
      this.tarballStorage = new S3Storage(config.s3Bucket, config.s3Region, config.baseUrl)
    }
    else {
      // Use local storage for development
      this.tarballStorage = new LocalStorage('./.registry/tarballs', config.baseUrl)
    }

    if (config.dynamoTable && config.dynamoTable !== 'local') {
      // Use DynamoDB for production
      this.metadataStorage = new DynamoDBMetadataStorage(config.dynamoTable, config.s3Region || 'us-east-1')
    }
    else {
      // Use file-based storage for development
      this.metadataStorage = new FileMetadataStorage('./.registry/metadata.json')
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
    const results = await this.metadataStorage.search(query, limit)

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

        // Otherwise, fetch from the URL
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
  async publish(metadata: PackageMetadata, tarball: ArrayBuffer): Promise<void> {
    // Generate tarball key
    const safeName = metadata.name.replace('@', '').replace('/', '-')
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
    options?: { repository?: string, packageDir?: string, version?: string },
  ): Promise<CommitPublish> {
    const safeName = name.replaceAll('@', '').replaceAll('/', '-')
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
    }

    // Store metadata
    await this.metadataStorage.putCommitPublish(publish)

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
    if (sha.length < 40 && sha.length >= 7) {
      try {
        const safeName = name.replaceAll('@', '').replaceAll('/', '-')
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

    const safeName = name.replaceAll('@', '').replaceAll('/', '-')
    const resolvedSha = publish.sha || sha
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
}): Registry {
  return new Registry({
    s3Bucket: config.s3Bucket,
    s3Region: config.region || 'us-east-1',
    dynamoTable: config.dynamoTable,
    baseUrl: config.baseUrl,
    npmFallback: config.npmFallback ?? true,
  })
}

/**
 * Create a registry from environment variables
 */
export function createRegistryFromEnv(): Registry {
  const s3Bucket = process.env.S3_BUCKET || 'local'
  const dynamoTable = process.env.DYNAMODB_TABLE || 'pantry-registry'
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  const region = process.env.AWS_REGION || 'us-east-1'
  const npmFallback = process.env.NPM_FALLBACK !== 'false'

  return new Registry({
    s3Bucket,
    s3Region: region,
    dynamoTable,
    baseUrl,
    npmFallback,
  })
}
