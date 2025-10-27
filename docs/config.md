# Configuration

Launchpad can be configured using a configuration file or through command-line options. This guide explains all available configuration options and how to use them.

## Configuration File

Launchpad looks for configuration in these locations (in order of precedence):

1. `launchpad.config.ts` or `launchpad.config.js` in the current directory
2. `~/.launchpadrc` or `~/.config/launchpad/config.json` in your home directory

Example configuration file (`launchpad.config.ts`):

```ts
import type { LaunchpadConfig } from '@stacksjs/launchpad'
import os from 'node:os'
import path from 'node:path'

const config: LaunchpadConfig = {
  // Enable verbose logging (default: false)
  verbose: true,

  // Path where binaries should be installed
  // (default: /usr/local if writable, ~/.local otherwise)
  installationPath: '/usr/local',

  // Password for sudo operations, loaded from .env SUDO_PASSWORD (default: '')
  sudoPassword: '',

  // Whether to enable dev-aware installations (default: true)
  devAware: true,

  // Max installation retries on failure (default: 3)
  maxRetries: 3,

  // Timeout for pkgx operations in milliseconds (default: 60000)
  timeout: 60000,

  // Whether to symlink versions (default: true)
  symlinkVersions: true,

  // Whether to force reinstall if already installed (default: false)
  forceReinstall: false,

  // Update behavior configuration
  // Whether to check for updates on package operations (default: true)
  checkUpdates: true,

  // Whether to prompt before updating packages (default: true)
  promptBeforeUpdate: true,

  // Default path for shims (default: ~/.local/bin)
  shimPath: path.join(os.homedir(), '.local', 'bin'),

  // Whether to automatically add shim path to the system PATH (default: true)
  autoAddToPath: true,

  // Shell Environment Message Configuration
  // Whether to show shell environment activation messages (default: true)
  showShellMessages: true,

  // Custom message to show when environment is activated
  // Use {path} placeholder to include the project path (default: "✅ Environment activated for {path}")
  shellActivationMessage: '✅ Environment activated for {path}',

  // Custom message to show when environment is deactivated (default: "Environment deactivated")
  shellDeactivationMessage: 'Environment deactivated',

  // Service Management Configuration
  services: {
    // Enable service management functionality (default: true)
    enabled: true,

    // Default services data directory (default: ~/.local/share/launchpad/services)
    dataDir: path.join(os.homedir(), '.local', 'share', 'launchpad', 'services'),

    // Default services log directory (default: ~/.local/share/launchpad/logs)
    logDir: path.join(os.homedir(), '.local', 'share', 'launchpad', 'logs'),

    // Default services configuration directory (default: ~/.local/share/launchpad/services/config)
    configDir: path.join(os.homedir(), '.local', 'share', 'launchpad', 'services', 'config'),

    // Auto-restart failed services (default: true)
    autoRestart: true,

    // Service startup timeout in seconds (default: 30)
    startupTimeout: 30,

    // Service shutdown timeout in seconds (default: 10)
    shutdownTimeout: 10,

    // Database configuration for services
    database: {
      // Default database username (default: 'root')
      username: 'root',

      // Default database password (default: 'password')
      password: 'password',

      // Database authentication method for local connections (default: 'trust')
      authMethod: 'trust', // 'trust' | 'md5' | 'scram-sha-256'
    },
  },
}

export default config
```

JavaScript format (`.launchpadrc`):

```json
{
  "verbose": true,
  "installationPath": "/usr/local",
  "sudoPassword": "",
  "devAware": true,
  "maxRetries": 3,
  "timeout": 60000,
  "symlinkVersions": true,
  "forceReinstall": false,
  "checkUpdates": true,
  "promptBeforeUpdate": true,
  "shimPath": "~/.local/bin",
  "autoAddToPath": true,
  "showShellMessages": true,
  "shellActivationMessage": "✅ Environment activated for {path}",
  "shellDeactivationMessage": "Environment deactivated",
  "services": {
    "enabled": true,
    "dataDir": "~/.local/share/launchpad/services",
    "logDir": "~/.local/share/launchpad/logs",
    "configDir": "~/.local/share/launchpad/services/config",
    "autoRestart": true,
    "startupTimeout": 30,
    "shutdownTimeout": 10,
    "database": {
      "username": "root",
      "password": "password",
      "authMethod": "trust"
    }
  }
}
```

## Database Configuration

