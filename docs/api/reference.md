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

### Development Environment Module

```typescript
/**
 * Generate shell integration code for automatic environment activation
 * @returns Shell script code for integration with bash/zsh
 */
function shellcode(): string

/**
 * Generate environment setup script for a project directory
 * @param cwd Project directory path
 * @param opts Configuration options
 * @returns Promise that resolves when environment script is generated
 */
async function dump(
  cwd: string,
  opts: { dryrun: boolean, quiet: boolean }
): Promise<void>

/**
 * Integrate shell environment with automatic activation hooks
 * @param directory Project directory to integrate
 * @returns Promise that resolves when integration is complete
 */
async function integrate(directory: string): Promise<void>

interface EnvironmentIsolationConfig {
  projectPath: string
  installPrefix: string
  packages: PackageSpec[]
  env: Record<string, string | string[]>
}

interface PackageSpec {
  project: string
  version: string
  command: string
}
```

### pkgx Module

```typescript
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

interface QueryPkgxOptions {
  env?: Record<string, string>
  timeout?: number
}

interface JsonResponse {
  pkgs: Array<{
    path: string
    project: string
    version: string
  }>
  runtime_env: Record<string, string>
  env: Record<string, string | string[]>
}
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

interface Installation {
  project: string
  version: string
  path: string
  binaries: string[]
}
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
  success: boolean
  removedItems: string[]
  failedItems: string[]
  spaceFree: string
}
```

### Environment Isolation Module

```typescript
/**
 * Create isolated binary stubs for packages
 * @param pkgDir Package directory containing binaries
 * @param installPrefix Project-specific installation prefix
 * @param project Package project name
 * @param command Package command name
 * @param runtimeEnv Runtime environment variables
 * @param env Additional environment variables
 * @returns Promise that resolves when stubs are created
 */
async function createBinaryStubs(
  pkgDir: string,
  installPrefix: string,
  project: string,
  command: string,
  runtimeEnv: Record<string, string>,
  env: Record<string, string | string[]>
): Promise<void>

/**
 * Generate project hash for environment isolation
 * @param projectPath Full path to project directory
 * @returns Base64-encoded hash suitable for directory names
 */
function generateProjectHash(projectPath: string): string

/**
 * Get project-specific environment directory
 * @param projectPath Full path to project directory
 * @returns Path to isolated environment directory
 */
function getProjectEnvDir(projectPath: string): string

/**
 * Escape shell strings for safe script generation
 * @param str String to escape
 * @returns Shell-escaped string
 */
function shell_escape(str: string): string
```

### Configuration Module

```typescript
/**
 * Load Launchpad configuration from various sources
 * @returns Merged configuration object
 */
function loadConfig(): LaunchpadConfig

/**
 * Validate configuration object
 * @param config Configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
function validateConfig(config: LaunchpadConfig): string[]

interface LaunchpadConfig {
  verbose?: boolean
  installationPath?: string
  shimPath?: string
  autoSudo?: boolean
  maxRetries?: number
  timeout?: number
  symlinkVersions?: boolean
  forceReinstall?: boolean
  autoAddToPath?: boolean
  devAware?: boolean
}
```

### Path Management Module

```typescript
/**
 * Add directory to system PATH
 * @param directory Directory to add
 * @returns Promise that resolves when PATH is updated
 */
async function addToPath(directory: string): Promise<void>

/**
 * Check if directory is in PATH
 * @param directory Directory to check
 * @returns Boolean indicating if directory is in PATH
 */
function isInPath(directory: string): boolean

/**
 * Get platform-specific data directory
 * @returns Path to data directory
 */
function platform_data_home_default(): string

/**
 * Find dev command (launchpad or fallback)
 * @returns Path to dev command executable
 */
function findDevCommand(): string
```

### Dependency Sniffing Module

```typescript
/**
 * Detect dependencies from project files
 * @param options Sniffing options
 * @returns Promise resolving to detected dependencies and environment
 */
async function sniff(options: SniffOptions): Promise<SniffResult>

interface SniffOptions {
  string: string // Project directory path
}

interface SniffResult {
  pkgs: Array<{
    project: string
    constraint: {
      toString: () => string
    }
  }>
  env: Record<string, string>
}

/**
 * List of supported dependency file names
 */
const DEPENDENCY_FILES: readonly string[]
```

## Usage Examples

### Basic Package Installation

```typescript
import { install, install_prefix } from 'launchpad'

// Install packages to default location
const installedFiles = await install(['node@22', 'python@3.12'], install_prefix().string)
console.log('Installed files:', installedFiles)
```

### Environment Setup

```typescript
import { dump, shellcode } from 'launchpad/dev'

// Generate shell integration code
const shellCode = shellcode()
console.log(shellCode)

// Generate environment for specific project
await dump('/path/to/project', { dryrun: false, quiet: false })
```

### Configuration Management

```typescript
import { loadConfig, validateConfig } from 'launchpad/config'

// Load current configuration
const config = loadConfig()
console.log('Current config:', config)

// Validate configuration
const errors = validateConfig(config)
if (errors.length > 0) {
  console.error('Configuration errors:', errors)
}
```

### Package Management

```typescript
import { list, removePackages } from 'launchpad'

// List installed packages
const packages = await list('/usr/local')
console.log('Installed packages:', packages)

// Remove specific packages
const results = await removePackages(['node', 'python'], {
  dryRun: true,
  verbose: true,
})
console.log('Removal results:', results)
```

