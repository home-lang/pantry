# pantry Architecture

> **Purpose**: This document provides a comprehensive technical overview of pantry's architecture. The entire CLI is implemented in Zig for performance. Supporting packages handle metadata generation, the package registry API, CI integration, and benchmarking.

**Last Updated**: 2026-03-02

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Repository Structure](#repository-structure)
3. [Core Architecture Layers](#core-architecture-layers)
4. [Shell Integration](#shell-integration)
5. [Dependency Detection and Resolution](#dependency-detection-and-resolution)
6. [Installation Flow](#installation-flow)
7. [Caching System](#caching-system)
8. [Command Architecture](#command-architecture)
9. [Environment Management](#environment-management)
10. [Service Management](#service-management)
11. [Registry](#registry)
12. [Authentication and Security](#authentication-and-security)
13. [File System Layout](#file-system-layout)
14. [Cross-Platform Considerations](#cross-platform-considerations)

---

## System Overview

pantry is a modern dependency manager that provides:

- **System-wide and project-specific package installations**
- **Automatic environment activation on directory changes (via shell hooks)**
- **Multi-tier caching for packages and environment metadata**
- **Service management for 68+ services (PostgreSQL, Redis, Kafka, etc.)**
- **Cross-platform support (macOS, Linux, FreeBSD)**
- **Package publishing with OIDC-based trusted publishers**

### Key Design Principles

1. **Performance First**: Written in Zig for sub-millisecond CLI startup and environment switching
2. **Zero Configuration**: Automatic project detection and environment setup
3. **Isolation**: Each project gets its own isolated dependency environment
4. **Shell Integration**: Seamless activation/deactivation on `cd` commands
5. **Security by Default**: Lifecycle scripts require explicit trust; OIDC for passwordless publishing

---

## Repository Structure

The project is organized as a monorepo with five packages:

```
packages/
  zig/           Main CLI binary (Zig)
  ts-pantry/     TypeScript package metadata scraper/generator
  registry/      REST API server (Bun.serve + DynamoDB)
  action/        GitHub Action for CI integration
  benchmark/     Package manager benchmarking tools
```

### `packages/zig/` -- Main CLI

The core of pantry. A single statically-linked Zig binary (~3200 lines in `main.zig` alone) that handles all CLI operations. Built with Zig 0.15.1+, uses the `zig-cli` library for command parsing and `zig-config` for configuration loading.

**Source layout** (`packages/zig/src/`):

```
main.zig              CLI entry point, command definitions, action handlers
lib.zig               Library root, re-exports all modules
io_helper.zig         I/O abstraction (file ops, env vars, child processes)
version.zig           Version constants (injected at build time)

cli/
  commands.zig         Command module aggregator (re-exports all command modules)
  style.zig            ANSI terminal styling utilities
  commands/
    install.zig        install, add, install --global
    install/           Sub-modules: core, global, helpers, lockfile_hooks, workspace, types
    package.zig        remove, update, outdated, uninstall, publish, why
    registry.zig       search, info, list, whoami, registry publish
    scripts.zig        run (script execution from package.json)
    services.zig       start, stop, restart, status, enable, disable, logs, inspect, exec, snapshot, restore
    env.zig            env:list, env:inspect, env:clean, env:remove
    shell.zig          shell:integrate, dev:shellcode, shell:lookup, shell:activate
    cache.zig          cache:stats, cache:clear, cache:clean
    px.zig             px (package executor, npx/bunx equivalent)
    dev.zig            dev:shellcode, dev:md5, dev:find-project-root, dev:check-updates
    audit.zig          Security vulnerability auditing
    verify.zig         Package signature verification, signing, key generation
    publish_commit.zig Commit-based publishing (pkg-pr-new equivalent)
    bootstrap.zig      Bootstrap pantry installation
    doctor.zig         System health checks
    init.zig           Project initialization
    tree.zig           Dependency tree visualization
    why.zig            Explain why a package is installed
    outdated.zig       Check for outdated dependencies
    update.zig         Update dependencies
    clean.zig          Clean project artifacts
    dedupe.zig         Deduplicate dependencies
    link.zig           Link/unlink local packages
    shim.zig           Create/list/remove command shims
    oidc.zig           OIDC trusted publisher setup
    run_filter.zig     Script execution with workspace filtering
    parallel_executor.zig  Parallel command execution

config/
  loader.zig           Config file loading (pantry.json, package.json, etc.)
  dependencies.zig     Extract dependencies from config
  scripts.zig          Extract scripts from config
  services.zig         Extract service definitions from config
  toml.zig             TOML parser
  npmrc.zig            .npmrc configuration parser
  pantry_config.zig    pantry.toml project configuration (linker mode, peer deps, etc.)

deps/
  detector.zig         Dependency file detection (walks directory tree)
  parser.zig           Dependency file parsing
  resolver.zig         Dependency resolution and topological sorting
  overrides.zig        Package.json override resolution
  catalogs.zig         Catalog-based dependency management
  global_scanner.zig   Global dependency scanning
  resolution/
    conflict.zig       Version conflict resolution
    lockfile.zig       Lockfile-based resolution
    optional.zig       Optional dependency handling
    peer.zig           Peer dependency management

install/
  installer.zig        Core installation logic
  downloader.zig       HTTP download with progress
  extractor.zig        Archive extraction (tar.gz, tar.xz, zip)
  symlink.zig          Binary symlink creation, discovery, conflict resolution
  wrapper.zig          Shell wrapper/shim generation, macOS dylib path fixing
  validator.zig        Post-install validation
  rollback.zig         Installation rollback on failure
  recovery.zig         Recovery from partial installs
  parallel.zig         Parallel download orchestration
  runtime.zig          Runtime installer (Node, Bun, Deno, Python, etc.)
  offline.zig          Offline installation from cache
  patches.zig          Post-install patches
  libfixer.zig         Library path fixing (install_name_tool on macOS)

env/
  manager.zig          Environment lifecycle (create, activate, deactivate)
  scanner.zig          Environment directory scanning
  commands.zig         Environment command implementations

shell/
  generator.zig        Shell code generation (embeds shell_integration.sh)
  integration.zig      Shell hook generation (chpwd, PROMPT_COMMAND)
  integrate.zig        Shell RC file modification (~/.zshrc, ~/.bashrc)
  commands.zig         Shell command implementations

services/
  definitions.zig      68+ pre-defined service configurations
  manager.zig          Service lifecycle (register, start, stop, status)
  platform.zig         Platform-specific service control (launchd, systemd)

cache/
  env_cache.zig        Environment directory cache
  package_cache.zig    Downloaded package archive cache
  optimized.zig        Optimized cache with statistics
  shared.zig           Shared/global cache

packages/
  types.zig            PackageSpec, PackageInfo, Lockfile types
  lockfile.zig         Lockfile read/write
  registry.zig         Package registry client, version comparison
  dep_graph.zig        Dependency graph construction
  semver.zig           Semantic versioning
  workspace.zig        Workspace package detection
  workspace_deps.zig   Cross-workspace dependency resolution
  filter.zig           Package filtering
  filter_config.zig    Filter configuration
  changed_detector.zig Detect changed packages in workspace
  file_watcher.zig     File change watching
  advanced_glob.zig    Glob pattern matching
  publish.zig          Package publishing
  aliases.zig          Package name aliases
  generated.zig        Generated package name mappings (from ts-pantry)
  simple_regex.zig     Lightweight regex for version matching

registry/
  core.zig             Registry type definitions (pantry, npm, pkgx, github, custom)
  npm.zig              npm registry client
  pantry.zig           Pantry registry client
  custom.zig           Custom registry support

auth/
  oidc.zig             OIDC token handling for CI/CD publishing
  signing.zig          Package signing (Ed25519)
  sigstore.zig         Sigstore integration
  registry.zig         Registry authentication
  policy.zig           Access policy management
  provenance.zig       Build provenance
  github.zig           GitHub authentication

core/
  platform.zig         Platform/architecture detection
  error.zig            Error types (PantryError, ErrorContext)
  string.zig           String utilities
  path.zig             Path utilities

workspace/
  core.zig             Workspace detection and configuration
  commands.zig         Workspace commands (init, list, run, link, check, graph, exec)

lifecycle/
  enhanced.zig         Enhanced lifecycle script execution
  hooks.zig            Lifecycle hook management

utils/
  concurrent.zig       Concurrency utilities
  cpu.zig              CPU feature detection
  jsonc.zig            JSONC (JSON with comments) parser
  release_age.zig      Release age calculation
```

### `packages/ts-pantry/` -- TypeScript Package Metadata

Scrapes package metadata from pkgx/Homebrew sources, resolves dependencies, and generates Zig source files (`generated.zig`) with package name mappings. This runs offline to produce compile-time data baked into the CLI binary.

### `packages/registry/` -- REST API Server

A Bun.serve HTTP server providing the Pantry package registry API. Uses DynamoDB (single-table design) for metadata storage and S3 for tarball storage. Falls back to npm for packages not in the Pantry registry.

### `packages/action/` -- GitHub Action

A GitHub Action (TypeScript, `@actions/core`) that installs pantry and project dependencies in CI. Supports auto-detecting project dependencies and a `setup-only` mode.

### `packages/benchmark/` -- Benchmarks

Benchmarking tools for comparing pantry against other package managers (npm, yarn, pnpm, bun).

---

## Core Architecture Layers

```
+-----------------------------------------------------------+
|                      CLI Layer                            |
|  (main.zig - zig-cli framework)                          |
|  - Command/option/argument parsing                       |
|  - Action dispatch                                       |
+---------------------+------------------------------------+
                      |
+---------------------v------------------------------------+
|                  Command Layer                           |
|  (cli/commands/*.zig)                                    |
|  - install, remove, update, publish, run, etc.           |
|  - Environment, cache, shell, service commands           |
+---------------------+------------------------------------+
                      |
+---------------------v------------------------------------+
|                Core Logic Layer                           |
|  - install/         Package installation pipeline        |
|  - deps/            Dependency detection & resolution    |
|  - packages/        Registry clients, lockfile, semver   |
|  - config/          Config file parsing                  |
|  - lifecycle/       Lifecycle script execution           |
|  - auth/            OIDC, signing, provenance            |
+---------------------+------------------------------------+
                      |
+---------------------v------------------------------------+
|              System Integration Layer                    |
|  - io_helper.zig    File I/O, env vars, child processes  |
|  - core/            Platform detection, error handling   |
|  - shell/           Shell hook generation & integration  |
|  - services/        launchd/systemd service management   |
|  - cache/           Multi-tier caching                   |
+-----------------------------------------------------------+
```

---

## Shell Integration

### Overview

Shell integration enables automatic environment activation when you `cd` into a project directory. The Zig binary generates shell code that gets evaluated by the user's shell.

### Integration Flow

```

1. User runs: pantry shell:integrate

   -> Appends hook to ~/.zshrc or ~/.bashrc

2. Shell startup:

   -> eval "$(pantry dev:shellcode)"
      -> Zig binary outputs shell functions and hooks

3. User runs: cd /path/to/project

   -> Triggers __pantry_chpwd (zsh) or __pantry_prompt_command (bash)
      -> Calls __pantry_switch_environment
          +-> Cache lookup (instant if cached)
          +-> Project detection (if cache miss)
          +-> Environment activation/deactivation
          +-> PATH modification
```

### Shell Code Generation

**File**: `packages/zig/src/shell/generator.zig`

The `ShellCodeGenerator` struct produces shell integration code. It embeds a shell template (`shell_integration.sh`) at compile time via `@embedFile` and injects configuration variables (message preferences, verbose mode). The generated script includes:

1. Utility functions (path helpers, MD5 hashing, cache operations)
2. Multi-tier caching (in-memory + disk)
3. Environment switching logic
4. Directory change hooks (zsh `chpwd`, bash `PROMPT_COMMAND`)

### Hook Installation

**File**: `packages/zig/src/shell/integrate.zig`

The `ShellIntegrator` detects the user's shell, locates shell config files, and appends the integration line:

```bash
# Added by pantry
command -v pantry >/dev/null 2>&1 && eval "$(pantry dev:shellcode)"
```

---

## Dependency Detection and Resolution

### Dependency File Detection

**File**: `packages/zig/src/deps/detector.zig`

The `findDepsFile()` function walks up the directory tree searching for dependency files in priority order:

1. `pantry.json` / `pantry.jsonc` (highest priority)
2. `pantry.yaml` / `pantry.yml`
3. `deps.yaml` / `deps.yml` / `dependencies.yaml` / `pkgx.yaml`
4. `config/deps.ts` / `pantry.config.ts` (TypeScript configs, need runtime)
5. `package.json` / `package.jsonc` (npm/bun/yarn compatible)
6. `zig.json`, `Cargo.toml`, `pyproject.toml`, `requirements.txt`, `Gemfile`, `go.mod`, `composer.json`

### Dependency Resolution

**Files**: `packages/zig/src/deps/resolver.zig`, `packages/zig/src/deps/resolution/`

The resolution pipeline:

1. Parse dependency specifications from config files
2. Build a dependency graph (direct + transitive)
3. Resolve version conflicts via `ConflictResolver`
4. Handle peer dependencies via `PeerDependencyManager`
5. Handle optional dependencies via `OptionalDependencyManager`
6. Topological sort for correct installation order
7. Produce/update lockfile via `LockFile`

Overrides (`overrides.zig`) and catalogs (`catalogs.zig`) allow users to customize resolution behavior through `package.json` fields.

---

## Installation Flow

### High-Level Process

```
User runs: pantry install lodash
    |
    +-> main.zig: installAction()
    |   +-> Parse package arguments and options
    |   +-> Load pantry.toml project configuration
    |
    +-> cli/commands/install.zig: installCommandWithOptions()
    |   +-> Detect dependency file
    |   +-> Parse dependencies
    |   +-> Resolve versions via registry
    |   +-> Install each package
    |
    +-> install/installer.zig: Installer
        +-> 1. Check package cache
        +-> 2. Download if not cached (install/downloader.zig)
        +-> 3. Extract archive (install/extractor.zig)
        +-> 4. Create symlinks (install/symlink.zig)
        +-> 5. Generate binary wrappers (install/wrapper.zig)
        +-> 6. Fix macOS library paths (install/libfixer.zig)
        +-> 7. Validate installation (install/validator.zig)
        +-> 8. On failure: rollback (install/rollback.zig)
```

### Parallel Installation

**File**: `packages/zig/src/install/parallel.zig`

Multiple packages are downloaded in parallel with retry logic (`downloadParallelWithRetry`). The `InstallingStack` in `installer.zig` uses a mutex to prevent concurrent installations of the same package.

### Lifecycle Scripts

**File**: `packages/zig/src/lifecycle.zig`

Lifecycle scripts (preinstall, postinstall, etc.) follow a security-first model:

- Scripts are **disabled by default**
- Packages must be in `trustedDependencies` or the built-in trusted list (esbuild, husky, sharp, etc.)
- `--ignore-scripts` flag disables all script execution
- Scripts run with `{modules_dir}/.bin` prepended to PATH (walks up directory tree for monorepo support)

---

## Caching System

### Overview

pantry uses multi-tier caching at both the shell level and the application level.

### Package Cache

**File**: `packages/zig/src/cache/package_cache.zig`

- **Location**: `~/.cache/pantry/binaries/packages/`
- Stores downloaded package archives keyed by domain + version
- Metadata tracked per package (download time, last access, size)
- LRU eviction when cache exceeds configured size

### Environment Cache

**File**: `packages/zig/src/cache/env_cache.zig`

- Maps project directories to their environment directories
- Pipe-delimited format: `project_dir|dep_file|mtime|env_dir`
- Validated on read (checks env dir exists, dep file mtime unchanged)

### Shell-Level Caching

Generated shell code implements three tiers:

- **Tier 1**: In-memory associative array (0 syscalls)
- **Tier 2**: Disk cache file with awk-based lookup (1-3 syscalls)
- **Tier 3**: Filesystem walk fallback

### Optimized Cache

**File**: `packages/zig/src/cache/optimized.zig`

`OptimizedCache` wraps the other caches and provides statistics tracking (`CacheStatistics`). The shared cache (`shared.zig`) enables cross-project cache sharing via `GlobalCache`.

---

## Command Architecture

### CLI Framework

**Framework**: `zig-cli`

**Entry Point**: `packages/zig/src/main.zig`

The `main()` function creates a root `BaseCommand` and attaches subcommands. Each subcommand defines its arguments, options, and action function. Example:

```zig
var install_cmd = try cli.BaseCommand.init(allocator, "install", "Install packages");
_ = try install_cmd.addArgument(
    cli.Argument.init("packages", "Packages to install", .string)
        .withRequired(false)
        .withVariadic(true),
);
_ = try install_cmd.addOption(
    cli.Option.init("global", "global", "Install globally", .bool).withShort('g'),
);
_ = install_cmd.setAction(installAction);
try root.addSubcommand(install_cmd);
```

Action handlers extract arguments/options from the `ParseContext`, call into the library layer (`lib.commands.*`), and exit with the result code.

### Command Categories

**Package Management**: `install`, `add`, `remove`, `update`, `outdated`, `dedupe`

**Package Info**: `list`, `tree`, `why`, `search`, `info`

**Scripts**: `run`, `dev`, `build`, `test`, `px`, `scripts`

**Publishing**: `publish`, `npm:publish`, `publisher:add/list/remove`, `publish-commit`

**Security**: `audit`, `verify`, `sign`, `generate-key`, `oidc setup`

**Project**: `init`, `doctor`, `clean`, `bootstrap`, `link`, `unlink`

**Services**: `services`, `start`, `stop`, `restart`, `status`, `logs`, `enable`, `disable`, `inspect`, `exec`, `snapshot`, `restore`, `snapshots`

**Cache**: `cache:stats`, `cache:clear`, `cache:clean`

**Environment**: `env:list`, `env:inspect`, `env:clean`, `env:remove`, `env` (activate)

**Shell**: `shell:integrate`, `dev:shellcode`

**Shims**: `shim`, `shim:list`, `shim:remove`

---

## Environment Management

### Environment Lifecycle

**Files**: `packages/zig/src/env/manager.zig`, `packages/zig/src/env/scanner.zig`

```

1. PROJECT DETECTION

   -> deps/detector.zig finds dependency file

2. ENVIRONMENT CREATION

   -> Computes environment hash (FNV-1a of project path)
   -> Creates directory: ~/.local/share/pantry/envs/<hash>/

3. DEPENDENCY INSTALLATION

   -> Installs packages to environment directory
   -> Creates binary wrappers in env/bin/

4. CACHE REGISTRATION

   -> Adds entry to environment cache
   -> Maps project directory -> environment directory

5. ENVIRONMENT ACTIVATION (automatic on cd)

   -> Modifies PATH to prioritize environment binaries
   -> Sets environment variables

6. ENVIRONMENT DEACTIVATION (automatic on cd out)

   -> Removes environment paths from PATH
   -> Clears environment variables
```

### Environment Commands

- `env:list` -- List all environments with package counts, sizes, creation dates
- `env:inspect` -- Show detailed environment info (packages, binaries, health)
- `env:clean` -- Remove old/broken environments
- `env:remove` -- Remove specific environment

---

## Service Management

### Architecture

**Files**: `packages/zig/src/services/`

```
User Command: pantry start postgres
    |
    +-> cli/commands/services.zig: startCommand()
    |
    +-> services/manager.zig: ServiceManager.start()
    |   +-> Gets service definition
    |   +-> Generates platform service file if needed
    |   +-> Delegates to platform controller
    |
    +-> services/platform.zig: ServiceController
        +-> macOS: launchd (launchctl)
        +-> Linux: systemd (systemctl --user)
        +-> FreeBSD: rc.d
```

### Service Definitions

**File**: `packages/zig/src/services/definitions.zig` (68+ services)

Each service is a factory function returning a `ServiceConfig` struct:

```zig
pub const ServiceConfig = struct {
    name: []const u8,
    display_name: []const u8,
    description: []const u8,
    start_command: []const u8,
    working_directory: ?[]const u8 = null,
    env_vars: std.StringHashMap([]const u8),
    port: ?u16 = null,
    auto_start: bool = false,
    keep_alive: bool = true,
    health_check: ?[]const u8 = null,
    project_id: ?[]const u8 = null,
};
```

**Supported services include**:

- **Databases**: PostgreSQL, MySQL, MariaDB, MongoDB, Redis, Valkey, InfluxDB, CockroachDB, Neo4j, ClickHouse, CouchDB, Cassandra, SurrealDB, DragonflyDB, TiDB, ScyllaDB, KeyDB, FerretDB, PocketBase
- **Search**: Meilisearch, Elasticsearch, OpenSearch, Typesense, Solr
- **Message Queues**: Kafka, RabbitMQ, Pulsar, NATS, Mosquitto, Redpanda
- **Caching**: Memcached
- **Monitoring**: Prometheus, Grafana, Jaeger, Loki, Alertmanager, VictoriaMetrics
- **Infrastructure**: Vault, Consul, etcd, MinIO, Nomad, Temporal
- **Web/Proxy**: Nginx, Caddy, Apache (httpd), Traefik, HAProxy, Varnish, Envoy
- **Dev Tools**: SonarQube, Jenkins, Verdaccio, Hasura, Keycloak, LocalStack, Gitea, Mailpit, Ollama
- **DNS**: dnsmasq, CoreDNS, Unbound
- **Other**: Zookeeper, PHP-FPM, Syncthing, Tor, Cloudflared, Doppler

Services with Java/Erlang dependencies use `WithContext` variants that resolve `JAVA_HOME`, `PATH`, and package home directories from pantry install locations.

### Platform-Specific Service Files

**macOS (launchd)**: `~/Library/LaunchAgents/com.pantry.<service>.plist`

- Start: `launchctl start com.pantry.<service>`
- Stop: `launchctl stop com.pantry.<service>`

**Linux (systemd)**: `~/.config/systemd/user/<service>.service`

- Start: `systemctl --user start <service>`
- Stop: `systemctl --user stop <service>`

### Service Operations

Beyond start/stop/restart/status, pantry supports:

- `enable/disable` -- Auto-start on boot
- `logs` -- View service logs
- `inspect` -- Detailed service config and status
- `exec` -- Run command in service environment
- `snapshot/restore/snapshots` -- Data snapshotting

---

## Registry

### Server

**File**: `packages/registry/src/server.ts`

A Bun.serve HTTP server with these endpoint groups:

**Package endpoints**:

- `GET /packages/{name}` -- Latest package metadata
- `GET /packages/{name}/{version}` -- Specific version metadata
- `GET /packages/{name}/{version}/tarball` -- Download tarball
- `GET /packages/{name}/versions` -- List all versions
- `GET /search?q={query}` -- Search packages
- `POST /publish` -- Publish package (multipart/form-data)

**Analytics endpoints**:

- `GET /analytics/{name}` -- Download stats
- `GET /analytics/{name}/timeline` -- 30-day download timeline
- `GET /analytics/top` -- Top downloaded packages
- `POST /analytics/events` -- Report analytics events

**Commit publish endpoints** (pkg-pr-new equivalent):

- `POST /publish/commit` -- Publish from a commit
- `GET /commits/{sha}` -- List packages for a commit
- `GET /commits/{sha}/{name}/tarball` -- Download commit tarball

**Zig package endpoints**:

- `GET /zig/packages/{name}` -- Zig package metadata
- `POST /zig/publish` -- Publish Zig package

### Storage Backends

**File**: `packages/registry/src/storage/`

- `s3.ts` -- S3Storage (production) / LocalStorage (development) for tarballs
- `dynamodb-metadata.ts` -- DynamoDB single-table design for metadata (production)
- `metadata.ts` -- FileMetadataStorage for local development
- `dynamodb-client.ts` / `aws-client.ts` -- AWS SDK clients

### Registry Client (Zig)

**Files**: `packages/zig/src/registry/`

The CLI supports multiple registry types: `pantry`, `npm`, `pkgx`, `github`, `custom`. The npm client (`npm.zig`) handles npm-compatible registries. The pantry client (`pantry.zig`) communicates with the Pantry registry server. Custom registries (`custom.zig`) support arbitrary HTTP endpoints with configurable authentication.

---

## Authentication and Security

### OIDC Publishing

**File**: `packages/zig/src/auth/oidc.zig`

Supports passwordless publishing from CI/CD environments using OIDC tokens. The CLI extracts OIDC tokens from GitHub Actions (via `ACTIONS_ID_TOKEN_REQUEST_*` environment variables), validates claims, and exchanges them for registry publish credentials.

### Package Signing

**File**: `packages/zig/src/auth/signing.zig`

Ed25519-based package signing and verification. The `verify` command checks package signatures against a keyring. The `sign` command produces detached signatures.

### Trusted Publishers

**Files**: `packages/zig/src/auth/policy.zig`, `packages/zig/src/auth/provenance.zig`

Policy-based access control for publishing. Trusted publishers are configured per-package and validated against OIDC identity claims (repository, workflow, ref).

### Security Auditing

**File**: `packages/zig/src/cli/commands/audit.zig`

The `audit` command checks installed packages against known vulnerability databases.

---

## File System Layout

### Global Directories

```
~/.pantry/
  global/
    bin/                  Binary wrappers/shims
    packages/             Installed packages
      <domain>/
        v<version>/
    lib/                  Symlinked libraries
    include/              Symlinked headers

~/.local/share/pantry/
  envs/                   Project-specific environments
    <project_hash>/
      bin/
      packages/
      lib/
  data/                   Service data
    postgres/
    redis/
    ...
  scripts/                Service startup scripts

~/.cache/pantry/
  binaries/
    packages/             Downloaded package archives
  shell_cache/
    env_cache             Project -> env mapping

~/Library/LaunchAgents/   macOS service plists
  com.pantry._.plist

~/.config/systemd/user/   Linux service units
  _.service
```

### Project Configuration

**pantry.toml** (project-level settings):

```toml
[install]
peer = false
production = false
linker = "isolated"      # "isolated" or "hoisted"
modules_dir = "pantry"   # default install directory name
```

**pantry.json**/**package.json** (dependencies):

```json
{
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  },
  "trustedDependencies": [
    "esbuild"
  ]
}
```

---

## Cross-Platform Considerations

### Platform Detection

**File**: `packages/zig/src/core/platform.zig`

Compile-time platform and architecture detection via `builtin.os.tag` and `builtin.cpu.arch`. Supports:

- **Platforms**: darwin (macOS), linux, windows, freebsd
- **Architectures**: x86_64, aarch64

### Platform-Specific Behavior

**macOS**:

- Library path fixing via `install_name_tool` (`install/libfixer.zig`)
- Uses `DYLD_LIBRARY_PATH` / `DYLD_FALLBACK_LIBRARY_PATH`
- Services via launchd (`~/Library/LaunchAgents/`)

**Linux**:

- Uses `LD_LIBRARY_PATH`
- Services via systemd user units (`~/.config/systemd/user/`)

**FreeBSD**:

- Services via rc.d (`~/.config/pantry/services/`)

---

**Maintained by**: pantry Team
**Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)
**License**: MIT
