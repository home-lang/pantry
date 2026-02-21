# Basic Usage

pantry provides a simple yet powerful command-line interface for managing packages and development environments. This guide covers the most common operations.

## Command Overview

Here are the main commands available in pantry:

| Command | Description |
|---------|-------------|
| `install` or `i` | Install packages |
| `update`, `upgrade`, `up` | Update packages to newer versions |
| `remove` | Remove specific packages |
| `shim` | Create shims for packages |
| `dev:on` | Activate dev environment in directory |
| `dev:dump` | Generate environment setup script for a project |
| `dev:shellcode` | Generate shell integration code |
| `service:start` | Start one or more services (or a group) |
| `service:stop` | Stop one or more services (or a group) |
| `service:restart` | Restart one or more services (or a group) |
| `service:status` | Check status of a service |
| `service:list` | List all available services and their status |
| `service:logs` | View service logs (`--follow` / `-f` for live tail) |
| `service:enable` | Enable service for auto-start |
| `service:disable` | Disable service auto-start |
| `bun` | Install Bun runtime directly |
| `zsh` | Install Zsh shell |
| `bootstrap` | Install all essential tools at once |
| `list` | List installed packages |
| `uninstall` | Complete removal of pantry and all packages |
| `env:list` | List all development environments |
| `env:clean` | Clean up unused development environments |
| `env:inspect` | Inspect a specific development environment |
| `env:remove` | Remove a specific development environment |
| `cache:stats` | Show cache statistics and usage information |
| `cache:clean` | Clean up old cached packages |
| `cache:clear` | Clear all cached packages and downloads |
| `clean` | Remove all pantry-installed packages and environments (use `--keep-global` to preserve global dependencies) |
| `version` | Show version information |
| `help` | Display help information |

## Installing Packages

Install one or more packages using the `install` or `i` command:

```bash
# Install a single package (defaults to /usr/local for system-wide)
pantry install node@22

# Install multiple packages
pantry install python@3.12 ruby@3.3

# Short form
pantry i go

# Install to a specific location
pantry install --path ~/my-packages node
```

### Installation Locations

pantry follows the pkgm philosophy for installation paths, **never installing to Homebrew's directories**:

- **System-wide installation** (default): `/usr/local` - Used when you have write permissions
- **User-specific installation**: `~/.local` - Used automatically when `/usr/local` is not writable
- **Custom path**: Use `--path <path>` to specify any installation directory

