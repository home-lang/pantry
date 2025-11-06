/**
 * Pantry Configuration Types
 *
 * Comprehensive type definitions for Pantry package manager configuration.
 * Based on the original LaunchpadConfig interface with enhanced documentation.
 *
 * @module ts-pantry
 */

import type {
  Dependencies,
  PackageAlias,
  PackageDomain,
  PackageName,
  Packages,
} from 'ts-pkgx'

export type {
  PackageAlias,
  PackageDomain,
  PackageName,
  Packages,
}

// Re-export key types from ts-pkgx
export type { Dependencies, CleanDependencies } from 'ts-pkgx'

/**
 * Pantry dependencies type with FULL validation
 *
 * Uses Dependencies from ts-pkgx which provides full type safety
 * for package names and versions without the Record<string, never> constraint
 * that causes issues when types cross module boundaries.
 */
export type PantryDependencies = Dependencies

/**
 * Helper function to create fully typed dependencies with package name and version validation
 *
 * This function provides IntelliSense and type safety for both package names AND versions!
 * Invalid package names or versions will cause TypeScript errors.
 *
 * @example
 * ```ts
 * import { defineDependencies } from 'ts-pantry'
 *
 * const deps = defineDependencies({
 *   'bun.com': '^1.3.0',       // ✅ Valid
 *   'sqlite.org': '^3.47.2',   // ✅ Valid
 *   // 'bun.com': '^999.0.0',   // ❌ Error: invalid version
 *   // 'fake-pkg': 'latest',    // ❌ Error: package doesn't exist
 * })
 * ```
 */
