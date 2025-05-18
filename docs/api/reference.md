# API Reference

This document provides detailed information about Launchpad's API for developers who want to integrate with or extend Launchpad.

## Core Modules

### Installation Module

```typescript
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
function install_prefix(): Path
```

### Shim Module

```typescript
/**
 * Create shims for packages
 * @param args Package names to create shims for
 * @param basePath Directory where shims should be created
 * @returns Array of created shim file paths
 */
async function create_shim(args: string[], basePath: string): Promise<string[]>

/**
 * Get the default shim directory
 * @returns Path object representing the shim directory
 */
function shim_dir(): Path
```

### pkgx Module

```typescript
/**
 * Get the path to the pkgx executable
 * @returns Path to pkgx
 */
function get_pkgx(): string

/**
 * Query pkgx for package information
 * @param pkgx Path to pkgx executable
 * @param args Arguments to pass to pkgx
 * @param options Query options
 * @returns Promise resolving to JSON response and environment
 */
async function query_pkgx(
  pkgx: string,
  args: string[],
  options?: QueryPkgxOptions
): Promise<[JsonResponse, Record<string, string>]>

/**
 * Check if pkgx auto-updates are enabled
 * @returns Promise resolving to boolean indicating if auto-updates are enabled
 */
async function check_pkgx_autoupdate(): Promise<boolean>

/**
 * Configure pkgx auto-update setting
 * @param enable Whether to enable auto-updates
 * @returns Promise resolving to boolean indicating success
 */
async function configure_pkgx_autoupdate(enable: boolean): Promise<boolean>
```

### List Module

```typescript
/**
 * List installed packages
 * @param basePath Path to list packages from
 * @returns Array of installations
 */
async function list(basePath: string): Promise<Installation[]>
```

### Path Module

```typescript
/**
 * Path class for handling file paths
 */
class Path {
  /**
   * Create a new Path
   * @param string Path string
   */
  constructor(string: string)

  /**
   * Get the string representation
   */
  string: string

  /**
   * Join paths
   * @param parts Parts to join
   * @returns New Path object
   */
  join(...parts: string[]): Path

  /**
   * Get home directory
   * @returns Path to home directory
   */
  static home(): Path
}
```

### Utils Module

```typescript
/**
 * Check if a path is in the PATH environment variable
 * @param dir Directory to check
 * @returns Boolean indicating if directory is in PATH
 */
function isInPath(dir: string): boolean

/**
 * Add a directory to the PATH in shell configuration
 * @param dir Directory to add
 * @returns Boolean indicating success
 */
function addToPath(dir: string): boolean

/**
 * Get the user's current shell
 * @returns Shell name
 */
function getUserShell(): string
```

## Configuration Types

```typescript
/**
 * Launchpad configuration interface
 */
interface LaunchpadConfig {
  /** Enable verbose logging */
  verbose: boolean

  /** Path where binaries should be installed */
  installationPath: string

  /** Password for sudo operations */
  sudoPassword: string

  /** Whether to enable dev-aware installations */
  devAware: boolean

  /** Whether to auto-elevate with sudo when needed */
  autoSudo: boolean

  /** Max installation retries on failure */
  maxRetries: number

  /** Timeout for pkgx operations in milliseconds */
  timeout: number

  /** Whether to symlink versions */
  symlinkVersions: boolean

  /** Whether to force reinstall if already installed */
  forceReinstall: boolean

  /** Default path for shims */
  shimPath: string

  /** Whether to automatically add shim path to the system PATH */
  autoAddToPath: boolean
}

/**
 * Partial configuration (for overrides)
 */
type LaunchpadOptions = Partial<LaunchpadConfig>
```

## Data Types

```typescript
/**
 * Installation information
 */
interface Installation {
  path: Path
  pkg: {
    project: string
    version: Version
  }
}

/**
 * JSON response from pkgx query
 */
interface JsonResponse {
  runtime_env: Record<string, Record<string, string>>
  pkgs: Installation[]
  env: Record<string, Record<string, string>>
  pkg: Installation
}

/**
 * Options for pkgx query
 */
interface QueryPkgxOptions {
  timeout?: number
}
```

## Version Class

```typescript
/**
 * Version class for semantic versioning
 */
class Version {
  /**
   * Create a new Version
   * @param version Version string
   */
  constructor(version: string)

  /**
   * Compare versions
   * @param other Version to compare against
   * @returns 0 if equal, negative if less than, positive if greater than
   */
  compare(other: Version): number

  /**
   * Check if version is greater than other
   * @param other Version to compare against
   * @returns Boolean indicating if greater
   */
  gt(other: Version): boolean

  /**
   * Check if version is less than other
   * @param other Version to compare against
   * @returns Boolean indicating if less
   */
  lt(other: Version): boolean

  /**
   * Check if version is equal to other
   * @param other Version to compare against
   * @returns Boolean indicating if equal
   */
  eq(other: Version): boolean
}
```

## Global Configuration

```typescript
/**
 * Default configuration
 */
const defaultConfig: LaunchpadConfig = {
  verbose: false,
  installationPath: getDefaultInstallPath(),
  sudoPassword: process.env.SUDO_PASSWORD || '',
  devAware: true,
  autoSudo: true,
  maxRetries: 3,
  timeout: 60000,
  symlinkVersions: true,
  forceReinstall: false,
  shimPath: getDefaultShimPath(),
  autoAddToPath: true,
}

/**
 * Current configuration (loaded from files and environment)
 */
const config: LaunchpadConfig
```

## Error Handling

Launchpad functions typically throw errors with descriptive messages:

```typescript
try {
  await install(['node'], '/usr/local')
}
catch (error) {
  console.error(`Installation failed: ${error.message}`)
}
```

## Environment Variables

Launchpad respects several environment variables:

- `SUDO_PASSWORD`: Password for sudo operations
- `PKGX_DIR`: Custom pkgx directory
- `PKGX_PANTRY_DIR`: Custom pkgx pantry directory
- `PKGX_DIST_URL`: Custom pkgx distribution URL
- `LAUNCHPAD_VERBOSE`: Enable verbose logging
- `LAUNCHPAD_INSTALL_PATH`: Set installation path
- `LAUNCHPAD_SHIM_PATH`: Set shim path
- `LAUNCHPAD_AUTO_SUDO`: Enable/disable auto sudo
