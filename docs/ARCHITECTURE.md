# pantry Architecture

> **Purpose**: This document provides a comprehensive technical overview of pantry's architecture, focusing on core system flows, shell integration, caching strategies, and command execution. It serves as a roadmap for understanding the TypeScript implementation and planning future refactoring (e.g., to Zig).

**Last Updated**: 2025-10-20

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Core Architecture Layers](#core-architecture-layers)
3. [Shell Integration](#shell-integration)
4. [Dependency Installation Flow](#dependency-installation-flow)
5. [Caching System](#caching-system)
6. [Command Architecture](#command-architecture)
7. [Environment Management](#environment-management)
8. [Service Management](#service-management)
9. [File System Layout](#file-system-layout)
10. [Performance Optimizations](#performance-optimizations)
11. [Cross-Platform Considerations](#cross-platform-considerations)

---

## System Overview

pantry is a modern dependency manager that provides:

- **System-wide and project-specific package installations**
- **Automatic environment activation on directory changes (via shell hooks)**
- **Intelligent caching for both packages and environment metadata**
- **Service management (PostgreSQL, Redis, etc.)**
- **Cross-platform support (macOS, Linux, Windows)**

### Key Design Principles

1. **Performance First**: Sub-millisecond environment switching via multi-tier caching
2. **Zero Configuration**: Automatic project detection and environment setup
3. **Isolation**: Each project gets its own isolated dependency environment
4. **Shell Integration**: Seamless activation/deactivation on `cd` commands

---

## Core Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    CLI Layer                            │
│  (bin/cli.ts - @stacksjs/clapp framework)              │
│  - Command parsing                                      │
│  - Option handling                                      │
│  - Lazy command loading                                 │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│              Command Layer                              │
│  (src/commands/*.ts - Command implementations)          │
│  - Install, uninstall, search, info, etc.              │
│  - Environment management (env:list, env:clean)         │
│  - Service management (start, stop, restart)            │
│  - Cache management (cache:clear, cache:stats)          │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│            Core Logic Layer                             │
│  - Package resolution (ts-pkgx integration)             │
│  - Dependency resolution                                │
│  - Installation orchestration                           │
│  - Cache management                                     │
│  - Environment detection                                │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│          System Integration Layer                       │
│  - File system operations                               │
│  - Binary downloads                                     │
│  - Symlink creation                                     │
│  - Shell hook generation                                │
│  - Platform-specific operations (launchd/systemd)       │
└─────────────────────────────────────────────────────────┘
```

---

## Shell Integration

### Overview

Shell integration is the **heart of pantry's UX**. It enables automatic environment activation when you `cd` into a project directory. This is achieved by injecting shell code into the user's shell initialization files (`.zshrc`, `.bashrc`, etc.).

### Integration Flow

```

1. User runs: `pantry dev:integrate`

   └─> Adds hook to ~/.zshrc or ~/.bashrc

2. Shell startup:

   └─> eval "$(pantry dev:shellcode)"
       └─> Generates shell functions and hooks

3. User runs: cd /path/to/project

   └─> Triggers __pantry_chpwd (zsh) or __pantry_prompt_command (bash)
       └─> Calls __pantry_switch_environment
           ├─> Cache lookup (instant if cached)
           ├─> Project detection (if cache miss)
           ├─> Environment activation/deactivation
           └─> PATH modification
```

### Shell Code Generation

**File**: `src/dev/shellcode.ts:13`

The `shellcode()` function generates a complete shell script that:

1. **Defines utility functions** (path helpers, MD5 hashing, cache operations)
2. **Implements multi-tier caching** (in-memory + disk)
3. **Provides environment switching logic**
4. **Sets up directory change hooks** (zsh `chpwd`, bash `PROMPT_COMMAND`)

### Key Shell Functions

#### `__pantry_switch_environment()`

**Location**: `src/dev/shellcode.ts:287`

**Purpose**: Core function that handles environment activation/deactivation on directory changes.

**Logic Flow**:

```bash

1. SUPER FAST PATH: Check if PWD unchanged → return immediately (0 syscalls)

2. ULTRA FAST PATH: If already in project and still in subdirectory → skip

3. INSTANT DEACTIVATION: If left project directory

   ├─> Show deactivation message
   ├─> Remove project paths from PATH
   └─> Clear environment variables

4. CACHE LOOKUP: Walk up directory tree checking cache

   ├─> Tier 1: In-memory hash map (instant)
   ├─> Tier 2: Indexed cache file (fast disk lookup)
   └─> Cache hit → activate immediately (skip expensive work)

5. PROJECT DETECTION (cache miss only):

   ├─> Scan for dependency files (package.json, Cargo.toml, etc.)
   └─> Use binary detection as fallback

6. ENVIRONMENT ACTIVATION:

   ├─> Compute environment directory hash
   ├─> Check if environment exists
   ├─> If exists: activate (update PATH, set vars)
   └─> If missing: auto-install dependencies
```

**Performance Optimizations**:

- **Zero syscalls** for unchanged directories
- **Instant activation** for cached environments (3-5 syscalls max)
- **Deferred installation** (non-blocking background process)
- **MD5 hash caching** to avoid repeated computations

#### Cache System (Shell Layer)

**Three-tier caching** for environment lookups:

```bash
Tier 1: In-memory hash map

  - ZSH: Associative array (__LP_CACHE_MAP)
  - Bash: Dynamic variable names (__LP_CACHE_<encoded_path>)
  - Lookup: O(1), zero syscalls

Tier 2: Disk cache file (~/.cache/pantry/shell_cache/env_cache)

  - Format: project_dir|dep_file|dep_mtime|env_dir
  - Fast awk-based lookup (single syscall)
  - Validated on read (checks env dir exists, dep file mtime)

Tier 3: Filesystem walk (fallback)

  - Walks up directory tree checking for dependency files
  - Only triggered on cache miss
  - Results written to cache for future use

```

**Cache Writing**: `src/dev/shellcode.ts:216`

- Async/non-blocking (background process)
- Atomic writes using temp file + rename
- Automatically updates in-memory cache

**Cache Invalidation**:

- Automatic: When dependency file mtime changes
- Manual: Environment directory deletion
- Command: `pantry cache:clear` removes shell cache

### Hook Installation

**File**: `src/dev/integrate.ts`

**Process**:

1. Detects user's shell (zsh, bash)
2. Locates shell config files (`~/.zshrc`, `~/.bashrc`, etc.)
3. Appends integration line:

   ```bash
# Added by pantry
   command -v pantry >/dev/null 2>&1 && eval "$(pantry dev:shellcode)"
   ```

4. User restarts shell to activate

**Uninstallation**: `pantry dev:integrate --uninstall`

- Removes all lines containing pantry markers
- Safe removal (preserves rest of config)

---

## Dependency Installation Flow

### High-Level Process

```
User runs: `pantry install node python`
    │
    ├─> CLI parsing (bin/cli.ts:78)
    │   └─> Resolves to install command
    │
    ├─> Command execution (src/commands/install.ts)
    │   └─> Delegates to core install function
    │
    ├─> Main install() (src/install-main.ts:18)
    │   ├─> Parse package specifications
    │   ├─> Resolve dependencies (if enabled)
    │   ├─> Add companion packages (npm for node)
    │   └─> Install each package
    │
    ├─> Package installation loop (src/install-main.ts:164)
    │   └─> For each package:
    │       └─> installPackage() (src/install-core.ts)
    │
    └─> installPackage() flow:
        ├─> 1. Resolve package name/version
        ├─> 2. Check cache for downloaded archive
        ├─> 3. Download if not cached
        ├─> 4. Extract to install directory
        ├─> 5. Create symlinks (version, compatibility)
        ├─> 6. Generate binary wrappers/shims
        ├─> 7. Fix library paths (macOS)
        └─> 8. Validate installation
```

### Module Breakdown

#### Package Resolution

**File**: `src/package-resolution.ts`

**Key Functions**:

- `parsePackageSpec(spec: string)` - Parse package specs like `node@18`, `python@^3.11`
- `resolvePackageName(name: string)` - Resolve aliases (e.g., `node` → `nodejs.org`)
- `resolveVersion(name: string, constraint?: string)` - Find matching version using ts-pkgx
- `getPackageInfo(name: string)` - Get package metadata (dependencies, companions, etc.)

**ts-pkgx Integration**:

pantry uses `ts-pkgx` (v0.4.93+) for package metadata:

- Fully typed package names and versions
- Access to pkgx package registry
- Dependency graph resolution
- Companion package suggestions

#### Dependency Resolution

**File**: `src/dependency-resolution.ts`

**Function**: `resolveAllDependencies(packages: PackageSpec[])`

**Purpose**: Resolve complete dependency tree with conflict resolution

**Algorithm**:

1. Use ts-pkgx to get runtime dependencies for each package
2. Build dependency graph (direct + transitive)
3. Resolve version conflicts (prefer latest compatible version)
4. Return flattened, deduplicated package list

**Config**: Controlled by `config.installDependencies` (default: true)

#### Installation Core

**File**: `src/install-core.ts`

**Key Function**: `installPackage(packageName: string, spec: string, installPath: string)`

**Steps**:

1. **Version Resolution**

   ```typescript
   const version = await resolveVersion(packageName, versionConstraint)
   ```

2. **Cache Check**

   ```typescript
   const cachedPath = getCachedPackagePath(domain, version, format)
   if (cachedPath)
     return cachedPath // Skip download
   ```

3. **Download** (if not cached)
   - Fetches from pkgx CDN
   - Uses platform/architecture-specific URLs
   - Stores in `~/.cache/pantry/binaries/packages/`

4. **Extraction**
   - Extracts to `<installPath>/pkgs/<domain>/v<version>/`
   - Preserves permissions and symlinks

5. **Symlink Creation**
   - Version symlinks: `v*` → `v1.2.3`
   - Compatibility symlinks: `libssl.dylib` → `libssl.1.1.dylib`
   - PKG_CONFIG symlinks for build tools

6. **Binary Wrappers**
   - Creates wrapper scripts in `<installPath>/bin/`
   - Sets `DYLD_LIBRARY_PATH` (macOS), `LD_LIBRARY_PATH` (Linux)
   - Adds shebang and execution permissions

7. **Validation**
   - Checks binary exists and is executable
   - Verifies library dependencies resolved

#### Install Helpers

**File**: `src/install-helpers.ts`

**Key Functions**:

- `createShims()` - Generate binary wrapper scripts
- `createVersionSymlinks()` - Create version-based symlinks
- `createVersionCompatibilitySymlinks()` - Create major version symlinks
- `fixMacOSLibraryPaths()` - Update library install names for macOS
- `validatePackageInstallation()` - Post-install validation

### Installation Paths

**System-wide**:

```
~/.local/share/pantry/global/
  ├── bin/           # Binary wrappers/shims
  ├── pkgs/          # Actual package installations
  │   └── <domain>/
  │       └── v<version>/
  ├── lib/           # Symlinked libraries
  ├── include/       # Symlinked headers
  └── share/         # Shared data
```

**Project-specific**:

```
~/.local/share/pantry/envs/<project_hash>/
  ├── bin/
  ├── pkgs/
  ├── lib/
  ├── include/
  └── share/
```

**Environment Hash Format**:

```
<project_name>_<dir_hash>[-d<deps_hash>]

Examples:

  - my-app_208a31ec
  - pantry_208a31ec-d1a2b3c4  (with dependency file hash)

```

**Hashing**:

- Directory hash: MD5(full_project_path) truncated to 8 chars
- Dependency hash: MD5(dependency_file_contents) truncated to 8 chars
- Purpose: Unique environment per project + dependency combination

---

## Caching System

### Overview

pantry uses **dual caching**:

1. **Package Cache**: Downloaded binary archives
2. **Environment Cache**: Project → environment directory mappings

### Package Cache

**Location**: `~/.cache/pantry/binaries/packages/`

**Structure**:

```
packages/
  ├── <domain>-<version>/
  │   └── package.<format>  # .tar.gz, .tar.xz, .zip, etc.
  └── ...

Metadata file: ~/.cache/pantry/cache-metadata.json
```

**Metadata Format** (`src/cache.ts:12`):

```json
{
  "version": "1.0",
  "packages": {
    "nodejs.org-20.10.0": {
      "domain": "nodejs.org",
      "version": "20.10.0",
      "format": "tar.xz",
      "downloadedAt": "2025-10-20T10:00:00.000Z",
      "lastAccessed": "2025-10-20T15:30:00.000Z",
      "size": 45678901
    }
  }
}
```

**Cache Operations**:

#### Cache Lookup

**Function**: `getCachedPackagePath(domain, version, format)` - `src/cache.ts:272`

**Logic**:

1. Check if archive file exists
2. Validate against metadata (size check)
3. Update last accessed timestamp
4. Return path or null

#### Cache Writing

**Function**: `savePackageToCache(domain, version, format, sourcePath)` - `src/cache.ts:322`

**Logic**:

1. Copy downloaded file to cache directory
2. Update metadata with file size and timestamps
3. Return cached path

#### Cache Cleanup

**Function**: `cleanupCache(maxAgeDays, maxSizeGB)` - `src/cache.ts:367`

**Strategy**:

1. Remove packages older than `maxAgeDays` (default: 30)
2. If total size exceeds `maxSizeGB` (default: 5), remove oldest packages
3. Sort by last accessed time (LRU eviction)

**Command**: `pantry cache:clean --max-age 7 --max-size 2`

#### Cache Clearing

**Command**: `pantry cache:clear --force`

**Function**: Removes entire cache directory (`~/.cache/pantry/`)

**File**: `src/commands/cache/clear.ts:107`

### Environment Cache

**Purpose**: Map project directories to their environment directories for instant activation

**Location**: `~/.cache/pantry/shell_cache/env_cache`

**Format** (pipe-delimited):

```
/path/to/project|dependency_file|mtime|environment_directory

Example:
/Users/chris/dev/myapp|/Users/chris/dev/myapp/package.json|1729425600|/Users/chris/.local/share/pantry/envs/myapp_208a31ec
```

**Management**: `EnvCacheManager` class - `src/cache.ts:26-230`

**Operations**:

#### Load Cache

**Method**: `load()` - `src/cache.ts:33`

- Reads entire cache file into memory on first access
- Parses into in-memory Map for O(1) lookups
- Singleton pattern (loaded once per process)

#### Get Entry

**Method**: `get(projectDir)` - `src/cache.ts:70`

- Returns cached environment info or null
- Checks in-memory cache first

#### Set Entry

**Method**: `set(projectDir, depFile, envDir)` - `src/cache.ts:80`

- Updates in-memory cache immediately
- Schedules async disk write (debounced 10ms)
- Includes dependency file mtime for invalidation

#### Validate Cache

**Method**: `validate()` - `src/cache.ts:195`

- Checks if environment directories still exist
- Verifies dependency file mtime matches cached value
- Removes stale entries
- Returns count of removed entries

**Invalidation Triggers**:

1. **Environment directory deleted** (manual cleanup or env:remove)
2. **Dependency file modified** (package.json changed)
3. **Cache cleared** (`pantry cache:clear`)

### Cache Performance

**Shell-level caching** (covered in [Shell Integration](#shell-integration)):

- **Tier 1**: In-memory (instant, 0 syscalls)
- **Tier 2**: Disk lookup (fast, 1-3 syscalls)
- **Tier 3**: Filesystem walk (fallback, many syscalls)

**Typical performance**:

- Cached environment activation: **< 5ms**
- Cache miss (first activation): **50-200ms**
- Package download (cache miss): **1-30s** (network dependent)

---

## Command Architecture

### Command Loading Strategy

**Lazy Loading**: Commands are loaded on-demand to minimize CLI startup time.

**Registry**: `src/commands/index.ts:4`

```typescript
const registry: Record<string, () => Promise<Command>> = {
  install: async () => (await import('./install')).default,
  search: async () => (await import('./search')).default,
  // ... 50+ commands
}
```

**Resolution**: `resolveCommand(name: string)` - Returns Command or undefined

### Command Interface

**File**: `src/cli/types.ts`

```typescript
interface Command {
  name: string
  description: string
  run: (context: {
    argv: string[]
    env: Record<string, string | undefined>
    options?: Record<string, unknown>
  }) => Promise<number> // Exit code
}
```

### CLI Framework

**Framework**: `@stacksjs/clapp` (CAC-based)

**Entry Point**: `bin/cli.ts`

**Flow**:

```

1. CLI definition (using clapp fluent API)
2. User runs command: `pantry install node`
3. clapp parses arguments and options
4. Invokes action handler
5. Action handler resolves command from registry
6. Executes command.run({ argv, env })
7. Exits with returned code

```

**Example** (install command - `bin/cli.ts:57`):

```typescript
cli
  .command('install [packages...]', 'Install packages')
  .option('--verbose', 'Enable verbose output')
  .option('-g, --global', 'Install globally')
  .action(async (packages: string[], options) => {
    const argv = [...packages]
    if (options.verbose)
      argv.push('--verbose')
    if (options.global)
      argv.push('--global')

    const cmd = await resolveCommand('install')
    const code = await cmd.run({ argv, env: process.env })
    process.exit(code)
  })
```

### Command Categories

**Core Package Management**:

- `install` - Install packages
- `uninstall` - Remove packages
- `reinstall` - Reinstall packages
- `update` - Update packages to newer versions
- `outdated` - Check for outdated packages
- `list` - List installed packages

**Package Discovery**:

- `search` - Search for packages
- `info` - Show package details
- `tags` - Browse packages by category

**Environment Management**:

- `env:list` - List all environments
- `env:inspect` - Inspect environment details
- `env:clean` - Clean old environments
- `env:remove` - Remove specific environment

**Cache Management**:

- `cache:clear` - Clear all caches
- `cache:stats` - Show cache statistics
- `cache:clean` - Clean up old cached packages

**Service Management**:

- `start <service>` - Start service
- `stop <service>` - Stop service
- `restart <service>` - Restart service
- `status [service]` - Show service status

**Development**:

- `dev` - Set up dev environment for current directory
- `dev:integrate` - Install shell hooks
- `dev:shellcode` - Generate shell integration code
- `bootstrap` - Install essential tools
- `doctor` - Run health checks

---

## Environment Management

### Environment Lifecycle

```

1. PROJECT DETECTION

   └─> Finds dependency files (package.json, Cargo.toml, etc.)

2. ENVIRONMENT CREATION

   └─> Computes environment hash
   └─> Creates directory: ~/.local/share/pantry/envs/<hash>/

3. DEPENDENCY INSTALLATION

   └─> Installs packages to environment directory
   └─> Creates binary wrappers in env/bin/

4. CACHE REGISTRATION

   └─> Adds entry to ~/.cache/pantry/shell_cache/env_cache
   └─> Maps project directory → environment directory

5. ENVIRONMENT ACTIVATION (automatic on cd)

   └─> Modifies PATH to prioritize environment binaries
   └─> Sets environment variables (BUN_INSTALL, etc.)

6. ENVIRONMENT DEACTIVATION (automatic on cd out)

   └─> Removes environment paths from PATH
   └─> Clears environment variables
```

### Project Detection

**File**: `src/env.ts:669`

**Function**: `findDependencyFile(root: string, searchAncestors: boolean)`

**Dependency File Priority** (`src/env.ts:611`):

```typescript
const DEPENDENCY_FILE_NAMES = [
  // pantry-specific (highest priority)
  'pantry.config.ts',
  'pantry.config.js',
  'dependencies.yaml',
  'deps.yaml',
  'pkgx.yaml',

  // Language-specific
  'package.json', // Node.js
  'Cargo.toml', // Rust
  'go.mod', // Go
  'pyproject.toml', // Python
  'Gemfile', // Ruby
  'deno.json', // Deno

  // Version files
  '.nvmrc',
  '.node-version',
  '.ruby-version',
  '.python-version',

  // ... and more
]
```

**Detection Algorithm**:

1. Start at current directory
2. Check for each dependency file in priority order
3. If found → project root is current directory
4. If `searchAncestors=true`, walk up directory tree
5. Repeat until found or reach filesystem root

**Shell Fallback**: If no file found, uses `dev:find-project-root` binary detection

### Environment Directory Structure

```
~/.local/share/pantry/envs/<project_hash>/
  ├── bin/              # Binary wrappers/shims (added to PATH)
  ├── pkgs/             # Installed packages
  │   └── <domain>/
  │       └── v<version>/
  ├── lib/              # Symlinked libraries
  ├── include/          # Symlinked headers
  ├── share/            # Shared resources
  ├── .bun/             # Bun global installs (if bun present)
  │   └── bin/
  └── sbin/             # System binaries (if needed)
```

### Environment Commands

#### `env:list`

**File**: `src/commands/env/list.ts` → `src/env.ts:164`

**Purpose**: List all development environments

**Output Formats**:

- `table` (default) - Formatted table with project name, packages, size, created date
- `json` - JSON array of environment metadata
- `simple` - One line per environment (name + hash)

**Example**:

```bash
$ pantry env:list

📦 Development Environments:

│ Project    │ Packages │ Binaries │ Size     │ Created    │
├─────────────┼──────────┼──────────┼──────────┼────────────┤
│ my-app     │ 12       │ 34       │ 234.5 MB │ 10/15/2025 │
│ pantry  │ 8        │ 21       │ 156.2 MB │ 10/10/2025 │
└─────────────┴──────────┴──────────┴──────────┴────────────┘

Total: 2 environment(s)
```

#### `env:inspect <hash>`

**File**: `src/commands/env/inspect.ts` → `src/env.ts:246`

**Purpose**: Show detailed information about a specific environment

**Information Displayed**:

- Basic info (project name, hash, path, size, timestamps)
- Directory structure (bin/, pkgs/, lib/, etc.)
- Installed packages
- Available binaries
- Health check (binaries present, packages installed, directory structure)

#### `env:clean`

**File**: `src/commands/env/clean.ts` → `src/env.ts:387`

**Purpose**: Clean up old or broken environments

**Cleanup Criteria**:

- Environments older than X days (default: 30)
- Environments with no binaries (failed installations)
- Empty or corrupted environments

**Options**:

- `--dry-run` - Preview what would be cleaned
- `--older-than <days>` - Custom age threshold
- `--force` - Skip confirmation

#### `env:remove <hash>` / `env:remove --all`

**File**: `src/commands/env/remove.ts` → `src/env.ts:490`

**Purpose**: Remove specific environment or all environments

**Safety**:

- Requires `--force` flag to prevent accidental deletion
- Shows what will be removed before deletion
- Displays freed disk space after removal

### Environment Variables

**Project Environment**:

- `pantry_CURRENT_PROJECT` - Current project directory
- `pantry_ENV_DIR` - Environment directory
- `pantry_ENV_BIN_PATH` - Environment bin directory (for PATH)
- `BUN_INSTALL` - Bun installation directory (if bun present)

**Shell Integration**:

- `pantry_DISABLE_SHELL_INTEGRATION` - Disable shell hooks
- `pantry_SHELL_INTEGRATION` - Indicates shell integration mode
- `PANTRY_VERBOSE` - Enable verbose shell messages
- `pantry_SHELL_VERBOSE` - Shell-specific verbose mode

**Internal**:

- `__pantry_LAST_PWD` - Last processed directory (avoids duplicate work)
- `__pantry_LAST_ACTIVATION_KEY` - Last activated project (prevents duplicate messages)
- `__pantry_PROCESSING` - Lock flag to prevent infinite loops
- `__pantry_IN_HOOK` - Flag to prevent hook recursion

---

## Service Management

### Overview

pantry provides built-in service management for common development services (PostgreSQL, MySQL, Redis, Nginx, etc.). It abstracts platform-specific service managers (launchd on macOS, systemd on Linux).

### Service Architecture

```
User Command: `pantry start postgres`
    │
    ├─> src/commands/start.ts
    │   └─> Resolves service name
    │
    ├─> src/services/manager.ts:startService(name)
    │   ├─> Gets service definition
    │   ├─> Checks if service binary installed
    │   ├─> Initializes service (if first start)
    │   └─> Starts via platform manager
    │
    └─> src/services/platform.ts
        ├─> macOS: launchd (launchctl)
        ├─> Linux: systemd (systemctl)
        └─> Windows: NSSM (planned)
```

### Service Definitions

**File**: `src/services/definitions.ts`

**Structure**:

```typescript
interface ServiceDefinition {
  name: string
  displayName: string
  description: string
  package: string // Package to install
  binary: string // Binary name
  configTemplate?: string // Config file template
  defaultPort?: number
  autoStart?: boolean
  initCommand?: string[] // Initialization command
  startCommand?: string[] // Custom start command
  stopCommand?: string[] // Custom stop command
}
```

**Supported Services** (30+):

**Databases**:

- PostgreSQL (postgres)
- MySQL (mysql)
- Redis (redis)
- MongoDB (mongodb)
- SQLite (sqlite)
- Meilisearch (meilisearch)

**Web Servers**:

- Nginx (nginx)
- Apache (apache)
- Caddy (caddy)

**Message Queues**:

- RabbitMQ (rabbitmq)
- Apache Kafka (kafka)

**...and more**

### Service Operations

#### Start Service

**Command**: `pantry start <service>`

**Flow**:

1. Resolve service definition
2. Check if service package installed (install if missing)
3. Check if service initialized (run init if needed)
4. Start service via platform manager
5. Wait for service to be ready (health check)
6. Display status

#### Stop Service

**Command**: `pantry stop <service>`

**Flow**:

1. Resolve service definition
2. Stop service via platform manager
3. Verify service stopped

#### Restart Service

**Command**: `pantry restart <service>`

**Flow**: Stop → Start (with health check)

#### Enable/Disable Service

**Commands**:

- `pantry enable <service>` - Auto-start on boot
- `pantry disable <service>` - Disable auto-start

**Implementation**: Uses `launchctl load -w` (macOS) or `systemctl enable` (Linux)

#### Service Status

**Command**: `pantry status [service]`

**Output**:

- If service specified: Status of that service
- If no service specified: Status of all services

**Formats**:

- `table` (default) - Formatted table
- `json` - JSON output
- `simple` - One line per service

### Platform-Specific Implementation

#### macOS (launchd)

**Service Files**: `~/Library/LaunchAgents/com.pantry.<service>.plist`

**Operations**:

- Start: `launchctl start com.pantry.<service>`
- Stop: `launchctl stop com.pantry.<service>`
- Status: `launchctl list | grep com.pantry.<service>`
- Enable: `launchctl load -w <plist>`
- Disable: `launchctl unload -w <plist>`

#### Linux (systemd)

**Service Files**: `~/.config/systemd/user/<service>.service`

**Operations**:

- Start: `systemctl --user start <service>`
- Stop: `systemctl --user stop <service>`
- Status: `systemctl --user status <service>`
- Enable: `systemctl --user enable <service>`
- Disable: `systemctl --user disable <service>`

### Auto-Start Configuration

**Config**: `config.services.autoStart` (default: false)

**Behavior**: When enabled, automatically starts services after installing their packages.

**Example**:

```bash
$ pantry install postgres  # Installs PostgreSQL
# If autoStart=true
✅ Service postgres initialized and started
```

---

## File System Layout

### Global Directories

```
~/.local/
  ├── bin/                    # System-wide binaries
  └── share/
      └── pantry/
          ├── global/         # Global package installations
          │   ├── bin/
          │   ├── pkgs/
          │   ├── lib/
          │   ├── include/
          │   └── share/
          └── envs/           # Project-specific environments
              ├── <project_hash_1>/
              ├── <project_hash_2>/
              └── ...

~/.cache/
  └── pantry/
      ├── binaries/
      │   └── packages/       # Downloaded package archives
      │       └── <domain>-<version>/
      ├── shell_cache/        # Environment cache
      │   ├── env_cache       # Project → env mapping
      │   ├── update_check_backoff
      │   └── global_refresh_needed
      └── cache-metadata.json # Package cache metadata

~/.config/
  └── systemd/
      └── user/               # Linux systemd service files
          ├── postgres.service
          ├── redis.service
          └── ...

~/Library/
  └── LaunchAgents/           # macOS launchd service files
      ├── com.pantry.postgres.plist
      ├── com.pantry.redis.plist
      └── ...
```

### Project Configuration

**pantry Config**: `pantry.config.ts` (or `.js`)

**Example**:

```typescript
import type { pantryConfig } from 'pantry'

export default {
  dependencies: {
    node: '20',
    python: '^3.11',
    bun: 'latest',
  },

  globalDependencies: {
    starship: 'latest', // Installed globally
  },

  services: {
    autoStart: true, // Auto-start services
  },

  verbose: false,
  installDependencies: true,
} satisfies pantryConfig
```

**Dependency Files**: See [Project Detection](#project-detection) for full list

---

## Performance Optimizations

### Shell Integration Performance

1. **PWD Change Detection** - `src/dev/shellcode.ts:289`
   - Check: `if ($__pantry_LAST_PWD == $PWD) return 0`
   - Result: **0 syscalls** for unchanged directory

2. **Subdirectory Fast Path** - `src/dev/shellcode.ts:296`
   - Check: `if ($PWD == $pantry_CURRENT_PROJECT*) return 0`
   - Result: **0 syscalls** for subdirectories of current project

3. **Instant Deactivation** - `src/dev/shellcode.ts:302`
   - Deactivate immediately when leaving project
   - No project detection needed
   - Result: **5-10 syscalls** (PATH manipulation only)

4. **Multi-Tier Caching** - `src/dev/shellcode.ts:143`
   - Tier 1: In-memory (0 syscalls)
   - Tier 2: Disk cache (1-3 syscalls)
   - Tier 3: Filesystem walk (fallback)
   - Result: **< 5 syscalls** for cached projects

5. **MD5 Hash Caching** - `src/dev/shellcode.ts:96`
   - Cache MD5 hashes in memory
   - Include file mtime for invalidation
   - Result: Avoid spawning MD5 process repeatedly

6. **Async Cache Writes** - `src/dev/shellcode.ts:240`
   - Write cache in background
   - Don't block shell prompt
   - Result: No blocking I/O

### Installation Performance

1. **Download Caching**
   - Cache downloaded archives
   - Validate with size + metadata
   - Result: **Skip downloads** for cached packages

2. **Parallel Installation** (planned)
   - Install independent packages in parallel
   - Respect dependency order
   - Result: **Faster multi-package installs**

3. **Lazy Command Loading** - `src/commands/index.ts`
   - Load commands on-demand
   - Result: **Fast CLI startup** (< 100ms)

### Cache Performance

**Environment Cache**:

- **In-memory**: O(1) lookups, instant
- **Disk cache**: Single awk invocation, 1-3ms
- **Write**: Async, debounced (10ms), non-blocking

**Package Cache**:

- **Metadata**: Single JSON file, loaded once
- **Lookup**: O(1) hash map lookup
- **Validation**: Size check only (fast)

---

## Cross-Platform Considerations

### Platform Detection

**File**: `src/utils.ts`

**Functions**:

- `getPlatform()` - Returns `darwin`, `linux`, `windows`
- `getArchitecture()` - Returns `x64`, `arm64`, `aarch64`

### Platform-Specific Behavior

#### macOS (Darwin)

**Library Path Handling**:

- Uses `DYLD_LIBRARY_PATH`, `DYLD_FALLBACK_LIBRARY_PATH`
- Requires fixing install names with `install_name_tool`
- Binary wrappers set `DYLD_*` variables

**Library Install Names**: `src/install-helpers.ts:fixMacOSLibraryPaths()`

- Updates library dependencies to use `@loader_path/../lib`
- Enables relocatable binaries

**Service Manager**: `launchd` (via `launchctl`)

#### Linux

**Library Path Handling**:

- Uses `LD_LIBRARY_PATH`
- Binary wrappers set `LD_LIBRARY_PATH`

**Service Manager**: `systemd` (via `systemctl --user`)

#### Windows

**Library Path Handling**: `PATH` modification

**Service Manager**: NSSM (planned)

### Binary Distribution

**Download URLs**: Platform + architecture specific

**Example** (Node.js):

```
darwin-arm64: https://dist.nodejs.org/v20.10.0/node-v20.10.0-darwin-arm64.tar.gz
darwin-x64:   https://dist.nodejs.org/v20.10.0/node-v20.10.0-darwin-x64.tar.gz
linux-arm64:  https://dist.nodejs.org/v20.10.0/node-v20.10.0-linux-arm64.tar.gz
linux-x64:    https://dist.nodejs.org/v20.10.0/node-v20.10.0-linux-x64.tar.gz
```

**Archive Formats**: `.tar.gz`, `.tar.xz`, `.zip` (platform dependent)

---

## Zig Refactoring Considerations

### High-Value Targets for Zig

1. **Shell Code Generation** (`src/dev/shellcode.ts`)
   - **Why**: Performance-critical, runs on every shell startup
   - **Benefit**: Faster generation, smaller binary
   - **Challenge**: Complex string manipulation

2. **Cache System** (`src/cache.ts`)
   - **Why**: Hot path for environment switching
   - **Benefit**: Faster lookups, lower memory usage
   - **Challenge**: Async I/O, JSON parsing

3. **Project Detection** (`src/env.ts:findDependencyFile`)
   - **Why**: Called frequently, I/O heavy
   - **Benefit**: Faster file system operations
   - **Challenge**: Recursive directory walking

4. **MD5 Hashing** (`dev:md5` command)
   - **Why**: Called by shell code for cache keys
   - **Benefit**: Eliminate process spawning overhead
   - **Challenge**: Shell integration

5. **Binary Wrappers** (`src/install-helpers.ts:createShims`)
   - **Why**: Generated for every installed binary
   - **Benefit**: Faster execution, less overhead
   - **Challenge**: Complex environment setup

### Architecture Preservation

**Keep**:

- Multi-tier caching strategy
- Lazy environment activation
- Instant deactivation logic
- Cache invalidation triggers

**Consider**:

- Compile shell code ahead of time (vs. runtime generation)
- Native library for cache operations (FFI from shell)
- Standalone binary for project detection (already done)

### Performance Targets

**Current** (TypeScript/Bun):

- CLI startup: ~100ms
- Cached environment activation: < 5ms
- Cache miss activation: 50-200ms

**Target** (Zig):

- CLI startup: < 10ms
- Cached environment activation: < 1ms
- Cache miss activation: 20-50ms

---

## Summary

pantry's architecture is built around three core pillars:

1. **Shell Integration**: Seamless environment activation via hooks
2. **Multi-Tier Caching**: Instant environment switching via aggressive caching
3. **Modular Commands**: Lazy-loaded commands for fast CLI startup

The system achieves sub-millisecond environment switching through careful optimization of the shell integration layer, leveraging in-memory caching and minimizing syscalls. The caching system operates at multiple levels (shell, process, disk) to ensure optimal performance.

For a Zig refactor, focus on:

- Shell code generation (performance-critical)
- Cache system (hot path)
- File system operations (I/O heavy)

While preserving:

- Multi-tier caching architecture
- Lazy activation strategy
- Cache invalidation logic
- Cross-platform abstractions

---

**Maintained by**: pantry Team
**Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)
**License**: MIT
