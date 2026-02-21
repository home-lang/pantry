# Configuration

pantry can be configured using a configuration file or through command-line options. This guide explains all available configuration options and how to use them.

## Configuration File

pantry looks for configuration in these locations (in order of precedence):

1. `pantry.config.ts` or `pantry.config.js` in the current directory
2. `~/.pantryrc` or `~/.config/pantry/config.json` in your home directory

Example configuration file (`pantry.config.ts`):

```ts
import type { pantryConfig } from 'ts-pantry'
import os from 'node:os'
import path from 'node:path'

const config: pantryConfig = {
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

    // Default services data directory (default: ~/.local/share/pantry/services)
    dataDir: path.join(os.homedir(), '.local', 'share', 'pantry', 'services'),

    // Default services log directory (default: ~/.local/share/pantry/logs)
    logDir: path.join(os.homedir(), '.local', 'share', 'pantry', 'logs'),

    // Default services configuration directory (default: ~/.local/share/pantry/services/config)
    configDir: path.join(os.homedir(), '.local', 'share', 'pantry', 'services', 'config'),

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

JavaScript format (`.pantryrc`):

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
    "dataDir": "~/.local/share/pantry/services",
    "logDir": "~/.local/share/pantry/logs",
    "configDir": "~/.local/share/pantry/services/config",
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

pantry provides configurable database credentials for all database services. This allows you to customize authentication while maintaining secure defaults.

### Configuration Options

Database credentials can be configured through environment variables or configuration files:

#### Environment Variables

```bash
# Database username (default: 'root')
export pantry_DB_USERNAME="myuser"

# Database password (default: 'password')
export pantry_DB_PASSWORD="mypassword"

