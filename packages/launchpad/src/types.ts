import type {
  PackageAlias,
  PackageDomain,
  PackageName,
  Packages,
  Dependencies
} from 'ts-pkgx'
import { createDependencies } from 'ts-pkgx'

// Re-export ts-pkgx types for internal use
export type {
  PackageAlias,
  PackageDomain,
  PackageName,
  Packages,
  Dependencies
}

// Re-export ts-pkgx utilities
export { createDependencies }

/**
 * Helper function to create a fully typed dependencies configuration with version validation
 * This provides IntelliSense and type safety for both package names AND versions!
 */
export function defineFullyTypedDependencies(deps: FullyTypedDependencies): FullyTypedDependencies {
  return deps
}


/**
 * Helper function to create a typed dependencies configuration (backward compatible)
 * This provides IntelliSense and type safety while maintaining flexibility
 */
export function definePackageDependencies(deps: TypedDependencies): TypedDependencies {
  return deps
}

/**
 * Helper function to create a fully typed dependencies array
 */
export function definePackageList<T extends readonly PackageName[]>(packages: T): T {
  return packages
}

// Type for package with optional version (allowing string for flexibility)
export type PackageSpec = string

// Type for package dependency specification in config
export interface PackageDependencySpec {
  version?: string
  global?: boolean
}

// Extract version types from ts-pkgx packages
type PackageVersions<T extends PackageName> = T extends keyof Packages
  ? Packages[T] extends { versions: readonly (infer V)[] }
    ? V extends string
      ? V
      : never
    : never
  : never

// Version constraint that allows valid versions or version ranges
type VersionConstraint<T extends PackageName> =
  | PackageVersions<T>
  | `^${PackageVersions<T>}`
  | `~${PackageVersions<T>}`
  | `>=${PackageVersions<T>}`
  | `<=${PackageVersions<T>}`
  | `>${PackageVersions<T>}`
  | `<${PackageVersions<T>}`
  | 'latest'
  | '*'

// Enhanced dependency spec with typed versions
export interface TypedPackageDependencySpec<T extends PackageName> {
  version?: VersionConstraint<T>
  global?: boolean
}

// Fully typed dependencies with version validation
// Note: TypeScript will highlight property names for invalid versions (language limitation)
export type FullyTypedDependencies = {
  readonly [K in PackageName]?: VersionConstraint<K> | TypedPackageDependencySpec<K>
}

// Backward compatible typed dependencies (allows string versions for flexibility)
export type TypedDependencies = {
  [K in PackageName]?: string | PackageDependencySpec
}

// Supported distribution formats
export type SupportedFormat = 'tar.xz' | 'tar.gz'
export type SupportedPlatform = 'darwin' | 'linux' | 'windows'
export type SupportedArchitecture = 'x86-64' | 'aarch64' | 'armv7l'

/**
 * Configuration for the package manager
 */
export const DISTRIBUTION_CONFIG = {
  baseUrl: 'https://dist.pkgx.dev',
  // Future: we can switch this to our own endpoint
  // baseUrl: 'https://dist.launchpad.dev',
}

/**
 * Cache metadata structure
 */
export interface CacheMetadata {
  version: string
  packages: Record<string, {
    domain: string
    version: string
    format: string
    downloadedAt: string
    size: number
    checksum?: string
    lastAccessed: string
  }>
}

/**
 * Launchpad configuration interface
 */
