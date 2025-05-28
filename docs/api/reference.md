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

/**
 * Install Bun from official GitHub releases
 * @param installPath Path where Bun should be installed
 * @param version Optional specific version to install
 * @returns Array of installed file paths
 */
async function install_bun(installPath: string, version?: string): Promise<string[]>
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

/**
 * List package paths as generator
 * @param installPath Installation directory
 * @returns Async generator yielding package paths
 */
async function* ls(installPath?: string): AsyncGenerator<string>

/**
 * Check for outdated packages
 */
async function outdated(): Promise<void>
```

### Uninstall Module

```typescript
/**
 * Uninstall a package
 * @param pkg Package name to uninstall
 * @returns Promise resolving to boolean indicating success
 */
async function uninstall(pkg: string): Promise<boolean>
```

### Package Removal Module

```typescript
/**
 * Remove specific packages while keeping Launchpad installation
 * @param packages Array of package names/specs to remove
 * @param options Removal options
 * @returns Promise resolving to removal results
 */
async function removePackages(
  packages: string[],
  options: RemoveOptions
): Promise<RemovalResult[]>

/**
 * Complete system cleanup - remove Launchpad and all packages
 * @param options Cleanup options
 * @returns Promise resolving to cleanup results
 */
async function completeUninstall(options: UninstallOptions): Promise<UninstallResult>

interface RemoveOptions {
  installPath?: string
  dryRun?: boolean
  force?: boolean
  verbose?: boolean
}

interface RemovalResult {
  package: string
  action: 'removed' | 'not-found' | 'failed'
  files?: string[]
  details?: string
}

interface UninstallOptions {
  dryRun?: boolean
  force?: boolean
  keepPackages?: boolean
  keepShellIntegration?: boolean
  verbose?: boolean
}

interface UninstallResult {
  removed: UninstallItem[]
  kept: UninstallItem[]
  failed: UninstallItem[]
  notFound: UninstallItem[]
}

interface UninstallItem {
  item: string
  action: 'removed' | 'kept' | 'not-found' | 'failed'
  path?: string
  details?: string
}

### Smart Install Module

```typescript
/**
 * Smart install with automatic fallback to system package managers
 * @param options Installation options
 * @returns Promise resolving to installation result
 */
async function smartInstall(options: SmartInstallOptions): Promise<InstallResult>

/**
 * Check if a package is already installed on the system
 * @param packageName Package name to check
 * @returns Promise resolving to boolean indicating if installed
 */
async function isPackageInstalled(packageName: string): Promise<boolean>

/**
 * Get installation instructions for manual installation
 * @param packages Array of package names
 * @returns String containing installation instructions
 */
function getManualInstallInstructions(packages: string[]): string

interface SmartInstallOptions {
  packages: string[]
  installPath?: string
  fallbackToSystem?: boolean
  verbose?: boolean
}

interface InstallResult {
  success: boolean
  method: 'pkgx' | 'brew' | 'apt' | 'manual'
  installedPackages: string[]
  failedPackages: string[]
  message: string
}
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
   * Get parent directory
   * @returns New Path object representing parent
   */
  parent(): Path

  /**
   * Get basename
   * @returns Basename string
   */
  basename(): string

  /**
   * Check if path exists
   * @returns Boolean indicating if path exists
   */
  exists(): boolean

  /**
   * Check if path is a directory
   * @returns Boolean indicating if path is directory
   */
  isDirectory(): boolean

  /**
   * Get relative path from another path
   * @param from Path to calculate relative from
   * @returns Relative path string
   */
  relative(from: Path): string

  /**
   * List directory contents
   * @returns Array of Path objects
   */
  ls(): Path[]

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
 * Get standard PATH directories for the platform
 * @returns String containing standard PATH
 */
function standardPath(): string
```

### Bun Module

```typescript
/**
 * Get the latest Bun version from GitHub API
 * @returns Promise resolving to the version string
 */
async function get_latest_bun_version(): Promise<string>

/**
 * Determine the appropriate Bun download URL
 * @param version Version string
 * @returns Object containing filename and URL
 */
function get_bun_asset(version: string): BunAsset

/**
 * Download and install Bun
 * @param installPath Path where Bun should be installed
 * @param version Optional specific version to install
 * @returns Array of installed file paths
 */
async function install_bun(installPath: string, version?: string): Promise<string[]>

/**
 * Asset information for Bun download
 */
interface BunAsset {
  filename: string
  url: string
}
```

### Dev Module

