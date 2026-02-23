/**
 * Package metadata stored in the registry
 */
export interface PackageMetadata {
  name: string
  version: string
  description?: string
  repository?: string
  homepage?: string
  license?: string
  author?: string
  keywords?: string[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  tarballUrl?: string
  checksum?: string
  publishedAt: string
  downloads?: number
}

/**
 * Package version entry
 */
export interface PackageVersion {
  version: string
  tarballUrl: string
  checksum: string
  publishedAt: string
  size: number
}

/**
 * Full package record with all versions
 */
export interface PackageRecord {
  name: string
  description?: string
  repository?: string
  homepage?: string
  license?: string
  author?: string
  keywords?: string[]
  versions: Record<string, PackageVersion>
  latestVersion: string
  createdAt: string
  updatedAt: string
  totalDownloads: number
}

/**
 * Search result item
 */
export interface SearchResult {
  name: string
  version: string
  description?: string
  keywords?: string[]
  author?: string
  downloads: number
}

/**
 * Publish request body
 */
export interface PublishRequest {
  metadata: PackageMetadata
  tarball: Blob | ArrayBuffer
}

/**
 * Registry configuration
 */
export interface RegistryConfig {
  /** S3 bucket name for tarball storage */
  s3Bucket: string
  /** S3 region */
  s3Region?: string
  /** DynamoDB table name for metadata */
  dynamoTable: string
  /** Base URL for the registry (used in tarball URLs) */
  baseUrl: string
  /** Enable npmjs fallback for missing packages */
  npmFallback?: boolean
  /** Port to run the server on */
  port?: number
}

/**
 * Commit publish record — represents a package published from a specific git commit
 * (equivalent to pkg-pr-new continuous releases)
 */
export interface CommitPublish {
  /** Package name (e.g., "@stacksjs/actions") */
  name: string
  /** Git commit SHA (short or full) */
  sha: string
  /** URL to download the tarball */
  tarballUrl: string
  /** SHA-256 checksum of the tarball */
  checksum: string
  /** ISO 8601 timestamp of when this was published */
  publishedAt: string
  /** Repository URL (e.g., "https://github.com/stacksjs/stacks") */
  repository?: string
  /** Relative path of the package within the repo */
  packageDir?: string
  /** Package version from package.json at time of commit */
  version?: string
  /** Tarball size in bytes */
  size?: number
}

/**
 * Summary of all packages published for a single commit
 */
export interface CommitPublishSummary {
  sha: string
  repository?: string
  publishedAt: string
  packages: CommitPublish[]
}

/**
 * Storage interface for tarball storage
 */
export interface TarballStorage {
  upload(key: string, data: ArrayBuffer): Promise<string>
  download(key: string): Promise<ArrayBuffer>
  exists(key: string): Promise<boolean>
  delete(key: string): Promise<void>
  getUrl(key: string): string
}

/**
 * Metadata storage interface
 */
export interface MetadataStorage {
  getPackage(name: string): Promise<PackageRecord | null>
  getPackageVersion(name: string, version: string): Promise<PackageMetadata | null>
  putPackage(record: PackageRecord): Promise<void>
  putVersion(name: string, version: string, metadata: PackageMetadata): Promise<void>
  search(query: string, limit?: number): Promise<SearchResult[]>
  listVersions(name: string): Promise<string[]>
  incrementDownloads(name: string, version: string): Promise<void>

  // Commit publish operations
  putCommitPublish(publish: CommitPublish): Promise<void>
  getCommitPublish(sha: string, name: string): Promise<CommitPublish | null>
  getCommitPackages(sha: string): Promise<CommitPublish[]>
  getPackageCommits(name: string, limit?: number): Promise<CommitPublish[]>
}
