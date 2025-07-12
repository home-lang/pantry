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

  // Whether to auto-elevate with sudo when needed (default: true)
  autoSudo: true,

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

  // Custom message to show when environment is deactivated (default: "dev environment deactivated")
  shellDeactivationMessage: 'dev environment deactivated',
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
  "autoSudo": true,
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
  "shellDeactivationMessage": "dev environment deactivated"
}
```

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
| `autoSudo` | boolean | `true` | Automatically use sudo when needed |

### Shell Environment Messages

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showShellMessages` | boolean | `true` | Whether to display environment activation/deactivation messages |
| `shellActivationMessage` | string | `"✅ Environment activated for {path}"` | Custom message shown when environment is activated. Use `{path}` placeholder for project path |
| `shellDeactivationMessage` | string | `"dev environment deactivated"` | Custom message shown when environment is deactivated |

### Path Management

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoAddToPath` | boolean | `true` | Automatically add shim directories to PATH |

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
| `SUDO_PASSWORD` | Password for sudo operations |

Example:

```bash
LAUNCHPAD_VERBOSE=true LAUNCHPAD_INSTALL_PATH=~/apps launchpad install node@22
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
   ```

3. Verify shell configuration:
   ```bash
   echo $SHELL
   source ~/.zshrc  # or ~/.bashrc
   ```