Launchpad provides configurable database credentials for all database services. This allows you to customize authentication while maintaining secure defaults.

### Configuration Options

Database credentials can be configured through environment variables or configuration files:

#### Environment Variables

```bash
# Database username (default: 'root')
export LAUNCHPAD_DB_USERNAME="myuser"

# Database password (default: 'password')
export LAUNCHPAD_DB_PASSWORD="mypassword"

# Database authentication method (default: 'trust')
export LAUNCHPAD_DB_AUTH_METHOD="md5"  # 'trust' | 'md5' | 'scram-sha-256'
```

#### Configuration File

```ts
// launchpad.config.ts
const config: LaunchpadConfig = {
  services: {
    database: {
      username: 'myuser',
      password: 'mypassword',
      authMethod: 'md5'  // 'trust' | 'md5' | 'scram-sha-256'
    }
  }
}
```

### Supported Services

These database configurations apply to:

- **PostgreSQL** - Uses all three options (username, password, authMethod)
- **MySQL** - Uses username and password
- **Other databases** - Future database services will adopt these standards

### Authentication Methods (PostgreSQL)

| Method | Description | Use Case |
|--------|-------------|----------|
| `trust` | No password required for local connections | Development (default) |
| `md5` | MD5-hashed password authentication | Basic production setup |
| `scram-sha-256` | Modern SCRAM-SHA-256 authentication | Secure production environments |

### Template Variables

Services use these configurable template variables:

- `{dbUsername}` - Resolves to configured username
- `{dbPassword}` - Resolves to configured password
- `{authMethod}` - Resolves to configured auth method
- `{projectDatabase}` - Resolves to project name

### Examples

#### Development Setup (Default)

```bash
# Uses: username=root, password=password, authMethod=trust
launchpad start postgres
```

#### Custom Development Setup

```bash
export LAUNCHPAD_DB_USERNAME="dev_user"
export LAUNCHPAD_DB_PASSWORD="dev_password"
launchpad start postgres
```

#### Production-like Setup

```bash
export LAUNCHPAD_DB_AUTH_METHOD="md5"
export LAUNCHPAD_DB_PASSWORD="secure_password123"
launchpad start postgres
```

### Security Considerations

1. **Development**: Default `trust` auth is suitable for local development
2. **Production**: Use `md5` or `scram-sha-256` with strong passwords
3. **Environment Variables**: Store sensitive credentials in `.env` files
4. **Version Control**: Never commit passwords in configuration files

## Dependency File Configuration

Launchpad supports flexible dependency configuration with global installation options:

### Basic Dependency Format

```yaml
# dependencies.yaml
dependencies:
  - node@22
  - python@3.12

env:
  NODE_ENV: development
```

### Global Installation Configuration

Control whether packages are installed globally or locally with the `global` flag:

#### Individual Package Global Flags

```yaml
# dependencies.yaml
dependencies:
  node@22:
    version: 22.1.0
    global: true # Install to /usr/local
  python@3.12:
    version: 3.12.1
    global: false # Install to project directory
  # String format defaults to local installation
  - typescript@5.0
```

#### Top-Level Global Flag

Apply global installation to all dependencies:

```yaml
# dependencies.yaml
global: true # All packages install globally unless overridden
dependencies:
  - node@22
  - python@3.12
  - bun@1.2.3
  typescript@5.0:
    version: 5.0.4
    global: false # Override: install locally for this project
```

#### Global Flag Precedence

The precedence order for global installation flags:

1. **Individual package `global` flag** (highest priority)
2. **Top-level `global` flag**
3. **Default behavior** (project-local installation)

```yaml
# Example showing precedence
global: true # Top-level: install globally
dependencies:
  - node@22 # Uses top-level: global=true
  - python@3.12 # Uses top-level: global=true
  bun@1.2.3:
    version: 1.2.3
    global: false # Override: local installation
  typescript@5.0:
    version: 5.0.4 # Uses top-level: global=true
```

### Installation Behavior

- **Global packages** (`global: true`): Installed to `/usr/local` (or user-configured global path)
- **Local packages** (`global: false` or default): Installed to project-specific directories
- **Mixed installations**: You can have both global and local packages in the same project

### Global Dependencies and Cleanup

When using the `launchpad clean` command, you can preserve global dependencies to avoid accidentally removing essential system tools:

```bash
# Safe cleanup that preserves global dependencies
launchpad clean --keep-global --force

# Preview what would be preserved
launchpad clean --keep-global --dry-run
```