export interface LaunchpadConfig {
  installPath?: string
  forceReinstall?: boolean
  autoAddToPath?: boolean
  /** If true, auto-install tools/binaries themselves when referenced. Default: true in practice. */
  autoInstall?: boolean
  /**
   * Control installing runtime dependencies of requested packages.
   * - false (default): only install explicitly requested packages
   * - true: resolve and install full dependency graphs
   * Can be overridden via env LAUNCHPAD_INSTALL_DEPS=1|true
   */
  installDependencies?: boolean
  /**
   * Control installing package-declared build-time dependencies (aka pantry deps).
   * - false (default): do not install build-time deps
   * - true: install for all packages
   * - string | string[]: install only for the listed package name(s)
   */
  installBuildDeps?: boolean | string | string[]
  /**
   * Package dependencies to install (similar to deps.yaml)
   * FULLY TYPED package names AND versions from ts-pkgx
   *
   * Supports both domain names ('bun.sh') and aliases ('bun')
   * Invalid package names and versions will cause TypeScript errors
   *
   * Use createDependencies() helper for enhanced developer experience:
   * dependencies: createDependencies({ 'bun': '^1.2.19' })
   */
  dependencies?: Dependencies
  /**
   * Global flag for dependencies - when true, all dependencies are installed globally
   */
  global?: boolean
  shellMessages?: {
    activation?: string
    deactivation?: string
  }
  sudoPassword?: string
  devAware?: boolean
  maxRetries?: number
  timeout?: number
  symlinkVersions?: boolean
  shimPath?: string
  showShellMessages?: boolean
  shellActivationMessage?: string
  shellDeactivationMessage?: string
  useRegistry?: boolean
  installMethod?: string
  /** Cache configuration */
  cache?: {
    enabled?: boolean
    /** Maximum cache size in MB (default: 1024) */
    maxSize?: number
    /** Cache TTL in hours (default: 168 = 1 week) */
    ttlHours?: number
    /** Auto-cleanup when cache exceeds maxSize (default: true) */
    autoCleanup?: boolean
    /** Directory for cache storage */
    directory?: string
    /** Compression for cached files (default: true) */
    compression?: boolean
  }
  /** Network and download configuration */
  network?: {
    /** Connection timeout in ms (default: 30000) */
    timeout?: number
    /** Max concurrent downloads (default: 3) */
    maxConcurrent?: number
    /** Max retries for failed downloads (default: 3) */
    retries?: number
    /** Proxy configuration */
    proxy?: {
      http?: string
      https?: string
      /** Comma-separated list of hosts to bypass proxy */
      bypass?: string
    }
    /** User agent string for HTTP requests */
    userAgent?: string
    /** Follow redirects (default: true) */
    followRedirects?: boolean
  }
  /** Security configuration */
  security?: {
    /** Verify package signatures (default: true) */
    verifySignatures?: boolean
    /** Trusted package sources */
    trustedSources?: string[]
    /** Allow packages from untrusted sources (default: false) */
    allowUntrusted?: boolean
    /** Check for package vulnerabilities (default: true) */
    checkVulnerabilities?: boolean
  }
  /** Logging configuration */
  logging?: {
    /** Log level: debug, info, warn, error (default: info) */
    level?: 'debug' | 'info' | 'warn' | 'error'
    /** Log to file (default: false) */
    toFile?: boolean
    /** Log file path */
    filePath?: string
    /** Max log file size in MB (default: 10) */
    maxFileSize?: number
    /** Number of log files to keep (default: 5) */
    keepFiles?: number
    /** Include timestamps in logs (default: true) */
    timestamps?: boolean
    /** JSON format logs (default: false) */
    json?: boolean
  }
  /** Update policies */
  updates?: {
    /** Check for package updates (default: true) */
    checkForUpdates?: boolean
    /** Auto-update packages (default: false) */
    autoUpdate?: boolean
    /** Update check frequency in hours (default: 24) */
    checkFrequency?: number
    /** Include pre-release versions (default: false) */
    includePrereleases?: boolean
    /** Channels to check: stable, beta, nightly */
    channels?: ('stable' | 'beta' | 'nightly')[]
  }
  /** Resource management */
  resources?: {
    /** Max disk space for packages in MB */
    maxDiskUsage?: number
    /** Max memory usage for operations in MB */
    maxMemoryUsage?: number
    /** Cleanup old versions automatically (default: true) */
    autoCleanup?: boolean
    /** Keep N latest versions of each package (default: 3) */
    keepVersions?: number
  }
  /** Environment profiles */
  profiles?: {
    /** Current active profile */
    active?: string
    /** Development profile settings */
    development?: Partial<LaunchpadConfig>
    /** Production profile settings */
    production?: Partial<LaunchpadConfig>
    /** CI profile settings */
    ci?: Partial<LaunchpadConfig>
    /** Custom profiles */
    custom?: Record<string, Partial<LaunchpadConfig>>
  }
  /** Project-level post-setup commands (run after environment is prepared) */
  postSetup?: {
    enabled?: boolean
    commands?: PostSetupCommand[]
  }
  /** Project-level pre-setup commands (run before any installation/services) */
  preSetup?: {
    enabled?: boolean
    commands?: PostSetupCommand[]
  }
  /** Commands to run just before activation (after install/services) */
  preActivation?: {
    enabled?: boolean
    commands?: PostSetupCommand[]
  }
  /** Commands to run right after activation completes */
  postActivation?: {
    enabled?: boolean
    commands?: PostSetupCommand[]
  }
  services?: {
    enabled?: boolean
    autoStart?: boolean
    shouldAutoStart?: boolean
    dataDir?: string
    logDir?: string
    configDir?: string
    autoRestart?: boolean
    startupTimeout?: number
    shutdownTimeout?: number
    /** Infer services to auto-start from framework config (e.g., Stacks .env) */
    infer?: boolean
    database?: {
      username?: string
      password?: string
      authMethod?: 'trust' | 'md5' | 'scram-sha-256'
    }
    frameworks?: {
      enabled?: boolean
      stacks?: {
        enabled?: boolean
        autoDetect?: boolean
      }
    }
  }
  verbose?: boolean
}

