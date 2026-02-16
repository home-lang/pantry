# API Reference

This document provides detailed information about pantry's API for developers who want to integrate with or extend pantry.

## Installation

```bash
npm install ts-pantry
```

## Core Modules

### Cache Management Module

```typescript
import { cleanSystem, clearCache } from 'ts-pantry'

/**

 * Clear all cached packages and downloads
 * @param options Configuration options for cache clearing
 * @param options.dryRun Whether to preview what would be cleared without actually clearing
 * @param options.force Skip confirmation prompts
 * @param options.verbose Enable verbose output
 * @returns Promise resolving to cache clearing results

 */
async function clearCache(options?: {
  dryRun?: boolean
  force?: boolean
  verbose?: boolean
}): Promise<{
  success: boolean
  freedSpace: number
  removedFiles: number
  errors?: string[]
}>

/**

 * Perform comprehensive cleanup of all pantry-managed resources
 * @param options Configuration options for system cleanup
 * @param options.dryRun Whether to preview what would be removed without actually removing
 * @param options.force Skip confirmation prompts
 * @param options.keepCache Keep cached downloads (only remove installed packages)
 * @param options.verbose Enable verbose output during cleanup
 * @returns Promise resolving to cleanup results

 */
async function cleanSystem(options?: {
  dryRun?: boolean
  force?: boolean
  keepCache?: boolean
  verbose?: boolean
}): Promise<{
  success: boolean
  freedSpace: number
  removedFiles: number
  removedPackages: string[]
  errors?: string[]
}>
```

### Installation Module

```typescript
import { install, install*bun, install*prefix } from 'ts-pantry'

/**

 * Install one or more packages
 * @param args Package names to install
 * @param basePath Path where packages should be installed
 * @returns Array of installed file paths

 */
async function install(args: string[], basePath: string): Promise<string[]>

/**

 * Get the default installation prefix
 * @returns Path object representing the installation prefix

 */
function install*prefix(): Path

/**

 * Install Bun from official GitHub releases
 * @param installPath Path where Bun should be installed
 * @param version Optional specific version to install
 * @returns Array of installed file paths

 */
async function install*bun(installPath: string, version?: string): Promise<string[]>
```

### Package Management Module

```typescript
import { update, updateAllPackages, updateSpecificPackages } from 'ts-pantry'

/**

 * Update packages to newer versions
 * @param packages Array of package names to update (empty array for all packages)
 * @param options Update configuration options
 * @param options.latest Force update to latest versions, ignoring constraints
 * @param options.dryRun Preview what would be updated without actually updating
 * @param options.verbose Enable verbose output during updates
 * @returns Promise that resolves when updates are complete

 */
async function update(
  packages: string[],
  options?: {
    latest?: boolean
    dryRun?: boolean
    verbose?: boolean
  }
): Promise<void>

/**

 * Update specific packages by name
 * @param packages Array of package names to update
 * @param options Update configuration options
 * @param options.latest Force update to latest versions, ignoring constraints
 * @param options.dryRun Preview what would be updated without actually updating
 * @param options.verbose Enable verbose output during updates
 * @returns Promise that resolves when updates are complete

 */
async function updateSpecificPackages(
  packages: string[],
  options?: {
    latest?: boolean
    dryRun?: boolean
    verbose?: boolean
  }
): Promise<void>

/**

 * Update all installed packages
 * @param options Update configuration options
 * @param options.latest Force update to latest versions, ignoring constraints
 * @param options.dryRun Preview what would be updated without actually updating
 * @param options.verbose Enable verbose output during updates
 * @returns Promise that resolves when updates are complete

 */
async function updateAllPackages(
  options?: {
    latest?: boolean
    dryRun?: boolean
    verbose?: boolean
  }
): Promise<void>
```

### Shim Module

```typescript
import { create*shim, shim*dir } from 'ts-pantry'

/**

 * Create shims for packages
 * @param args Package names to create shims for
 * @param basePath Directory where shims should be created
 * @returns Array of created shim file paths

 */
async function create*shim(args: string[], basePath: string): Promise<string[]>

/**

 * Get the default shim directory
 * @returns Path object representing the shim directory

 */
function shim*dir(): Path
```

### Development Environment Module