```typescript
/**
 * Get dev data directory
 * @returns String path to dev data directory
 */
function datadir(): string

/**
 * Output environment setup for dev environment
 * @param directory Target directory
 * @param options Dump options
 */
async function dump(directory: string, options?: { dryrun?: boolean, quiet?: boolean }): Promise<void>

/**
 * Integrate dev hooks into shell configuration
 * @param action Action to perform ('install' or 'uninstall')
 * @param options Integration options
 */
async function integrate(action: 'install' | 'uninstall', options?: { dryrun?: boolean }): Promise<void>

/**
 * Output shell integration code
 * @returns String containing shell code
 */
function shellcode(): string

/**
 * Escape shell string
 * @param input String to escape
 * @returns Escaped string
 */
function shell_escape(input: string): string

/**
 * Sniff directory for development files
 * @param path Directory path to sniff
 * @returns Promise resolving to sniff result
 */
async function sniff(path: { string: string }): Promise<{ pkgs: Array<{ project: string, constraint: string }> }>
```

### Version Module

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
   * Get raw version string
   */
  raw: string

  /**
   * Parse version string
   * @param version Version string to parse
   * @returns Parsed version object or null
   */
  static parseVersion(version: string): { major: number, minor: number, patch: number } | null

  /**
   * Convert to string
   * @returns Version string
   */
  toString(): string
}
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

## CLI Commands

### Package Installation Commands

```bash
# Install packages using pkgx
launchpad install [packages...] [options]
launchpad i [packages...] [options]

# Smart install with automatic fallback to system package managers
launchpad smart-install [packages...] [options]
launchpad si [packages...] [options]

# Install Bun from GitHub releases
launchpad bun [options]

# Install Zsh shell
launchpad zsh [options]

# Install pkgx itself
launchpad pkgx [options]

# Install dev package
launchpad dev [options]

# Bootstrap complete setup (install all essential tools)
launchpad bootstrap [options]
```

### Package Removal Commands

```bash
# Remove specific packages
launchpad remove [packages...] [options]
launchpad rm [packages...] [options]
launchpad uninstall-package [packages...] [options]

# Complete system cleanup (remove everything)
launchpad uninstall [options]
```

### Shim Management Commands

```bash
# Create shims for packages
launchpad shim [packages...] [options]
```

### Package Listing Commands

```bash
# List installed packages
launchpad list [options]
launchpad ls [options]
```

### Auto-update Management Commands

```bash
# Check auto-update status
launchpad autoupdate [options]

# Enable auto-updates
launchpad autoupdate:enable [options]

# Disable auto-updates
launchpad autoupdate:disable [options]
```

### Dev Environment Commands

```bash
# Integrate dev hooks into shell configuration
launchpad dev:integrate [options]

# Remove dev hooks from shell configuration
launchpad dev:deintegrate [options]

# Check if dev environment is active in current directory
launchpad dev:status [options]

# List all active dev environments
launchpad dev:ls [options]

# Deactivate dev environment in current directory
launchpad dev:off [options]

# Activate dev environment in directory
launchpad dev:on [directory] [options]

# Output shell integration code
launchpad dev:shellcode

# Output environment setup for dev environment
launchpad dev:dump [directory] [options]
```

### Utility Commands

```bash
# Show version
launchpad version

# Show help
launchpad help
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

## Command Options

Most commands support these common options:

- `--verbose`: Enable verbose logging
- `--path <path>`: Specify custom installation path
- `--force`: Force reinstall/removal even if already installed/not found
- `--dry-run`: Preview changes without actually performing them
- `--no-auto-path`: Do not automatically add to PATH

Some commands have specific options:

### Installation Commands
- `--sudo`: Use sudo for installation (install command)
- `--no-fallback`: Do not fallback to system package managers (smart-install)
- `--version <version>`: Install specific version (bun command)

### Removal Commands
- `--keep-packages`: Keep installed packages, only remove shell integration (uninstall)
- `--keep-shell-integration`: Keep shell integration, only remove packages (uninstall)

### Bootstrap Commands
- `--skip-pkgx`: Skip pkgx installation
- `--skip-bun`: Skip bun installation
- `--skip-shell-integration`: Skip shell integration setup

### Dev Commands
- `--quiet`: Suppress package output (dev:dump command)
- `--dryrun`: Show packages without generating script (dev:dump command)

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

### Bootstrap Module

```typescript
/**
 * Bootstrap complete Launchpad setup
 * @param options Bootstrap options
 * @returns Promise resolving to bootstrap results
 */
async function runBootstrap(options: BootstrapOptions): Promise<BootstrapResult>

interface BootstrapOptions {
  verbose?: boolean
  force?: boolean
  autoPath?: boolean
  skipPkgx?: boolean
  skipBun?: boolean
  skipShellIntegration?: boolean
  path?: string
}

interface BootstrapResult {
  successful: BootstrapItem[]
  failed: BootstrapItem[]
  skipped: BootstrapItem[]
}

interface BootstrapItem {
  tool: string
  status: 'success' | 'failed' | 'skipped' | 'already-installed'
  message?: string
}
```
