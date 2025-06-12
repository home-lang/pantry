# API Reference

This document provides detailed information about Launchpad's API for developers who want to integrate with or extend Launchpad.

## Installation

```bash
npm install @stacksjs/launchpad
```

## Core Modules

### Installation Module

```typescript
import { install, install_bun, install_prefix } from '@stacksjs/launchpad'

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
import { create_shim, shim_dir } from '@stacksjs/launchpad'

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

### Development Environment Module

```typescript
import { datadir, dump, integrate, shellcode } from '@stacksjs/launchpad'

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

### pkgx Module

```typescript
import { check_pkgx_autoupdate, configure_pkgx_autoupdate } from '@stacksjs/launchpad'

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
import { list } from '@stacksjs/launchpad'

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
import type { LaunchpadConfig, LaunchpadOptions } from '@stacksjs/launchpad'
import { config, defaultConfig } from '@stacksjs/launchpad'

interface LaunchpadConfig {
  /** Enable verbose logging (default: false) */
  verbose: boolean
  /** Path where binaries should be installed (default: /usr/local if writable, ~/.local otherwise) */
  installationPath: string
  /** Password for sudo operations, loaded from .env SUDO_PASSWORD (default: '') */
  sudoPassword: string
  /** Whether to enable dev-aware installations (default: true) */
  devAware: boolean
  /** Whether to auto-elevate with sudo when needed (default: true) */
  autoSudo: boolean
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
  /** Custom message to show when environment is deactivated (default: "dev environment deactivated") */
  shellDeactivationMessage: string
}

type LaunchpadOptions = Partial<LaunchpadConfig>

// The resolved configuration object
const config: LaunchpadConfig

// The default configuration values
const defaultConfig: LaunchpadConfig
```

### Version Module

```typescript
import { parseVersion, Version } from '@stacksjs/launchpad'

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
import { Path } from '@stacksjs/launchpad'

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
} from '@stacksjs/launchpad'

/**
 * Activate development environment for a directory
 */
async function activateDevEnv(directory: string): Promise<void>

/**
 * Add a directory to the system PATH
 */
async function addToPath(directory: string): Promise<void>

/**
 * Download and install pkgx
 */
async function downloadAndInstallPkgx(installPath: string): Promise<void>

/**
 * Check if a directory is in the system PATH
 */
function isInPath(directory: string): boolean
```

## Type Definitions

### Core Types

```typescript
interface JsonResponse {
  runtime_env: Record<string, Record<string, string>>
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
```

## Usage Examples

### Basic Package Installation

```typescript
import { install, install_prefix } from '@stacksjs/launchpad'

// Install a package
const installPath = install_prefix()
const installedFiles = await install(['node@22'], installPath.string)
console.log('Installed files:', installedFiles)
```

### Configuration

```typescript
import type { LaunchpadConfig } from '@stacksjs/launchpad'
import { config } from '@stacksjs/launchpad'

// Access current configuration
console.log('Verbose mode:', config.verbose)
console.log('Install path:', config.installationPath)

// Create custom configuration
const customConfig: LaunchpadConfig = {
  ...config,
  verbose: true,
  installationPath: '/custom/path'
}
```

### Development Environment

```typescript
import { dump, integrate, shellcode } from '@stacksjs/launchpad'

// Generate shell integration code
const shellIntegration = shellcode()
console.log(shellIntegration)

// Generate environment for a project
await dump('/path/to/project', { dryrun: false, quiet: false })

// Integrate shell environment
await integrate('/path/to/project')
```

### Creating Shims

```typescript
import { create_shim, shim_dir } from '@stacksjs/launchpad'

// Create shims for packages
const shimPath = shim_dir()
const createdShims = await create_shim(['node', 'python'], shimPath.string)
console.log('Created shims:', createdShims)
```

### Version Handling

```typescript
import { parseVersion, Version } from '@stacksjs/launchpad'

// Parse version string
const version = parseVersion('1.2.3')
if (version) {
  console.log(`Major: ${version.major}, Minor: ${version.minor}, Patch: ${version.patch}`)
}

// Create version object directly
const v = new Version('2.0.0')
console.log(v.toString()) // "2.0.0"
```

### Auto-update Management

```typescript
import { check_pkgx_autoupdate, configure_pkgx_autoupdate } from '@stacksjs/launchpad'

// Check current auto-update status
const isEnabled = await check_pkgx_autoupdate()
console.log('Auto-updates enabled:', isEnabled)

// Enable auto-updates
await configure_pkgx_autoupdate(true)

// Disable auto-updates
await configure_pkgx_autoupdate(false)
```

### Listing Packages

```typescript
import { list } from '@stacksjs/launchpad'

// List installed packages
const installations = await list('/usr/local')
installations.forEach((installation) => {
  console.log(`${installation.pkg.project}@${installation.pkg.version} at ${installation.path.string}`)
})
```

## Error Handling

Most functions in the Launchpad API can throw errors. It's recommended to wrap calls in try-catch blocks:

```typescript
import { install } from '@stacksjs/launchpad'

try {
  const result = await install(['node@22'], '/usr/local')
  console.log('Installation successful:', result)
}
catch (error) {
  console.error('Installation failed:', error.message)
}
```

## TypeScript Support

Launchpad is written in TypeScript and provides full type definitions. All functions, classes, and interfaces are properly typed for the best development experience.

```typescript
import type {
  Installation,
  JsonResponse,
  LaunchpadConfig,
  LaunchpadOptions
} from '@stacksjs/launchpad'
```
