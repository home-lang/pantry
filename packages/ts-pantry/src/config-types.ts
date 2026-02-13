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
} from './package-types'

export type { PackageAlias, PackageDomain, PackageName }

export type { Dependencies, CleanDependencies } from './package-types'

/**
 * Pantry dependencies type with FULL validation
 */
export type PantryDependencies = Dependencies

/**
 * Helper function to create fully typed dependencies with package name and version validation
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

/**
 * Configuration for the package manager
 */
export const DISTRIBUTION_CONFIG = {
  baseUrl: 'https://dist.pkgx.dev',
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
  name?: string
  command: string
  args?: string[]
  description?: string
  condition?: string
  runInBackground?: boolean
  required?: boolean
}

/**
 * Lifecycle hooks configuration
 */
export interface LifecycleHooks {
  enabled?: boolean
  commands?: PostSetupCommand[]
}

/**
 * Base Pantry configuration interface without dependencies
 */
interface PantryConfigBase {
  installPath?: string
  forceReinstall?: boolean
  autoAddToPath?: boolean
  autoInstall?: boolean
  installDependencies?: boolean
  installBuildDeps?: boolean | string | string[]
}

/**
 * Pantry configuration interface (formerly LaunchpadConfig)
 *
 * FULLY TYPED with validation for both package names AND versions
 */
export interface PantryConfig extends PantryConfigBase {
  dependencies?: Dependencies
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

  cache?: {
    enabled?: boolean
    maxSize?: number
    ttlHours?: number
    autoCleanup?: boolean
    directory?: string
    compression?: boolean
  }

  network?: {
    timeout?: number
    maxConcurrent?: number
    retries?: number
    proxy?: {
      http?: string
      https?: string
      bypass?: string
    }
    userAgent?: string
    followRedirects?: boolean
  }

  security?: {
    verifySignatures?: boolean
    trustedSources?: string[]
    allowUntrusted?: boolean
    checkVulnerabilities?: boolean
  }

  logging?: {
    level?: 'debug' | 'info' | 'warn' | 'error'
    toFile?: boolean
    filePath?: string
    maxFileSize?: number
    keepFiles?: number
    timestamps?: boolean
    json?: boolean
  }

  updates?: {
    checkForUpdates?: boolean
    autoUpdate?: boolean
    checkFrequency?: number
    includePrereleases?: boolean
    channels?: ('stable' | 'beta' | 'nightly')[]
  }

  resources?: {
    maxDiskUsage?: number
    maxMemoryUsage?: number
    autoCleanup?: boolean
    keepVersions?: number
  }

  profiles?: {
    active?: string
    development?: Partial<PantryConfig>
    production?: Partial<PantryConfig>
    ci?: Partial<PantryConfig>
    custom?: Record<string, Partial<PantryConfig>>
  }

  preSetup?: LifecycleHooks
  postSetup?: LifecycleHooks
  preActivation?: LifecycleHooks
  postActivation?: LifecycleHooks

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
    infer?: boolean

    database?: {
      connection?: 'mysql' | 'postgres' | 'postgresql' | 'mariadb' | 'redis' | 'mongodb' | 'sqlite'
      name?: string
      username?: string
      password?: string
      authMethod?: 'trust' | 'md5' | 'scram-sha-256'
    }

    postDatabaseSetup?: string | string[]

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
  config: PantryConfig,
): PantryConfig {
  return config
}

export default definePantryConfig