```typescript
import { datadir, dump, integrate, shellcode } from 'ts-pantry'

/**

 * Generate shell integration code for automatic environment activation
 * @returns Shell script code for integration with bash/zsh

 */
function shellcode(): string

/**

 * Get the data directory for environment storage
 * @returns Path object representing the data directory

 */
function datadir(): Path

/**

 * Generate environment setup script for a project directory
 * @param cwd Project directory path
 * @param opts Configuration options
 * @param opts.dryrun Whether to dry run the environment script generation
 * @param opts.quiet Whether to suppress output
 * @returns Promise that resolves when environment script is generated

 */
async function dump(
  cwd: string,
  opts: { dryrun?: boolean, quiet?: boolean }
): Promise<void>

/**

 * Integrate shell environment with automatic activation hooks
 * @param directory Project directory to integrate
 * @returns Promise that resolves when integration is complete

 */
async function integrate(directory: string): Promise<void>
```

### Package Management Module

```typescript
import { update } from 'ts-pantry'

/**

 * Update packages to newer versions
 * @param packages Array of package names to update (or undefined for all)
 * @param options Update options
 * @returns Promise resolving when update completes

 */
async function update(packages?: string[], options?: { latest?: boolean, dryRun?: boolean }): Promise<void>
```

### List Module

```typescript
import { list } from 'ts-pantry'

/**

 * List installed packages
 * @param basePath Path to list packages from
 * @returns Array of installations

 */
async function list(basePath: string): Promise<Installation[]>

interface Installation {
  path: Path
  pkg: {
    project: string
    version: Version
  }
}
```

### Configuration Module

```typescript
import type { pantryConfig, pantryOptions } from 'ts-pantry'
import { config, defaultConfig } from 'ts-pantry'

interface pantryConfig {
  /** Enable verbose logging (default: false) */
  verbose: boolean
  /** Path where binaries should be installed (default: /usr/local if writable, ~/.local otherwise) */
  installationPath: string
  /** Password for sudo operations, loaded from .env SUDO*PASSWORD (default: '') */
  sudoPassword: string
  /** Whether to enable dev-aware installations (default: true) */
  devAware: boolean
  /** Max installation retries on failure (default: 3) */
  maxRetries: number
  /** Timeout for pkgx operations in milliseconds (default: 60000) */
  timeout: number
  /** Whether to symlink versions (default: true) */
  symlinkVersions: boolean
  /** Whether to force reinstall if already installed (default: false) */
  forceReinstall: boolean
  /** Default path for shims (default: ~/.local/bin) */
  shimPath: string
  /** Whether to automatically add shim path to the system PATH (default: true) */
  autoAddToPath: boolean
  /** Whether to show shell environment activation messages (default: true) */
  showShellMessages: boolean
  /** Custom message to show when environment is activated (default: "✅ Environment activated for {path}") */
  shellActivationMessage: string
  /** Custom message to show when environment is deactivated (default: "Environment deactivated") */
  shellDeactivationMessage: string
}

type pantryOptions = Partial<pantryConfig>

// The resolved configuration object
const config: pantryConfig

// The default configuration values
const defaultConfig: pantryConfig
```

### Version Module

```typescript
import { parseVersion, Version } from 'ts-pantry'

/**

 * Simple class to represent semantic versions

 */
class Version {
  raw: string
  major: number
  minor: number
  patch: number

  constructor(version: string)
  toString(): string
}

/**

 * Helper to parse a version string into a Version object
 * @param versionStr Version string to parse
 * @returns Version object or null if invalid

 */
function parseVersion(versionStr: string): Version | null
```

### Path Module

```typescript
import { Path } from 'ts-pantry'

/**

 * Path utility class for handling file system paths

 */
class Path {
  string: string

  constructor(path: string)
  // Additional path methods available
}
```

### Utility Functions

```typescript
import {
  activateDevEnv,
  addToPath,
  downloadAndInstallPkgx,
  isInPath
} from 'ts-pantry'

/**

 * Activate development environment for a directory

 */
async function activateDevEnv(directory: string): Promise<void>

/**

 * Add a directory to the system PATH

 */
async function addToPath(directory: string): Promise<void>

/**

 * Bootstrap pantry installation with essential tools

 */
async function bootstrap(options?: { path?: string, verbose?: boolean, force?: boolean }): Promise<void>

/**

 * Check if a directory is in the system PATH

 */
function isInPath(directory: string): boolean
```

## Type Definitions

### Core Types