**Global dependency detection**:

- Any dependency file (`deps.yaml`, `dependencies.yaml`, etc.) with `global: true`

**Example global dependency file** (`~/.dotfiles/deps.yaml`):

```yaml
global: true
dependencies:
  bun.sh: ^1.2.16
  gnu.org/bash: ^5.2.37
  gnu.org/grep: ^3.12.0
  starship.rs: ^1.23.0
  cli.github.com: ^2.73.0
```

This ensures that essential tools like shells, package managers, and system utilities are preserved during cleanup operations, preventing system breakage.

### Service Management in dependencies.yaml

Define services that should automatically start for your project:

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
    - postgres
    - redis
```

Behavior:

- **enabled**: toggles service management for the project.
- **autoStart**: array of service names to start automatically on environment activation.
- Service names must match those in the Supported Services list (e.g. `postgres`, `redis`, `nginx`).

#### Inference shorthand

You can enable a shorthand for framework-based projects (e.g., Laravel) to infer services automatically:

```yaml
# deps.yaml
dependencies:
  php: ^8.4.11
  postgres: ^17.2.0
  redis: ^8.0.4

services:
  infer: true
```

When enabled and a Laravel app is detected (`artisan` present), Launchpad will read `.env` and infer services:

- `DB_CONNECTION=pgsql` → `postgres`
- `DB_CONNECTION=mysql|mariadb` → `mysql`
- `CACHE_DRIVER=redis` or `CACHE_STORE=redis` → `redis`
- `CACHE_DRIVER=memcached` or `CACHE_STORE=memcached` → `memcached`

Environment toggles:

- `LAUNCHPAD_FRAMEWORKS_ENABLED` (default: true)
- `LAUNCHPAD_SERVICES_INFER` (default: true)
- `LAUNCHPAD_LARAVEL_ENABLED` (default: true)

## Configuration Options

### General Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `verbose` | boolean | `false` | Enable detailed logging |
| `installationPath` | string | `/usr/local` or `~/.local` | Path where packages should be installed |
| `shimPath` | string | `~/.local/bin` | Path where shims should be created |

### Installation Behavior

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `devAware` | boolean | `true` | Enable dev-aware installations |
| `maxRetries` | number | `3` | Maximum retries for installation |
| `timeout` | number | `60000` | Timeout for operations in milliseconds |
| `symlinkVersions` | boolean | `true` | Whether to symlink versions |
| `forceReinstall` | boolean | `false` | Force reinstallation even if already installed |
| `checkUpdates` | boolean | `true` | Whether to check for updates on package operations |
| `promptBeforeUpdate` | boolean | `true` | Whether to prompt before updating packages |

### Authentication & Security

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sudoPassword` | string | `""` | Password for sudo operations, can be loaded from `SUDO_PASSWORD` environment variable |

### Shell Environment Messages

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showShellMessages` | boolean | `true` | Whether to display environment activation/deactivation messages |
| `shellActivationMessage` | string | `"✅ Environment activated for {path}"` | Custom message shown when environment is activated. Use `{path}` placeholder for project path |
| `shellDeactivationMessage` | string | `"Environment deactivated"` | Custom message shown when environment is deactivated |

### Path Management

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoAddToPath` | boolean | `true` | Automatically add shim directories to PATH |

### Service Management

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `services.enabled` | boolean | `true` | Enable service management functionality |
| `services.dataDir` | string | `~/.local/share/launchpad/services` | Default services data directory |
| `services.logDir` | string | `~/.local/share/launchpad/logs` | Default services log directory |
| `services.configDir` | string | `~/.local/share/launchpad/services/config` | Default services configuration directory |
| `services.autoRestart` | boolean | `true` | Auto-restart failed services |
| `services.startupTimeout` | number | `30` | Service startup timeout in seconds |
| `services.shutdownTimeout` | number | `10` | Service shutdown timeout in seconds |
| `services.infer` | boolean | `true` | Derive services to auto-start from framework configuration |

### Post-Setup Commands

Configure commands to run after the environment is prepared (independent of services):