export function defineDependencies<const T extends Dependencies>(deps: T): T {
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
 * Service health check configuration
 */
export interface ServiceHealthCheck {
  command: string | string[]
  interval: number
  timeout: number
  retries: number
  expectedExitCode?: number
}

/**
 * Service definition
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

/**
 * Service status
 */
export type ServiceStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'failed' | 'unknown'

/**
 * Service instance
 */
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

/**
 * Service manager state
 */
export interface ServiceManagerState {
  services: Map<string, ServiceInstance>
  operations: ServiceOperation[]
  config?: Record<string, any>
  lastScanTime?: Date
}

/**
 * Service operation
 */
export interface ServiceOperation {
  action: 'start' | 'stop' | 'restart' | 'enable' | 'disable'
  serviceName: string
  timestamp: Date
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  duration?: number
  error?: string
}

/**
 * Service configuration
 */
export interface ServiceConfig {
  name: string
  definition: ServiceDefinition
  instances: ServiceInstance[]
}

/**
 * Post-setup command configuration
 */
export interface PostSetupCommand {
  /** Human-readable name for the command */
  name?: string
  /** Command to execute */
  command: string
  /** Command arguments */
  args?: string[]
  /** Description of what the command does */
  description?: string
  /** Condition that must be met for command to run */
  condition?: string
  /** Whether to run the command in the background */
  runInBackground?: boolean
  /** Whether the command is required to succeed */
  required?: boolean
}

/**
 * Lifecycle hooks configuration
 */
export interface LifecycleHooks {
  /** Enable lifecycle hooks */
  enabled?: boolean
  /** Commands to run */
  commands?: PostSetupCommand[]
}

/**
 * Base Pantry configuration interface without dependencies
 */
interface PantryConfigBase {
  /**
   * Installation path for packages
   * @default System-dependent
   */
  installPath?: string

  /**
   * Force reinstall packages even if they exist
   * @default false
   */
  forceReinstall?: boolean

  /**
   * Automatically add installed binaries to PATH
   * @default true
   */
  autoAddToPath?: boolean

  /**
   * Auto-install tools/binaries when referenced
   * @default true
   */
  autoInstall?: boolean

  /**
   * Install runtime dependencies of requested packages
   * - false: only install explicitly requested packages
   * - true: resolve and install full dependency graphs
   * @default false
   */
  installDependencies?: boolean

  /**
   * Install package-declared build-time dependencies
   * - false: do not install build-time deps
   * - true: install for all packages
   * - string | string[]: install only for listed package(s)
   * @default false
   */
  installBuildDeps?: boolean | string | string[]
}

/**
 * Pantry configuration interface (formerly LaunchpadConfig)
 *
 * FULLY TYPED with validation for both package names AND versions
 */
export interface PantryConfig extends PantryConfigBase {
  /**
   * Package dependencies to install (similar to deps.yaml)
   * FULLY TYPED package names AND versions from ts-pkgx
   *
   * Supports both domain names ('bun.com') and aliases ('bun')
   * Invalid package names and versions will cause TypeScript errors
   *
   * @example
   * ```ts
   * dependencies: {
   *   'bun.com': '^1.3.0',
   *   'sqlite.org': '^3.47.2',
   * }
   * ```
   */
  dependencies?: Dependencies

  /**
   * Install all dependencies globally (system-wide)
   * @default false
   */
  global?: boolean

  /**
   * Shell activation/deactivation messages
   */
  shellMessages?: {
    activation?: string
    deactivation?: string
  }

  /**
   * Sudo password for operations requiring elevated privileges
   */
  sudoPassword?: string

  /**
   * Enable development-aware features
   * @default false
   */
  devAware?: boolean

  /**
   * Maximum retries for failed operations
   * @default 3
   */
  maxRetries?: number

  /**
   * Operation timeout in milliseconds
   * @default 30000
   */
  timeout?: number

  /**
   * Create symlinks for different package versions
   * @default false
   */
  symlinkVersions?: boolean

  /**
   * Path for shell shims
   */
  shimPath?: string

  /**
   * Show shell activation/deactivation messages
   * @default true
   */
  showShellMessages?: boolean

  /**
   * Custom shell activation message
   */
  shellActivationMessage?: string

  /**
   * Custom shell deactivation message
   */
  shellDeactivationMessage?: string

  /**
   * Use package registry for lookups
   * @default true
   */
  useRegistry?: boolean

  /**
   * Installation method to use
   */
  installMethod?: string

  /**
   * Cache configuration
   */
  cache?: {
    /** Enable caching */
    enabled?: boolean
    /** Maximum cache size in MB */
    maxSize?: number
    /** Cache TTL in hours */
    ttlHours?: number
    /** Auto-cleanup when cache exceeds maxSize */
    autoCleanup?: boolean
    /** Directory for cache storage */
    directory?: string
    /** Enable compression for cached files */
    compression?: boolean
  }

  /**
   * Network and download configuration
   */
  network?: {
    /** Connection timeout in milliseconds */
    timeout?: number
    /** Max concurrent downloads */
    maxConcurrent?: number
    /** Max retries for failed downloads */
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
    /** Follow redirects */
    followRedirects?: boolean
  }

  /**
   * Security configuration
   */
  security?: {
    /** Verify package signatures */
    verifySignatures?: boolean
    /** Trusted package sources */
    trustedSources?: string[]
    /** Allow packages from untrusted sources */
    allowUntrusted?: boolean
    /** Check for package vulnerabilities */
    checkVulnerabilities?: boolean
  }

  /**
   * Logging configuration
   */
  logging?: {
    /** Log level */
    level?: 'debug' | 'info' | 'warn' | 'error'
    /** Log to file */
    toFile?: boolean
    /** Log file path */
    filePath?: string
    /** Max log file size in MB */
    maxFileSize?: number
    /** Number of log files to keep */
    keepFiles?: number
    /** Include timestamps in logs */
    timestamps?: boolean
    /** JSON format logs */
    json?: boolean
  }

  /**
   * Update policies
   */
  updates?: {
    /** Check for package updates */
    checkForUpdates?: boolean
    /** Auto-update packages */
    autoUpdate?: boolean
    /** Update check frequency in hours */
    checkFrequency?: number
    /** Include pre-release versions */
    includePrereleases?: boolean
    /** Channels to check */
    channels?: ('stable' | 'beta' | 'nightly')[]
  }

  /**
   * Resource management
   */
  resources?: {
    /** Max disk space for packages in MB */
    maxDiskUsage?: number
    /** Max memory usage for operations in MB */
    maxMemoryUsage?: number
    /** Cleanup old versions automatically */
    autoCleanup?: boolean
    /** Keep N latest versions of each package */
    keepVersions?: number
  }

  /**
   * Environment profiles for different contexts
   */
  profiles?: {
    /** Current active profile */
    active?: string
    /** Development profile settings */
    development?: Partial<PantryConfig>
    /** Production profile settings */
    production?: Partial<PantryConfig>
    /** CI profile settings */
    ci?: Partial<PantryConfig>
    /** Custom profiles */
    custom?: Record<string, Partial<PantryConfig>>
  }

  /**
   * Commands to run before any installation/services
   */
  preSetup?: LifecycleHooks

  /**
   * Commands to run after environment is prepared
   */
  postSetup?: LifecycleHooks

  /**
   * Commands to run just before activation
   */
  preActivation?: LifecycleHooks

  /**
   * Commands to run right after activation completes
   */
  postActivation?: LifecycleHooks

  /**
   * Service management configuration
   */
  services?: {
    /** Enable service management */
    enabled?: boolean
    /** Auto-start services */
    autoStart?: boolean
    /** Alias for autoStart */
    shouldAutoStart?: boolean
    /** Data directory for services */
    dataDir?: string
    /** Log directory for services */
    logDir?: string
    /** Config directory for services */
    configDir?: string
    /** Auto-restart failed services */
    autoRestart?: boolean
    /** Startup timeout in milliseconds */
    startupTimeout?: number
    /** Shutdown timeout in milliseconds */
    shutdownTimeout?: number
    /** Infer services from framework config */
    infer?: boolean

    /**
     * Database configuration
     */
    database?: {
      /** Database connection type */
      connection?: 'mysql' | 'postgres' | 'postgresql' | 'mariadb' | 'redis' | 'mongodb' | 'sqlite'
      /** Database name to create */
      name?: string
      /** Database username */
      username?: string
      /** Database password */
      password?: string
      /** Authentication method */
      authMethod?: 'trust' | 'md5' | 'scram-sha-256'
    }

    /**
     * Commands to run after database setup
     * e.g., migrations, seeding
     */
    postDatabaseSetup?: string | string[]

    /**
     * Framework-specific service detection
     */
    frameworks?: {
      enabled?: boolean
      stacks?: {
        enabled?: boolean
        autoDetect?: boolean
      }
    }
  }

  /**
   * Enable verbose output
   * @default false
   */
  verbose?: boolean
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
 * Helper function to define Pantry configuration with full type safety
 */
export function definePantryConfig(
  config: PantryConfig
): PantryConfig {
  return config
}

export default definePantryConfig