```typescript
interface JsonResponse {
  runtime*env: Record<string, Record<string, string>>
  pkgs: Installation[]
  env: Record<string, Record<string, string>>
  pkg: Installation
}

interface Installation {
  path: Path
  pkg: {
    project: string
    version: Version
  }
}

interface PackageRequirement {
  project: string
  constraint: SemverRange
  global?: boolean
}

interface DependencyConfiguration {
  /** Top-level global flag - applies to all dependencies unless overridden */
  global?: boolean
  /** Package dependencies with optional individual global flags */
  dependencies: DependencySpec[]
  /** Environment variables */
  env?: Record<string, string>
}

type DependencySpec =
  | string // Simple format: "node@22" (defaults to global: false)
  | { // Object format with options
    version?: string
    global?: boolean // Individual package global flag (overrides top-level)
  }
```

### Global Flag Types

```typescript
interface GlobalDependencyOptions {
  /** Individual package global configuration */
  packageGlobal?: boolean
  /** Top-level global configuration (applies to all packages) */
  topLevelGlobal?: boolean
  /** Resolved global setting (considering precedence) */
  resolvedGlobal: boolean
}

// Example dependency configurations
interface DependencyExamples {
  // String format (defaults to local installation)
  simple: 'node@22'

  // Object format with individual global flag
  individual: {
    version: '22.1.0'
    global: true
  }

  // Top-level global with selective overrides
  topLevel: {
    global: true
    dependencies: {
      'node@22': string
      'typescript@5.0': {
        version: '5.0.4'
        global: false // Override top-level global
      }
    }
  }
}
```

## Usage Examples

### Cache Management

```typescript
import { cleanSystem, clearCache } from 'ts-pantry'

// Clear cache with preview
const cacheResult = await clearCache({ dryRun: true })
console.log(`Would free ${cacheResult.freedSpace} bytes and remove ${cacheResult.removedFiles} files`)

// Clear cache without confirmation
await clearCache({ force: true, verbose: true })

// Complete system cleanup with cache preservation
const cleanResult = await cleanSystem({
  force: true,
  keepCache: true,
  verbose: true
})
console.log(`Removed ${cleanResult.removedPackages.length} packages`)
console.log(`Freed ${cleanResult.freedSpace} bytes`)

// Preview complete cleanup
const previewResult = await cleanSystem({ dryRun: true })
console.log('Would remove packages:', previewResult.removedPackages)
```

### Basic Package Installation

```typescript
import { install, install*prefix } from 'ts-pantry'

// Install a package
const installPath = install*prefix()
const installedFiles = await install(['node@22'], installPath.string)
console.log('Installed files:', installedFiles)
```

### Configuration

```typescript
import type { pantryConfig } from 'ts-pantry'
import { config } from 'ts-pantry'

// Access current configuration
console.log('Verbose mode:', config.verbose)
console.log('Install path:', config.installationPath)

// Create custom configuration
const customConfig: pantryConfig = {
  ...config,
  verbose: true,
  installationPath: '/custom/path'
}
```

### Development Environment

```typescript
import { dump, integrate, shellcode } from 'ts-pantry'

// Generate shell integration code
const shellIntegration = shellcode()
console.log(shellIntegration)

// Generate environment for a project
await dump('/path/to/project', { dryrun: false, quiet: false })

// Integrate shell environment
await integrate('/path/to/project')
```

### Dependency Management with Global Flags

```typescript
import { dump } from 'ts-pantry'

// Example: dependencies.yaml with global flag configurations
const dependencyConfig = `
# Top-level global flag (applies to all packages)
global: true
dependencies:
# Uses top-level global: true

  * node@22
  * python@3.12

# Individual override to local installation
  typescript@5.0:
    version: 5.0.4
    global: false

# Individual global configuration
  git@2.42:
    version: 2.42.0
    global: true

env:
  NODE*ENV: development
`

// Generate environment with global flag support
await dump('/path/to/project', { dryrun: false, quiet: false })

// The dump function will:
// - Install node@22 and python@3.12 globally (to /usr/local)
// - Install typescript@5.0 locally (to project directory)
// - Install git@2.42 globally (individual flag)
```

### Services in dependencies.yaml

pantry can read a `services` section from your dependency file to automatically start services on environment activation.

```yaml
# deps.yaml
dependencies:
  bun: ^1.2.19
  node: ^22.17.0
  php: ^8.4.11
  composer: ^2.8.10
  postgres: ^17.2.0
  redis: ^8.0.4

services:
  enabled: true
  autoStart:

    * postgres
    * redis

```

At runtime, the environment generator detects `services.enabled` and starts each service in `autoStart`.

#### Inference shorthand

For Stacks & Laravel projects, you can also use a shorthand to infer services from `.env`:

```yaml
# deps.yaml
dependencies:
  php: ^8.4.11
  postgres: ^17.2.0
  redis: ^8.0.4

services:
  infer: true
```