```ts
// launchpad.config.ts
import type { LaunchpadConfig } from '@stacksjs/launchpad'

const config: LaunchpadConfig = {
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

### Lifecycle Hooks (preSetup, preActivation, postActivation)

In addition to `postSetup`, Launchpad provides three more lifecycle hooks for fine-grained control:

- preSetup: runs before any installation/services start
- preActivation: runs after installs/services, just before activation
- postActivation: runs immediately after activation completes

You can configure them in `launchpad.config.ts` or inline in your dependency file (e.g., `deps.yaml`).

Config file example:

```ts
// launchpad.config.ts
import type { LaunchpadConfig } from '@stacksjs/launchpad'

const config: LaunchpadConfig = {
  preSetup: {
    enabled: true,
    commands: [
      { command: "bash -lc 'echo preSetup'" },
    ],
  },
  preActivation: {
    enabled: true,
    commands: [
      { command: "bash -lc 'echo preActivation'" },
    ],
  },
  postActivation: {
    enabled: true,
    commands: [
      { command: "bash -lc 'echo postActivation'" },
    ],
  },
}

export default config
```

Dependency file example (inline hooks):

```yaml
# deps.yaml
preSetup:
  enabled: true
  commands:
    - { command: "bash -lc 'echo preSetup'" }

postSetup:
  enabled: true
  commands:
    - { command: "bash -lc 'echo postSetup'" }

preActivation:
  enabled: true
  commands:
    - { command: "bash -lc 'echo preActivation'" }

postActivation:
  enabled: true
  commands:
    - { command: "bash -lc 'echo postActivation'" }
```

Notes:

- Inline hooks in `deps.yaml` run alongside config hooks of the same phase.
- preSetup runs before dependency installation and service auto-start.
- preActivation runs after installation/services and before printing the activation message.
- postActivation runs after the final activation message.

## Environment Variables

You can also configure Launchpad using environment variables:

| Environment Variable | Description |
|----------------------|-------------|
| `LAUNCHPAD_VERBOSE` | Enable verbose logging |
| `LAUNCHPAD_INSTALL_PATH` | Set installation path |
| `LAUNCHPAD_SHIM_PATH` | Set shim path |
| `LAUNCHPAD_AUTO_SUDO` | Enable/disable auto sudo |
| `LAUNCHPAD_AUTO_ADD_PATH` | Enable/disable auto PATH modification |
| `LAUNCHPAD_SHOW_ENV_MESSAGES` | Enable/disable environment activation messages |
| `LAUNCHPAD_SHELL_ACTIVATION_MESSAGE` | Custom shell activation message |
| `LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE` | Custom shell deactivation message |
| `LAUNCHPAD_CHECK_UPDATES` | Enable/disable update checking |
| `LAUNCHPAD_PROMPT_BEFORE_UPDATE` | Enable/disable update prompts |
| `LAUNCHPAD_SERVICES_ENABLED` | Enable/disable service management |
| `LAUNCHPAD_SERVICES_DATA_DIR` | Set services data directory |
| `LAUNCHPAD_SERVICES_LOG_DIR` | Set services log directory |
| `LAUNCHPAD_SERVICES_CONFIG_DIR` | Set services configuration directory |
| `LAUNCHPAD_SERVICES_AUTO_RESTART` | Enable/disable auto-restart for failed services |
| `LAUNCHPAD_SERVICES_STARTUP_TIMEOUT` | Service startup timeout in seconds |
| `LAUNCHPAD_SERVICES_SHUTDOWN_TIMEOUT` | Service shutdown timeout in seconds |
| `SUDO_PASSWORD` | Password for sudo operations |

Example:

```bash
LAUNCHPAD_VERBOSE=true LAUNCHPAD_INSTALL_PATH=~/apps launchpad install node@22

## Environment Activation Model

When you cd into a project directory that contains a dependency file (e.g. `deps.yaml`, `dependencies.yaml`, `pkgx.yml`, `launchpad.yml`, `package.json`, `pyproject.toml`), Launchpad computes:

- A project hash based on the physical path
- A dependency fingerprint based on the content of the dependency file (md5)

The target environment directory is derived as:

```

~/.local/share/launchpad/envs/<project>_<hash>-d<dep_hash>

```

This guarantees that editing dependency versions switches to a distinct environment on the next `cd`, ensuring the correct tools are active immediately.

To inspect selection and cache behavior, enable verbose logging:

```bash
export LAUNCHPAD_VERBOSE=true # or set in .env
cd my-project
# 🔍 Env target: env_dir=… dep_file=… dep_hash=…
# 🔍 Cache check: dep=… dep_mtime=… cache_mtime=… fp_match=yes|no
# 🔁 Cache invalid: dependency newer than cache
# 🔁 Cache invalid: fingerprint mismatch
```

