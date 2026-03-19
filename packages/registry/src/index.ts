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
export { createServer, createHandler } from './server'

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
  AnalyticsCategory,
  AnalyticsEvent,
  DownloadEvent,
  PackageStats,
  AnalyticsStorage,
  InstallAnalyticsResult,
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
  DynamoDBZigStorage,
} from './zig'
export type {
  ZigManifest,
  ZigDependency,
  ZigPackageMetadata,
  ZigPackageRecord,
  ZigPackageStorage,
} from './zig'

// PHP/Composer package support
export {
  computePhpChecksum,
  parseComposerJson,
  generateComposerRequire,
  createPhpStorage,
  InMemoryPhpStorage,
  DynamoDBPhpStorage,
} from './php'
export type {
  ComposerManifest,
  ComposerAuthor,
  PhpPackageMetadata,
  PhpPackageRecord,
  PhpPackageStorage,
} from './php'

// Packagist fallback (PHP ecosystem)
export {
  searchPackagist,
  fetchFromPackagist,
  getPackagistCount,
} from './packagist-fallback'

// Paywall
export {
  checkPaywallAccess,
  configurePaywall,
  createCheckoutSession,
  handleStripeWebhook,
  formatPrice,
} from './paywall'

// Authentication
export {
  AuthService,
  AuthError,
  InMemoryAuthStorage,
  DynamoDBAuthStorage,
  createAuthStorage,
  generateApiToken,
  generateSessionToken,
  hashToken,
  hashPassword,
  verifyPassword,
  isUserApiToken,
} from './auth'

// Types
export type {
  PackageMetadata,
  PackageVersion,
  PackageRecord,
  PackagePaywall,
  PackageAccessGrant,
  SearchResult,
  PublishRequest,
  RegistryConfig,
  TarballStorage,
  MetadataStorage,
  User,
  ApiToken,
  ApiTokenInfo,
  Session,
  TokenValidationResult,
  AuthStorage,
} from './types'