This will auto-start services based on `.env` (e.g., `DB*CONNECTION=pgsql` and `CACHE*DRIVER=redis` → `postgres` and `redis`).

Project-level post-setup commands can be configured via top-level `postSetup` in `pantry.config.ts`:

```ts
// pantry.config.ts
import type { pantryConfig } from 'ts-pantry'

const config: pantryConfig = {
  postSetup: {
    enabled: true,
    commands: [
      {
        name: 'migrate',
        command: 'php artisan migrate',
        description: 'Run database migrations',
        condition: 'hasUnrunMigrations',
        runInBackground: false,
        required: false,
      },
    ],
  },
}

export default config
```

### Global Flag Resolution Examples

```typescript
// Example dependency configurations and their resolved global settings

// 1. String format (defaults to local)
const stringFormat = {
  dependencies: ['node@22', 'python@3.12'],
  resolved: [
    { package: 'node@22', global: false }, // default
    { package: 'python@3.12', global: false } // default
  ]
}

// 2. Individual global flags
const individualFlags = {
  dependencies: {
    'node@22': { version: '22.1.0', global: true },
    'python@3.12': { version: '3.12.1', global: false }
  },
  resolved: [
    { package: 'node@22', global: true }, // individual flag
    { package: 'python@3.12', global: false } // individual flag
  ]
}

// 3. Top-level global with overrides
const topLevelWithOverrides = {
  global: true, // Top-level flag
  dependencies: {
    'node@22': '22.1.0', // string format
    'python@3.12': { version: '3.12.1' }, // object without global
    'typescript@5.0': { version: '5.0.4', global: false } // override to local
  },
  resolved: [
    { package: 'node@22', global: true }, // uses top-level
    { package: 'python@3.12', global: true }, // uses top-level
    { package: 'typescript@5.0', global: false } // individual override
  ]
}
```

### Creating Shims

```typescript
import { create*shim, shim*dir } from 'ts-pantry'

// Create shims for packages
const shimPath = shim*dir()
const createdShims = await create_shim(['node', 'python'], shimPath.string)
console.log('Created shims:', createdShims)
```

### Version Handling

```typescript
import { parseVersion, Version } from 'ts-pantry'

// Parse version string
const version = parseVersion('1.2.3')
if (version) {
  console.log(`Major: ${version.major}, Minor: ${version.minor}, Patch: ${version.patch}`)
}

// Create version object directly
const v = new Version('2.0.0')
console.log(v.toString()) // "2.0.0"
```

### Package Updates

```typescript
import { update } from 'ts-pantry'

// Update all packages
await update()

// Update specific packages
await update(['node', 'python'])

// Preview updates without applying them
await update(['bun'], { dryRun: true })

// Update to latest versions
await update(['node'], { latest: true })
```

### Listing Packages

```typescript
import { list } from 'ts-pantry'

// List installed packages
const installations = await list('/usr/local')
installations.forEach((installation) => {
  console.log(`${installation.pkg.project}@${installation.pkg.version} at ${installation.path.string}`)
})
```

## Error Handling

Most functions in the pantry API can throw errors. It's recommended to wrap calls in try-catch blocks:

```typescript
import { install } from 'ts-pantry'

try {
  const result = await install(['node@22'], '/usr/local')
  console.log('Installation successful:', result)
}
catch (error) {
  console.error('Installation failed:', error.message)
}
```

## CLI Commands

pantry provides several CLI commands for cache and system management:

### Cache Management Commands

```bash
# Clear all cached packages and downloads
pantry cache:clear [options]
pantry cache:clean [options]  # Alias for cache:clear

# Options
# --dry-run    Show what would be cleared without actually clearing
# --force      Skip confirmation prompts
# --verbose    Enable verbose output

# Examples
pantry cache:clear --dry-run     # Preview cache cleanup
pantry cache:clear --force       # Clear without confirmation
pantry cache:clean --verbose     # Clear with detailed output
```

### System Cleanup Commands

```bash
# Remove all pantry-installed packages and environments
pantry clean [options]

# Options
# --dry-run      Show what would be removed without actually removing
# --force        Skip confirmation prompts
# --keep-cache   Keep cached downloads (only remove installed packages)
# --verbose      Enable verbose output during cleanup

# Examples
pantry clean --dry-run           # Preview complete cleanup
pantry clean --force             # Complete system reset
pantry clean --keep-cache        # Remove packages but preserve cache
```

### Command Safety Features