/**
 * GitHub release interface
 */
export interface GitHubRelease {
  tag_name: string
  assets?: Array<{
    name: string
    browser_download_url: string
  }>
}

/**
 * Service-related types
 */
export interface ServiceDefinition {
  name?: string
  displayName?: string
  description?: string
  packageDomain?: string
  executable: string
  args?: string[]
  env?: Record<string, string>
  dataDirectory?: string
  configFile?: string
  logFile?: string
  pidFile?: string
  port?: number
  workingDirectory?: string
  dependencies?: string[]
  postStartCommands?: string[][]
  healthCheck?: ServiceHealthCheck
  initCommand?: string[]
  supportsGracefulShutdown?: boolean
  config?: Record<string, any>
  extensions?: Record<string, any>
}

export interface ServiceHealthCheck {
  command: string | string[]
  interval: number
  timeout: number
  retries: number
  expectedExitCode?: number
}

export interface ServiceInstance {
  name: string
  status: ServiceStatus
  pid?: number
  startTime?: Date
  lastHealthCheck?: Date
  lastCheckedAt?: Date
  startedAt?: Date
  enabled?: boolean
  definition?: ServiceDefinition
  logFile?: string
  dataDir?: string
  configFile?: string
  config?: Record<string, any>
}

export type ServiceStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'failed' | 'unknown'

export interface ServiceManagerState {
  services: Map<string, ServiceInstance>
  operations: ServiceOperation[]
  config?: Record<string, any>
  lastScanTime?: Date
}

export interface ServiceOperation {
  action: 'start' | 'stop' | 'restart' | 'enable' | 'disable'
  serviceName: string
  timestamp: Date
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  duration?: number
  error?: string
}

export interface ServiceConfig {
  name: string
  definition: ServiceDefinition
  instances: ServiceInstance[]
}

export interface LaunchdPlist {
  Label: string
  ProgramArguments: string[]
  RunAtLoad: boolean
  KeepAlive?: boolean | {
    SuccessfulExit?: boolean
    NetworkState?: boolean
  }
  StandardOutPath?: string
  StandardErrorPath?: string
  WorkingDirectory?: string
  EnvironmentVariables?: Record<string, string>
  UserName?: string
}

export interface SystemdService {
  Unit: {
    Description: string
    After?: string[]
    Wants?: string[]
  }
  Service: {
    Type: string
    ExecStart: string
    ExecStop?: string
    WorkingDirectory?: string
    Environment?: string[]
    User?: string
    Restart?: string
    RestartSec?: number
    TimeoutStartSec?: number
    TimeoutStopSec?: number
    PIDFile?: string
  }
  Install: {
    WantedBy: string[]
  }
}


/**
 * Post-setup command interface
 */
export interface PostSetupCommand {
  name?: string
  command: string
  args?: string[]
  description?: string
  condition?: string
  runInBackground?: boolean
  required?: boolean
}