### Environment Isolation

```typescript
import { createBinaryStubs, generateProjectHash, getProjectEnvDir } from 'launchpad/env'

// Generate hash for project
const projectPath = '/home/user/my-project'
const hash = generateProjectHash(projectPath)
console.log('Project hash:', hash)

// Get environment directory
const envDir = getProjectEnvDir(projectPath)
console.log('Environment directory:', envDir)

// Create isolated stubs
await createBinaryStubs(
  '/path/to/package',
  envDir,
  'nodejs.org',
  'node',
  { NODE_PATH: '/custom/path' },
  { NODE_ENV: 'development' }
)
```

## Error Handling

All async functions throw errors that should be handled appropriately:

```typescript
try {
  await install(['nonexistent-package'], '/usr/local')
}
catch (error) {
  if (error instanceof PackageNotFoundError) {
    console.error('Package not found:', error.packageName)
  }
  else if (error instanceof PermissionError) {
    console.error('Permission denied:', error.path)
  }
  else {
    console.error('Unexpected error:', error.message)
  }
}
```

## Events and Hooks

Launchpad provides hooks for monitoring operations:

```typescript
import { on } from 'launchpad/events'

// Listen for package installation events
on('package:install:start', (packageName) => {
  console.log(`Installing ${packageName}...`)
})

on('package:install:complete', (packageName, files) => {
  console.log(`Installed ${packageName} with ${files.length} files`)
})

// Listen for environment events
on('env:activate', (projectPath) => {
  console.log(`Environment activated for ${projectPath}`)
})

on('env:deactivate', (projectPath) => {
  console.log(`Environment deactivated for ${projectPath}`)
})
```

### Install Command

Install one or more packages using pkgx with automatic PATH management.

```bash
launchpad install [packages...] [options]
```

**Aliases:** `i`

**Arguments:**
- `packages` - One or more package specifications (e.g., `node@22`, `python@3.12`)

**Options:**
- `--verbose` - Enable verbose logging
- `--path <path>` - Installation path (default: auto-detected)
- `--system` - Install to /usr/local (same as default behavior)
- `--sudo` - Use sudo for installation
- `--force` - Force reinstall even if package is already installed

**Examples:**
```bash
# Install Node.js (defaults to /usr/local)
launchpad install node@22

# Install multiple packages
launchpad install python@3.12 go@1.21

# System-wide installation (same as default)
launchpad install node@22 --system

# Custom installation path
launchpad install python@3.12 --path ~/tools

# Force reinstall
launchpad install --force node@22
```

### Environment List Command

List all development environments with readable hash identifiers.

```bash
launchpad env:list [options]
```

**Aliases:** `env:ls`

**Options:**
- `--verbose` - Show detailed information including hashes
- `--format <format>` - Output format: table (default), json, or simple

**Examples:**
```bash
# List all environments in table format
launchpad env:list

# Show detailed information with hashes
launchpad env:list --verbose

# Output as JSON for scripting
launchpad env:list --format json

# Simple format for quick overview
launchpad env:ls --format simple
```

### Environment Clean Command

Clean up unused development environments automatically.

```bash
launchpad env:clean [options]
```

**Options:**
- `--dry-run` - Show what would be cleaned without removing anything
- `--force` - Skip confirmation prompts
- `--verbose` - Show detailed information during cleanup
- `--older-than <days>` - Only clean environments older than specified days (default: 30)

**Examples:**
```bash
# Preview what would be cleaned
launchpad env:clean --dry-run

# Clean environments older than 7 days
launchpad env:clean --older-than 7 --force

# Interactive cleanup with details
launchpad env:clean --verbose
```

### Environment Inspect Command

Inspect a specific development environment in detail.

```bash
launchpad env:inspect <hash> [options]
```

**Arguments:**
- `hash` - Environment hash identifier (e.g., `project-name_1234abcd`)

**Options:**
- `--verbose` - Show detailed directory structure
- `--show-stubs` - Show binary stub contents

**Examples:**
```bash
# Basic environment inspection
launchpad env:inspect working-test_208a31ec

# Detailed inspection with stub contents
launchpad env:inspect final-project_7db6cf06 --verbose --show-stubs
```

### Environment Remove Command

Remove a specific development environment.

```bash
launchpad env:remove <hash> [options]
```

**Arguments:**
- `hash` - Environment hash identifier (e.g., `project-name_1234abcd`)

**Options:**
- `--force` - Skip confirmation prompt
- `--verbose` - Show detailed information during removal

**Examples:**
```bash
# Remove environment with confirmation
launchpad env:remove dummy_6d7cf1d6

# Force removal without confirmation
launchpad env:remove minimal_3a5dc15d --force
```

## Environment Hash Format

Launchpad uses a human-readable hash format for environment directories:

**Format:** `{project-name}_{8-char-hex-hash}`

**Examples:**
- `final-project_7db6cf06` - For a project named "final-project"
- `working-test_208a31ec` - For a project named "working-test"
- `my-app_1a2b3c4d` - For a project named "my-app"

**Benefits:**
- **Human-readable** - Easy to identify which project an environment belongs to
- **Unique** - 8-character hex hash prevents collisions
- **Consistent** - Same project always generates the same hash
- **Manageable** - Much shorter than previous base64 format