* **Confirmation Required:** Both commands require `--force` for actual operations
* **Dry-Run Mode:** Preview exactly what will be affected with `--dry-run`
* **Targeted Cleanup:** Only removes pantry-specific directories
* **Graceful Error Handling:** Continues operation even if some files can't be removed

## Service Management API

pantry provides comprehensive service management capabilities with a robust TypeScript API.

### Service Operations

```typescript
import {
  startService,
  stopService,
  restartService,
  enableService,
  disableService,
  getServiceStatus,
  listServices,
  initializeServiceManager
} from 'ts-pantry'

// Start a service
const success = await startService('postgres')

// Stop a service
await stopService('redis')

// Restart a service
await restartService('nginx')

// Enable auto-start
await enableService('postgres')

// Disable auto-start
await disableService('postgres')

// Get service status
const status = await getServiceStatus('postgres') // 'stopped' | 'starting' | 'running' | 'stopping' | 'failed' | 'unknown'

// List all services and their status
const services = await listServices()

// Initialize service manager
const manager = await initializeServiceManager()
```

### Service Definitions

```typescript
import {
  getServiceDefinition,
  getAllServiceDefinitions,
  isServiceSupported,
  createDefaultServiceConfig
} from 'ts-pantry'

// Get specific service definition
const postgres = getServiceDefinition('postgres')

// Get all available services
const allServices = getAllServiceDefinitions()

// Check if service is supported
const isSupported = isServiceSupported('postgres')

// Generate default configuration
const config = createDefaultServiceConfig('redis')
```

### Service Types

```typescript
// Service status enumeration
type ServiceStatus =
  | 'stopped'    // Service is not running
  | 'starting'   // Service is in the process of starting
  | 'running'    // Service is running and healthy
  | 'stopping'   // Service is in the process of stopping
  | 'failed'     // Service failed to start or crashed
  | 'unknown'    // Service status cannot be determined

// Service definition interface
interface ServiceDefinition {
  name: string                      // Service name (e.g., 'postgres', 'redis')
  displayName: string               // Display name for the service
  description: string               // Service description
  packageDomain: string             // Package domain that provides this service
  executable: string                // Executable name or path
  args: string[]                    // Default command line arguments
  env: Record<string, string>       // Environment variables to set
  workingDirectory?: string         // Working directory for the service
  dataDirectory?: string            // Default data directory
  configFile?: string               // Default configuration file path
  logFile?: string                  // Default log file path
  pidFile?: string                  // Default PID file path
  port?: number                     // Port the service listens on (if applicable)
  dependencies: string[]            // Dependencies (other services that must be running)
  healthCheck?: ServiceHealthCheck  // Health check configuration
  initCommand?: string[]            // Service initialization command (runs once before first start)
  supportsGracefulShutdown: boolean // Whether this service supports graceful shutdown
  custom?: Record<string, unknown>  // Custom service configuration
}

// Health check configuration
interface ServiceHealthCheck {
  command: string[]         // Health check command to run
  expectedExitCode: number  // Expected exit code for healthy service
  timeout: number          // Timeout for health check in seconds
  interval: number         // Interval between health checks in seconds
  retries: number          // Number of consecutive failures before marking unhealthy
}

// Service instance (runtime state)
interface ServiceInstance {
  definition: ServiceDefinition  // Service definition
  status: ServiceStatus         // Current service status
  pid?: number                 // Process ID (if running)
  startedAt?: Date            // Service startup time
  lastCheckedAt: Date         // Last status check time
  enabled: boolean            // Whether service is enabled for auto-start
  config: Record<string, unknown> // Service-specific configuration overrides
  dataDir?: string            // Custom data directory for this instance
  logFile?: string            // Custom log file for this instance
  configFile?: string         // Custom configuration file for this instance
}

// Service operation record
interface ServiceOperation {
  action: 'start' | 'stop' | 'restart' | 'reload' | 'enable' | 'disable' // Operation type
  serviceName: string         // Service name
  timestamp: Date            // Timestamp when operation was initiated
  result?: 'success' | 'failure' | 'timeout' // Operation result
  error?: string             // Error message if operation failed
  duration?: number          // Duration of operation in milliseconds
}

// Service manager state
interface ServiceManagerState {
  services: Map<string, ServiceInstance> // Map of service name to service instance
  operations: ServiceOperation[]         // Recent operations log
  config: ServiceConfig                  // Global service manager configuration
  lastScanTime: Date                    // Last time services were scanned/updated
}

// Service configuration
interface ServiceConfig {
  enabled: boolean        // Enable service management functionality
  dataDir: string        // Default services data directory
  logDir: string         // Default services log directory
  configDir: string      // Default services configuration directory
  autoRestart: boolean   // Auto-restart failed services
  startupTimeout: number // Service startup timeout in seconds
  shutdownTimeout: number // Service shutdown timeout in seconds
}
```