# Database authentication method (default: 'trust')
export pantry_DB_AUTH_METHOD="md5"  # 'trust' | 'md5' | 'scram-sha-256'
```

#### Configuration File

```ts
// pantry.config.ts
const config: pantryConfig = {
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
pantry start postgres
```

#### Custom Development Setup

```bash
export pantry_DB_USERNAME="dev_user"
export pantry_DB_PASSWORD="dev_password"
pantry start postgres
```

#### Production-like Setup

```bash
export pantry_DB_AUTH_METHOD="md5"
export pantry_DB_PASSWORD="secure_password123"
pantry start postgres
```

### Security Considerations

1. **Development**: Default `trust` auth is suitable for local development
2. **Production**: Use `md5` or `scram-sha-256` with strong passwords
3. **Environment Variables**: Store sensitive credentials in `.env` files
4. **Version Control**: Never commit passwords in configuration files

## Dependency File Configuration

pantry supports flexible dependency configuration with global installation options:

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

When using the `pantry clean` command, you can preserve global dependencies to avoid accidentally removing essential system tools:

```bash
# Safe cleanup that preserves global dependencies
pantry clean --keep-global --force

# Preview what would be preserved
pantry clean --keep-global --dry-run
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
- **autoStart**: array of service names (or group names) to start automatically on environment activation. Each service's health check is polled after startup to ensure readiness.
- Service names must match those in the [Supported Services list](./features/service-management.md#available-services) (e.g. `postgres`, `redis`, `nginx`). Group names (`db`, `monitoring`, `queue`, `web`) are also accepted.

#### Custom Services

Define project-specific services in the `custom:` section:

```yaml
services:
  enabled: true
  autoStart:
    - postgres
    - my-worker

  custom:
    my-worker:
      command: "node worker.js"
      port: 3001
      healthCheck: "curl -sf http://localhost:3001/health"
      workingDirectory: "."
```

Custom service fields:

| Field | Required | Description |
|-------|----------|-------------|
| `command` | Yes | The command to run the service |
| `port` | No | Port the service listens on |
| `healthCheck` | No | Shell command to verify readiness (exit 0 = ready) |
| `workingDirectory` | No | Working directory (`.` = project root, or absolute path) |

Custom services in `autoStart` are started and health-checked just like built-in services.

#### Service Groups

Define named groups of services to start/stop together:

```yaml
services:
  enabled: true
  autoStart:
    - backend

  groups:
    backend:
      - postgres
      - redis
      - my-worker
    frontend:
      - nginx
```

Four built-in groups are available without configuration: `db`, `monitoring`, `queue`, `web`. See [Service Groups](./features/service-management.md#service-groups) for details.

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

When enabled and a Laravel app is detected (`artisan` present), pantry will read `.env` and infer services:

- `DB_CONNECTION=pgsql` → `postgres`
- `DB_CONNECTION=mysql|mariadb` → `mysql`
- `CACHE_DRIVER=redis` or `CACHE_STORE=redis` → `redis`
- `CACHE_DRIVER=memcached` or `CACHE_STORE=memcached` → `memcached`

Environment toggles:

- `pantry_FRAMEWORKS_ENABLED` (default: true)
- `pantry_SERVICES_INFER` (default: true)
- `pantry_LARAVEL_ENABLED` (default: true)

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
| `services.dataDir` | string | `~/.local/share/pantry/services` | Default services data directory |
| `services.logDir` | string | `~/.local/share/pantry/logs` | Default services log directory |
| `services.configDir` | string | `~/.local/share/pantry/services/config` | Default services configuration directory |
| `services.autoRestart` | boolean | `true` | Auto-restart failed services |
| `services.startupTimeout` | number | `30` | Service startup timeout in seconds |
| `services.shutdownTimeout` | number | `10` | Service shutdown timeout in seconds |
| `services.infer` | boolean | `true` | Derive services to auto-start from framework configuration |

### Post-Setup Commands

Configure commands to run after the environment is prepared (independent of services):

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

### Lifecycle Hooks (preSetup, preActivation, postActivation)

In addition to `postSetup`, pantry provides three more lifecycle hooks for fine-grained control:

- preSetup: runs before any installation/services start
- preActivation: runs after installs/services, just before activation
- postActivation: runs immediately after activation completes

You can configure them in `pantry.config.ts` or inline in your dependency file (e.g., `deps.yaml`).

Config file example:

```ts
// pantry.config.ts
import type { pantryConfig } from 'ts-pantry'

const config: pantryConfig = {
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

You can also configure pantry using environment variables:

| Environment Variable | Description |
|----------------------|-------------|
| `PANTRY_VERBOSE` | Enable verbose logging |
| `pantry_INSTALL_PATH` | Set installation path |
| `pantry_SHIM_PATH` | Set shim path |
| `pantry_AUTO_SUDO` | Enable/disable auto sudo |
| `pantry_AUTO_ADD_PATH` | Enable/disable auto PATH modification |
| `pantry_SHOW_ENV_MESSAGES` | Enable/disable environment activation messages |
| `pantry_SHELL_ACTIVATION_MESSAGE` | Custom shell activation message |
| `pantry_SHELL_DEACTIVATION_MESSAGE` | Custom shell deactivation message |
| `pantry_CHECK_UPDATES` | Enable/disable update checking |
| `pantry_PROMPT_BEFORE_UPDATE` | Enable/disable update prompts |
| `pantry_SERVICES_ENABLED` | Enable/disable service management |
| `pantry_SERVICES_DATA_DIR` | Set services data directory |
| `pantry_SERVICES_LOG_DIR` | Set services log directory |
| `pantry_SERVICES_CONFIG_DIR` | Set services configuration directory |
| `pantry_SERVICES_AUTO_RESTART` | Enable/disable auto-restart for failed services |
| `pantry_SERVICES_STARTUP_TIMEOUT` | Service startup timeout in seconds |
| `pantry_SERVICES_SHUTDOWN_TIMEOUT` | Service shutdown timeout in seconds |
| `SUDO_PASSWORD` | Password for sudo operations |

Example:

```bash
PANTRY_VERBOSE=true pantry_INSTALL_PATH=~/apps pantry install node@22

## Environment Activation Model

When you cd into a project directory that contains a dependency file (e.g. `deps.yaml`, `dependencies.yaml`, `pkgx.yml`, `pantry.yml`, `package.json`, `pyproject.toml`), pantry computes:

- A project hash based on the physical path
- A dependency fingerprint based on the content of the dependency file (md5)

The target environment directory is derived as:

```

~/.local/share/pantry/envs/<project>_<hash>-d<dep_hash>

```

This guarantees that editing dependency versions switches to a distinct environment on the next `cd`, ensuring the correct tools are active immediately.

To inspect selection and cache behavior, enable verbose logging:

```bash

export PANTRY_VERBOSE=true # or set in .env
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

export pantry_SHOW_ENV_MESSAGES=false

# Or in configuration file

{
  "showShellMessages": false
}

```

### Custom Activation Messages

```bash

# Environment variable with path placeholder

export pantry_SHELL_ACTIVATION_MESSAGE="🚀 Project environment loaded: {path}"

# Or in configuration file

{
  "shellActivationMessage": "🚀 Project environment loaded: {path}"
}

```

### Custom Deactivation Messages

```bash

# Environment variable

export pantry_SHELL_DEACTIVATION_MESSAGE="🔒 Project environment closed"

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

pantry install --path ~/custom-path node@22

# Force reinstallation

pantry shim --force node

# Disable auto PATH modification

pantry bootstrap --no-auto-path

# Install specific Bun version

pantry bun --version 1.0.0

# Bootstrap with custom options

pantry bootstrap --skip-bun --verbose

# Remove packages with dry-run preview

pantry remove python --dry-run

# Complete removal without confirmation

pantry uninstall --force

# Update packages with options

pantry update --dry-run
pantry upgrade bun --latest

# Generate environment script with options

pantry dev:dump --verbose --dryrun

# Quiet installation

pantry install --quiet node@22

```

## Configuration File Locations

pantry uses the `bunfig` library to load configuration files in this order:

1. `pantry.config.ts` in current directory
2. `pantry.config.js` in current directory
3. `pantry.config.json` in current directory
4. `.pantryrc` in home directory
5. `~/.config/pantry/config.json`

## TypeScript Integration

When using pantry as a library, you can import the types:

```ts

import type { pantryConfig, pantryOptions } from 'ts-pantry'

// Full configuration
const config: pantryConfig = {
  verbose: true,
  installationPath: '/usr/local',
  // ... all other required properties
}

// Partial configuration (useful for runtime overrides)
const options: pantryOptions = {
  verbose: true,
  force: true,
}

```

## Configuration Validation

pantry validates configuration at runtime and will show helpful error messages for invalid configurations:

```bash

# Check your current configuration

pantry --verbose install --dry-run node

# This will show the resolved configuration values

```

## Troubleshooting Configuration

### Configuration Not Loading

1. Check file syntax:

   ```bash

# For TypeScript files

   bunx tsc --noEmit pantry.config.ts

# For JSON files

   bunx jsonlint .pantryrc

   ```

2. Verify file location:

   ```bash

# Check current directory

   ls -la pantry.config.*

# Check home directory

   ls -la ~/.pantryrc ~/.config/pantry/

   ```

3. Test with verbose mode:

   ```bash

   pantry --verbose list

   ```

### Environment Variables Not Working

1. Check if variables are set:

   ```bash

   env | grep pantry

   ```

2. Export variables properly:

   ```bash

   export PANTRY_VERBOSE=true
   export pantry_INSTALL_PATH=/custom/path
   export pantry_DB_USERNAME=myuser
   export pantry_DB_PASSWORD=mypassword
   export pantry_DB_AUTH_METHOD=md5

   ```

3. Verify shell configuration:

   ```bash

   echo $SHELL
   source ~/.zshrc  # or ~/.bashrc

   ```