## Shell Message Customization

You can customize the messages shown when environments are activated or deactivated:

### Disabling Shell Messages

```bash
# Environment variable
export LAUNCHPAD_SHOW_ENV_MESSAGES=false

# Or in configuration file
{
  "showShellMessages": false
}
```

### Custom Activation Messages

```bash
# Environment variable with path placeholder
export LAUNCHPAD_SHELL_ACTIVATION_MESSAGE="🚀 Project environment loaded: {path}"

# Or in configuration file
{
  "shellActivationMessage": "🚀 Project environment loaded: {path}"
}
```

### Custom Deactivation Messages

```bash
# Environment variable
export LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE="🔒 Project environment closed"

# Or in configuration file
{
  "shellDeactivationMessage": "🔒 Project environment closed"
}
```

### Message Examples

Here are some example message configurations:

```json
{
  "showShellMessages": true,
  "shellActivationMessage": "🔧 Development environment ready for {path}",
  "shellDeactivationMessage": "👋 Development environment closed"
}
```

```json
{
  "showShellMessages": true,
  "shellActivationMessage": "📁 Switched to project: {path}",
  "shellDeactivationMessage": "🏠 Returned to global environment"
}
```

```json
{
  "showShellMessages": true,
  "shellActivationMessage": "[ENV] {path}",
  "shellDeactivationMessage": "[ENV] deactivated"
}
```

## Command-Line Overrides

Options specified on the command line take precedence over configuration files:

```bash
# Override installation path
launchpad install --path ~/custom-path node@22

# Force reinstallation
launchpad shim --force node

# Disable auto PATH modification
launchpad bootstrap --no-auto-path

# Install specific Bun version
launchpad bun --version 1.0.0

# Bootstrap with custom options
launchpad bootstrap --skip-bun --verbose

# Remove packages with dry-run preview
launchpad remove python --dry-run

# Complete removal without confirmation
launchpad uninstall --force

# Update packages with options
launchpad update --dry-run
launchpad upgrade bun --latest

# Generate environment script with options
launchpad dev:dump --verbose --dryrun

# Quiet installation
launchpad install --quiet node@22
```

## Configuration File Locations

Launchpad uses the `bunfig` library to load configuration files in this order:

1. `launchpad.config.ts` in current directory
2. `launchpad.config.js` in current directory
3. `launchpad.config.json` in current directory
4. `.launchpadrc` in home directory
5. `~/.config/launchpad/config.json`

## TypeScript Integration

When using Launchpad as a library, you can import the types:

```ts
import type { LaunchpadConfig, LaunchpadOptions } from '@stacksjs/launchpad'

// Full configuration
const config: LaunchpadConfig = {
  verbose: true,
  installationPath: '/usr/local',
  // ... all other required properties
}

// Partial configuration (useful for runtime overrides)
const options: LaunchpadOptions = {
  verbose: true,
  force: true,
}
```

## Configuration Validation

Launchpad validates configuration at runtime and will show helpful error messages for invalid configurations:

```bash
# Check your current configuration
launchpad --verbose install --dry-run node

# This will show the resolved configuration values
```

## Troubleshooting Configuration

### Configuration Not Loading

1. Check file syntax:

   ```bash
   # For TypeScript files
   bunx tsc --noEmit launchpad.config.ts

   # For JSON files
   bunx jsonlint .launchpadrc
   ```

2. Verify file location:

   ```bash
   # Check current directory
   ls -la launchpad.config.*

   # Check home directory
   ls -la ~/.launchpadrc ~/.config/launchpad/
   ```

3. Test with verbose mode:

   ```bash
   launchpad --verbose list
   ```

### Environment Variables Not Working

1. Check if variables are set:

   ```bash
   env | grep LAUNCHPAD
   ```

2. Export variables properly:

   ```bash
   export LAUNCHPAD_VERBOSE=true
   export LAUNCHPAD_INSTALL_PATH=/custom/path
   export LAUNCHPAD_DB_USERNAME=myuser
   export LAUNCHPAD_DB_PASSWORD=mypassword
   export LAUNCHPAD_DB_AUTH_METHOD=md5
   ```

3. Verify shell configuration:

   ```bash
   echo $SHELL
   source ~/.zshrc  # or ~/.bashrc
   ```