### Platform-Specific Types

```typescript
// macOS launchd plist configuration
interface LaunchdPlist {
  Label: string
  ProgramArguments: string[]
  WorkingDirectory?: string
  EnvironmentVariables?: Record<string, string>
  StandardOutPath?: string
  StandardErrorPath?: string
  RunAtLoad?: boolean
  KeepAlive?: boolean | { SuccessfulExit?: boolean, NetworkState?: boolean }
  StartInterval?: number
  UserName?: string
  GroupName?: string
}

// Linux systemd service configuration
interface SystemdService {
  Unit: {
    Description: string
    After?: string[]
    Requires?: string[]
    Wants?: string[]
  }
  Service: {
    Type: 'simple' | 'forking' | 'oneshot' | 'notify' | 'exec'
    ExecStart: string
    ExecStop?: string
    ExecReload?: string
    WorkingDirectory?: string
    Environment?: string[]
    User?: string
    Group?: string
    Restart?: 'no' | 'always' | 'on-success' | 'on-failure' | 'on-abnormal' | 'on-abort' | 'on-watchdog'
    RestartSec?: number
    TimeoutStartSec?: number
    TimeoutStopSec?: number
    PIDFile?: string
  }
  Install?: {
    WantedBy?: string[]
    RequiredBy?: string[]
  }
}
```

### Service Platform Support

```typescript
import {
  isPlatformSupported,
  getServiceManagerName,
  generateLaunchdPlist,
  generateSystemdService
} from 'ts-pantry'

// Check if current platform supports service management
const supported = isPlatformSupported() // true on macOS/Linux

// Get platform service manager name
const manager = getServiceManagerName() // 'launchd' | 'systemd' | 'unknown'

// Generate platform-specific service files
const plist = generateLaunchdPlist(serviceInstance)      // macOS
const systemdUnit = generateSystemdService(serviceInstance) // Linux
```

### Available Services

pantry includes these pre-configured services:

```typescript
// Database services
'postgres'     // PostgreSQL (port 5432)
'mysql'        // MySQL (port 3306)
'mongodb'      // MongoDB (port 27017)
'redis'        // Redis (port 6379)
'influxdb'     // InfluxDB (port 8086)
'cockroachdb'  // CockroachDB (port 26257)
'neo4j'        // Neo4j (port 7474)
'clickhouse'   // ClickHouse (port 8123)

// Web servers
'nginx'        // Nginx (port 8080)
'caddy'        // Caddy (port 2015)

// Message queues & streaming
'kafka'        // Apache Kafka (port 9092)
'rabbitmq'     // RabbitMQ (port 5672)
'pulsar'       // Apache Pulsar (port 6650)
'nats'         // NATS (port 4222)

// Monitoring & observability
'prometheus'   // Prometheus (port 9090)
'grafana'      // Grafana (port 3000)
'jaeger'       // Jaeger (port 16686)

// Infrastructure & tools
'vault'        // HashiCorp Vault (port 8200)
'consul'       // HashiCorp Consul (port 8500)
'etcd'         // etcd (port 2379)
'minio'        // MinIO (port 9000)
'sonarqube'    // SonarQube (port 9001)
'temporal'     // Temporal (port 7233)

// Development & CI/CD
'jenkins'      // Jenkins (port 8090)
'localstack'   // LocalStack (port 4566)
'verdaccio'    // Verdaccio (port 4873)

// API & backend services
'hasura'       // Hasura (port 8085)
'keycloak'     // Keycloak (port 8088)

// Caching & storage
'memcached'    // Memcached (port 11211)
'elasticsearch' // Elasticsearch (port 9200)
```

## TypeScript Support

pantry is written in TypeScript and provides full type definitions. All functions, classes, and interfaces are properly typed for the best development experience.

```typescript
import type {
  Installation,
  JsonResponse,
  pantryConfig,
  pantryOptions,
  ServiceDefinition,
  ServiceInstance,
  ServiceStatus,
  ServiceHealthCheck,
  ServiceOperation,
  ServiceManagerState,
  ServiceConfig,
  LaunchdPlist,
  SystemdService
} from 'ts-pantry'
```
