/**
 * Pantry Registry
 *
 * A package registry backend compatible with the Pantry CLI.
 * Supports S3 storage for tarballs and DynamoDB for metadata,
 * with npmjs fallback for packages not in the registry.
 */

// Main registry class
export { Registry, createLocalRegistry, createProductionRegistry, createRegistryFromEnv } from './registry'

// Server
export { createServer } from './server'

// Storage backends
export { S3Storage, LocalStorage } from './storage/s3'
export { InMemoryMetadataStorage, FileMetadataStorage } from './storage/metadata'
export { DynamoDBMetadataStorage, createDynamoDBMetadataStorage } from './storage/dynamodb-metadata'

// npm fallback utilities
export {
  fetchFromNpm,
  listNpmVersions,
  searchNpm,
  downloadNpmTarball,
} from './npm-fallback'

// Analytics
export {
  createAnalytics,
  DynamoDBAnalytics,
  InMemoryAnalytics,
} from './analytics'
export type {
  DownloadEvent,
  PackageStats,
  AnalyticsStorage,
} from './analytics'

// Zig package support
export {
  computeZigHash,
  validateZigHash,
  parseZigZon,
  generateDependencyEntry,
  generateFetchCommand,
  createZigStorage,
  InMemoryZigStorage,
} from './zig'
export type {
  ZigManifest,
  ZigDependency,
  ZigPackageMetadata,
  ZigPackageRecord,
  ZigPackageStorage,
} from './zig'

// Types
export type {
  PackageMetadata,
  PackageVersion,
  PackageRecord,
  SearchResult,
  PublishRequest,
  RegistryConfig,
  TarballStorage,
  MetadataStorage,
} from './types'