> **Important**: pantry follows the pkgm approach and**never installs to `/opt/homebrew`** (Homebrew's directory). This ensures clean separation from Homebrew-managed packages and follows the traditional Unix philosophy of using `/usr/local` for system-wide installations.

```bash
# Examples of different installation methods
pantry install node                    # Installs to /usr/local (default if writable)
pantry install node --path /opt/tools  # Custom directory
pantry install node --path ~/.local    # Force user directory
```

**Permission Handling**: When installing to `/usr/local` without sufficient permissions, pantry will:

- Detect the permission issue
- Prompt you interactively (if in a terminal)
- Offer to re-run with `sudo` automatically
- Fall back to `~/.local` if you decline sudo

## Package Installation

Install packages using the standard install command:

```bash
# Install packages
pantry install node@22 python@3.12 git

# pantry uses the pkgx registry through ts-pkgx for package installation
```

## Updating Packages

Keep your packages up-to-date with pantry's intelligent update system:

```bash
# Update all installed packages
pantry update

# Update specific packages
pantry update node python

# Use aliases for convenience
pantry upgrade bun
pantry up node python
```

### Update Options

Control update behavior with various options:

```bash
# Preview what would be updated
pantry update --dry-run

# Force update to latest versions (ignore constraints)
pantry upgrade bun --latest

# Verbose output showing update details
pantry update --verbose node

# Update multiple packages with latest flag
pantry up node python --latest
```

### Update Behavior

pantry's update system provides:

- **Smart version checking**: Only updates when newer versions are available
- **Helpful messages**: Provides installation instructions for uninstalled packages
- **Safe previews**: Use `--dry-run` to see what would be updated
- **Latest flag**: Force updates to latest versions with `--latest`
- **Multiple aliases**: Use `update`, `upgrade`, or `up` commands interchangeably

### Update Examples

```bash
# Check and update all packages
pantry update

# Update Node.js to latest version
pantry upgrade node --latest

# Preview updates for specific packages
pantry up bun python --dry-run

# Update with verbose output for debugging
pantry update --verbose --latest node
```

## Removing Packages

Remove specific packages while keeping the rest of your pantry setup intact:

```bash
# Remove a single package
pantry remove python

# Remove multiple packages
pantry remove node python ruby

# Remove a specific version
pantry remove node@22

# Preview what would be removed without actually removing it
pantry remove python --dry-run

# Remove without confirmation prompts
pantry remove python --force

# Remove with verbose output showing all files
pantry remove python --verbose
```

The `remove` command intelligently finds and removes:

- Binaries from `bin/` and `sbin/` directories
- Package-specific directories
- Associated shims
- Symlinks pointing to the package

## Development Environment Management

pantry provides powerful project-specific environment management with automatic activation and comprehensive management tools.

### Auto-Activation with Shell Integration

Set up shell integration to automatically activate environments when entering project directories:

```bash
# Add to your shell configuration
echo 'eval "$(pantry dev:shellcode)"' >> ~/.zshrc

# Reload your shell
source ~/.zshrc
```

Once set up, environments automatically activate when you enter a directory with dependency files:

```bash
cd my-project/  # → Automatically activates environment
# ✅ Environment activated for /path/to/my-project
cd ../          # → Automatically deactivates
# Environment deactivated
```

Hook lifecycle during activation:

- preSetup (before installs/services)
- postSetup (after environment is prepared)
- preActivation (after installs/services, before activation message)
- postActivation (immediately after activation message)

Define hooks in `pantry.config.ts` or inline in `deps.yaml` (see Configuration → Lifecycle Hooks).

::: tip Prompt Compatibility
If you use **Starship prompt** and see timeout warnings like `[WARN] - (starship::utils): Executing command timed out`, add `command_timeout = 5000` to the top of your `~/.config/starship.toml` file. This gives Starship enough time to detect tool versions from pantry-managed binaries. See [Troubleshooting](./troubleshooting.md#starship-prompt-timeout-warnings) for details.
:::

### Manual Environment Commands

```bash
# Activate dev environment for current directory
pantry dev:on

# Activate dev environment for specific directory
pantry dev:on /path/to/project

# Generate environment script for current directory
pantry dev:dump

# Generate environment script for specific directory
pantry dev:dump /path/to/project

# Preview packages without generating script
pantry dev:dump --dryrun

# Generate script with verbose output
pantry dev:dump --verbose
```

### Customizing Shell Messages

You can customize or disable the shell activation/deactivation messages:

```bash
# Disable all messages
export pantry_SHOW_ENV_MESSAGES=false

# Custom activation message (use {path} for project path)
export pantry_SHELL_ACTIVATION_MESSAGE="🚀 Development environment ready: {path}"

# Custom deactivation message
export pantry_SHELL_DEACTIVATION_MESSAGE="👋 Environment deactivated"
```

Or configure in your `pantry.config.ts`:

```ts
export default {
  showShellMessages: true,
  shellActivationMessage: '🔧 Environment loaded for {path}',
  shellDeactivationMessage: '🔒 Environment closed'
}
```

### Project-Specific Dependencies

Create a `dependencies.yaml` file in your project:

```yaml
dependencies:

  - node@22
  - python@3.12
  - gnu.org/wget@1.21

env:
  NODE_ENV: development
  PROJECT_NAME: my-awesome-project
```

#### Global Installation Flag

Control where packages are installed with the `global` flag:

**Individual Package Global Flags:**

```yaml
# dependencies.yaml
dependencies:
# Install globally (system-wide)
  node@22:
    version: 22.1.0
    global: true

# Install locally (project-specific)
  typescript@5.0:
    version: 5.0.4
    global: false

# String format defaults to local installation

  - eslint@8.50

env:
  NODE_ENV: development
```

**Top-Level Global Flag:**

```yaml
# dependencies.yaml
global: true  # Apply to all dependencies
dependencies:

  - node@22
  - python@3.12
  - git@2.42

# Override for specific packages
  typescript@5.0:
    version: 5.0.4
    global: false  # Install locally despite top-level global: true

env:
  NODE_ENV: development
```

**Global Flag Behavior:**

- `global: true` - Installs to `/usr/local` (or configured global path)
- `global: false` - Installs to project-specific directories (default)
- Individual package flags override top-level `global` setting
- String format dependencies default to local installation

Supported dependency file formats:

- `dependencies.yaml` / `dependencies.yml`
- `pkgx.yaml` / `pkgx.yml`
- `.pkgx.yaml` / `.pkgx.yml`
- `.pantry.yaml` / `pantry.yaml`
- `.pantry.yml` / `pantry.yml`
- `deps.yml` / `deps.yaml`
- `.deps.yml` / `.deps.yaml`

### Environment Isolation

Each project gets its own isolated environment:

- Project-specific installation directory: `~/.local/share/pantry/envs/<project>_<hash>-d<dep_hash>`
- Isolated PATH and environment variables
- Binary stubs with environment isolation
- Automatic cleanup when leaving project directory

## Service Management

pantry provides comprehensive service management for development services like databases, web servers, and infrastructure tools. See the [Service Management](./features/service-management.md) documentation for complete details.

### Quick Service Examples

```bash
# Start a database
pantry service start postgres

# Start a service group (all databases)
pantry service start db

# Check service status
pantry service status postgres

# View service logs
pantry service logs postgres --follow

# List all services
pantry service list

# Stop services
pantry service stop postgres redis
```

### Available Services

pantry includes 68 pre-configured services:

**Databases (22)**: PostgreSQL, MySQL, MariaDB, MongoDB, Redis, Valkey, KeyDB, DragonflyDB, Elasticsearch, OpenSearch, InfluxDB, CockroachDB, Neo4j, ClickHouse, Memcached, CouchDB, Cassandra, SurrealDB, Typesense, FerretDB, TiDB, ScyllaDB
**Web Servers (3)**: Nginx, Caddy, Apache httpd
**Search (2)**: Apache Solr, Apache Zookeeper
**Message Queues (6)**: Kafka, RabbitMQ, Apache Pulsar, NATS, Mosquitto, Redpanda
**Monitoring (6)**: Prometheus, Grafana, Jaeger, Loki, Alertmanager, VictoriaMetrics
**Proxy & Load Balancers (4)**: Traefik, HAProxy, Varnish, Envoy
**Infrastructure (7)**: Vault, Consul, Nomad, etcd, MinIO, SonarQube, Temporal
**Dev & CI/CD (6)**: Jenkins, LocalStack, Verdaccio, Gitea, Mailpit, Ollama
**API & Backend (2)**: Hasura, Keycloak
**Application Servers (2)**: PHP-FPM, PocketBase
**DNS & Network (3)**: dnsmasq, CoreDNS, Unbound
**Tunnels & Secrets (2)**: Cloudflared, Doppler
**Other**: Syncthing, Tor

Each service includes:

- Per-service health checks for readiness detection
- Log viewing (`pantry service logs <service>`)
- Cross-platform support (macOS/Linux)
- Service groups for batch operations (`db`, `monitoring`, `queue`, `web`)
- Custom service definitions in `deps.yaml`

## Environment Management

pantry provides comprehensive tools for managing development environments with human-readable identifiers.

### Listing Environments

View all your development environments:

```bash
# List all environments in a table format
pantry env:list

# Show detailed information including hashes
pantry env:list --verbose

# Output as JSON for scripting
pantry env:list --format json

# Simple format for quick overview
pantry env:list --format simple
```

**Example Output:**

```
📦 Development Environments:

│ Project         │ Packages │ Binaries │ Size     │ Created      │
├───────────────────────────────────────────────────────────────┤
│ final-project   │ 2        │ 2        │ 5.0M     │ 5/30/2025    │
│ working-test    │ 3        │ 20       │ 324M     │ 5/30/2025    │
│ dummy           │ 1        │ 1        │ 1.1M     │ 5/30/2025    │
└───────────────────────────────────────────────────────────────┘

Total: 3 environment(s)
```

### Inspecting Environments

Get detailed information about a specific environment:

```bash
# Basic inspection
pantry env:inspect working-test_208a31ec

# Detailed inspection with directory structure
pantry env:inspect final-project_7db6cf06 --verbose

# Show binary stub contents
pantry env:inspect dummy_6d7cf1d6 --show-stubs
```

### Cleaning Up Environments

Automatically clean up unused or failed environments:

```bash
# Preview what would be cleaned
pantry env:clean --dry-run

# Clean environments older than 30 days (default)
pantry env:clean

# Clean environments older than 7 days
pantry env:clean --older-than 7

# Force cleanup without confirmation
pantry env:clean --force

# Verbose cleanup with details
pantry env:clean --verbose
```

### Removing Specific Environments

Remove individual environments by their hash:

```bash
# Remove with confirmation
pantry env:remove dummy_6d7cf1d6

# Force removal without confirmation
pantry env:remove minimal_3a5dc15d --force

# Verbose removal showing details
pantry env:remove working-test_208a31ec --verbose
```

### Environment Hash Format

pantry uses human-readable hash identifiers for environments:

**Format:** `{project-name}_{8-char-hex-hash}`

**Examples:**

- `final-project_7db6cf06` - Environment for "final-project"
- `working-test_208a31ec` - Environment for "working-test"
- `my-app_1a2b3c4d` - Environment for "my-app"

## Updating Dependencies

### Updating Dependencies

To update dependencies in your project, edit your dependency file (e.g. `deps.yaml` / `dependencies.yaml`) and then reactivate the environment:

```bash
# Edit your dependency file
# Change: node@22 -> node@23 (or bun.sh: 1.2.19 -> 1.2.20)

# Reactivate the environment (new env_dir is selected automatically)
cd .. && cd my-project

# Optional: inspect selection decisions
export PANTRY_VERBOSE=true
cd my-project
# 🔍 Env target: env_dir=… dep_file=… dep_hash=…
# 🔍 Cache check: dep=… dep_mtime=… cache_mtime=… fp_match=yes|no
```

## Bootstrap Setup

For first-time setup or fresh installations, use the bootstrap command:

### Quick Setup

Get everything you need with one command:

```bash
# Install all essential tools (defaults to /usr/local if writable, ~/.local otherwise)
pantry bootstrap

# Verbose bootstrap showing all operations
pantry bootstrap --verbose

# Force reinstall everything
pantry bootstrap --force
```

### Customized Bootstrap

Control what gets installed:

```bash
# Skip specific components
pantry bootstrap --skip-shell-integration

# Custom installation path (override default /usr/local)
pantry bootstrap --path ~/.local

# Disable automatic PATH modification
pantry bootstrap --no-auto-path
```

## Cache Management

pantry caches downloaded packages to improve performance. Use these commands to manage cache storage:

### View Cache Statistics

Check cache size and usage information:

```bash
# Show cache statistics
pantry cache:stats

# Example output
# 📊 Cache Statistics
#
# 📦 Cached Packages: 5
# 💾 Total Size: 142.3 MB
# 📅 Oldest Access: 12/15/2024
# 📅 Newest Access: 12/28/2024
```

### Clean Old Cache Entries

Remove old cached packages based on age or size:

```bash
# Clean packages older than 30 days (default)
pantry cache:clean

# Clean packages older than 7 days
pantry cache:clean --max-age 7

# Clean if cache exceeds 2GB
pantry cache:clean --max-size 2

# Preview what would be cleaned
pantry cache:clean --dry-run

# Clean with custom criteria
pantry cache:clean --max-age 14 --max-size 1
```

### Clear All Cache

Remove all cached packages and downloads:

```bash
# Preview what would be cleared
pantry cache:clear --dry-run

# Clear cache with confirmation
pantry cache:clear

# Clear cache without confirmation
pantry cache:clear --force

# Clear with verbose output
pantry cache:clear --verbose --force
```

**Note:** You can also use `cache:clean` as an alias for `cache:clear`.

### Complete System Cleanup

Remove all pantry-installed packages, environments, and optionally cache:

```bash
# Preview complete cleanup
pantry clean --dry-run

# Complete cleanup (removes everything)
pantry clean --force

# Clean packages but keep cache for faster reinstalls
pantry clean --keep-cache --force

# Clean but preserve global dependencies
pantry clean --keep-global --force

# Clean with verbose output
pantry clean --verbose --force

# Combine options for selective cleanup
pantry clean --keep-global --keep-cache --force
```

The `clean` command removes:

- All installed packages and their metadata
- Project-specific environments
- Cache directory (unless `--keep-cache` is used)
- Binary stubs and symlinks

#### Preserving Global Dependencies

Use the `--keep-global` option to preserve essential global dependencies defined in your global `deps.yaml` files:

```bash
# Safe cleanup that preserves global tools
pantry clean --keep-global --force

# Preview what would be preserved
pantry clean --keep-global --dry-run
```

**Global dependency detection**: pantry automatically detects any dependency file (`deps.yaml`, `dependencies.yaml`, etc.) with `global: true`

**Global dependency formats**:

```yaml
# Top-level global flag (all dependencies are global)
global: true
dependencies:
  bun.sh: ^1.2.16
  gnu.org/bash: ^5.2.37
  starship.rs: ^1.23.0

# Individual package global flags
dependencies:
  bun.sh:
    version: ^1.2.16
    global: true
  python.org:
    version: ^3.11.0
    global: false  # Will be removed during cleanup
```

This prevents accidental removal of essential system tools like shells, package managers, and other critical utilities that you rely on globally.

## Complete System Cleanup

For complete removal of pantry and all installed packages:

```bash
# Remove everything with confirmation
pantry uninstall

# Preview what would be removed
pantry uninstall --dry-run

# Remove everything without prompts
pantry uninstall --force

# Remove only packages but keep shell integration
pantry uninstall --keep-packages
```

The `uninstall` command removes:

- All installed packages and their files
- Installation directories (`bin/`, `sbin/`, `pkgs/`)
- Shell integration from `.zshrc`, `.bashrc`, etc.
- Shim directories
- Project-specific environment directories
- Provides guidance for manual PATH cleanup

## Creating Shims

Shims are lightweight executable scripts that point to the actual binaries. They allow you to run commands without having to modify your PATH for each package:

```bash
# Create shims for a package
pantry shim node

# Create shims with a custom path
pantry shim --path ~/bin typescript

# Create shims without auto-adding to PATH
pantry shim node --no-auto-path
```

## Bootstrap Setup

Bootstrap your development environment with everything you need:

```bash
# Bootstrap essential tools and environment
pantry bootstrap

# Force reinstall components
pantry bootstrap --force

# Install to specific path
pantry bootstrap --path ~/bin
```

## Installing Bun

pantry provides a dedicated command for installing Bun directly from GitHub releases:

```bash
# Install latest Bun version
pantry bun

# Install specific version
pantry bun --version 1.0.0

# Specify installation path
pantry bun --path ~/bin
```

The `bun` command automatically detects your platform, downloads the appropriate binary, and adds it to your PATH.

## Installing Zsh

pantry provides a dedicated command for installing the Zsh shell:

```bash
# Install zsh
pantry zsh

# Force reinstall
pantry zsh --force

# Specify installation path
pantry zsh --path ~/bin
```

After installation, pantry provides instructions for making zsh your default shell:

```bash
# Make zsh your default shell
chsh -s /path/to/installed/zsh
```

## Checking for Updates

Keep your packages up-to-date:

```bash
# Check for outdated packages
pantry outdated

# Update all packages to latest versions
pantry update

# Update specific packages
pantry update node python
```

## Listing Installed Packages

View what packages are currently installed:

```bash
# List all installed packages
pantry list
```

## Common Options

Most commands support these options:

| Option | Description |
|--------|-------------|
| `--verbose` | Enable detailed logging |
| `--path` | Specify installation/shim path |
| `--force` | Force reinstall/removal even if already installed/not found |
| `--dry-run` | Preview changes without actually performing them |
| `--keep-global` | Preserve global dependencies during cleanup operations |
| `--keep-cache` | Keep cached downloads during cleanup operations |
| `--no-auto-path` | Don't automatically add to PATH |
| `--sudo` | Use sudo for installation (if needed) |
| `--quiet` | Suppress status messages |

## Package Management Best Practices

### Understanding Installation Philosophy

pantry follows a clean package management approach _(similar to pkgm)_:

- **Never uses Homebrew directories** (`/opt/homebrew`)
- **Prefers `~/.local`** for user-specific installations (safest approach)
- **Falls back to `/usr/local`** for system-wide installations when explicitly requested
- **Maintains clean separation** from other package managers

### Using Environment Isolation

pantry automatically provides environment isolation for each project:

```bash
# Each project gets its own environment
cd project-a/    # → Uses node@20, python@3.11
cd ../project-b/ # → Uses node@22, python@3.12
```

### Choosing Between Remove and Uninstall

- Use `remove` when you want to uninstall specific packages while keeping your pantry setup
- Use `uninstall` when you want to completely remove pantry and start fresh

### Using Dry-Run Mode

Always preview major changes before executing them:

```bash
# Preview package removal
pantry remove python --dry-run

# Preview complete system cleanup
pantry uninstall --dry-run

# Preview environment setup
pantry dev:dump --dryrun
```

### Version Management

Remove specific versions while keeping others:

```bash
# List installed packages to see versions
pantry list

# Remove only a specific version
pantry remove node@20

# Keep node@22 installed
```

## Using PATH Integration

By default, pantry automatically adds shim directories to your PATH. You can disable this behavior:

```bash
pantry shim node --no-auto-path
```

## Working with Dependencies

### Dependency File Formats

pantry supports multiple dependency file formats:

```yaml
# dependencies.yaml
dependencies:

  - node@22
  - python@3.12

env:
  NODE_ENV: development
  API_URL: https://api.example.com
```

### Environment Variables

Set project-specific environment variables:

```yaml
dependencies:

  - node@22

env:
  NODE_ENV: production
  DATABASE_URL: postgresql://localhost/myapp
  API_KEY: your-api-key-here
```

### Complex Dependencies

Handle complex package specifications:

```yaml
dependencies:

  - gnu.org/wget@^1.21
  - curl.se@~8.0
  - python.org@>=3.11

env:
  PATH_EXTENSION: /custom/bin
  PYTHON_PATH: /opt/custom/python
```

## Getting Help

For detailed information about any command:

```bash
pantry help
pantry <command> --help
```

## Troubleshooting

### Environment Not Activating

If automatic environment activation isn't working:

1. Ensure shell integration is set up:

   ```bash
   echo 'eval "$(pantry dev:shellcode)"' >> ~/.zshrc
   source ~/.zshrc
   ```

2. Check for dependency files in your project directory
3. Verify the dependency file syntax is correct

### Package Installation Failures

If packages fail to install:

1. Check your internet connection
2. Verify the package name and version exist
3. Try with verbose output: `pantry install --verbose package-name`
4. Check if you have write permissions to the installation directory

### Permission Issues

If you encounter permission errors:

1. pantry will automatically prompt for sudo when installing to `/usr/local`
2. Install to user directory: `--path ~/.local`
3. Check directory permissions

### Shell Integration Issues

If shell integration isn't working:

1. Verify your shell is supported (bash or zsh)
2. Check that the shell integration code was added correctly
3. Reload your shell configuration
4. Try generating new shell code: `pantry dev:shellcode`
5. Check if shell messages are disabled: `echo $pantry_SHOW_ENV_MESSAGES`

### Shell Message Issues

If you're not seeing environment messages:

1. Check if messages are disabled:

   ```bash
   echo $pantry_SHOW_ENV_MESSAGES
   ```

2. Re-enable messages:

   ```bash
   export pantry_SHOW_ENV_MESSAGES=true
   ```

3. Check your configuration file for `showShellMessages: false`
