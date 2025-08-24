import type { aliases, packages } from 'ts-pkgx'

// Extract all package alias names from ts-pkgx
export type PackageAlias = keyof typeof aliases

// Extract all package domain names from ts-pkgx packages
export type PackageDomain = keyof typeof packages

// Union type of all valid package identifiers (aliases + domains)
export type PackageName = PackageAlias | PackageDomain

// Type for package with optional version (allowing string for flexibility)
export type PackageSpec = string

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
    /** Infer services to auto-start from framework config (e.g., Laravel/Stacks .env) */
    infer?: boolean
    database?: {
      username?: string
      password?: string
      authMethod?: 'trust' | 'md5' | 'scram-sha-256'
    }
    frameworks?: {
      enabled?: boolean
      laravel?: {
        enabled?: boolean
        autoDetect?: boolean
      }
      stacks?: {
        enabled?: boolean
        autoDetect?: boolean
      }
    }
    php?: {
      enabled?: boolean
      strategy?: 'auto-detect'
      version?: string
      autoDetect?: {
        enabled?: boolean
        includeAllDatabases?: boolean
        includeEnterprise?: boolean
      }
      configuration?: 'laravel-mysql' | 'laravel-postgres' | 'laravel-sqlite' | 'api-only' | 'enterprise' | 'wordpress' | 'full-stack'
      /** If true, auto-install the PHP binary when needed. Default: true in practice. */
      autoInstall?: boolean
      /**
       * Deprecated: prefer global `installBuildDeps` with package list.
       * If provided here, it will still be honored for PHP only.
       */
      installBuildDeps?: boolean | string | string[]
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
 * PHP configuration interface
 */
export interface PHPConfig {
  version?: string
  extensions?: string[] | {
    core?: string[]
    database?: string[]
    web?: string[]
    utility?: string[]
    optional?: string[]
  }
  iniSettings?: Record<string, string>
  enabled?: boolean
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
