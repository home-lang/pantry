# Configuration

Launchpad can be configured using a configuration file or through command-line options. This guide explains all available configuration options and how to use them.

## Configuration File

Launchpad looks for configuration in these locations (in order of precedence):

1. `.launchpad.json` or `launchpad.config.ts` in the current directory
2. `~/.launchpadrc` or `~/.config/launchpad/config.json` in your home directory

Example configuration file (`launchpad.config.ts`):

```ts
import type { LaunchpadConfig } from 'launchpad'
import os from 'node:os'
import path from 'node:path'

const config: LaunchpadConfig = {
  // Enable verbose logging (default: false)
  verbose: true,

  // Path where binaries should be installed
  // (default: /usr/local if writable, ~/.local otherwise)
  installationPath: '/usr/local',

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

  // Default path for shims (default: ~/.local/bin)
  shimPath: path.join(os.homedir(), '.local', 'bin'),

  // Whether to automatically add shim path to the system PATH (default: true)
  autoAddToPath: true,
}

export default config
```

JavaScript format (`.launchpadrc`):

```json
{
  "verbose": true,
  "installationPath": "/usr/local",
  "autoSudo": true,
  "maxRetries": 3,
  "timeout": 60000,
  "symlinkVersions": true,
  "forceReinstall": false,
  "shimPath": "~/.local/bin",
  "autoAddToPath": true
}
```

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

### Permission Management

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoSudo` | boolean | `true` | Automatically use sudo when needed |

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

Example:

```bash
LAUNCHPAD_VERBOSE=true LAUNCHPAD_INSTALL_PATH=~/apps launchpad install node@22
```

## Command-Line Overrides

Options specified on the command line take precedence over configuration files:

```bash
# Override installation path
launchpad install --path ~/custom-path node@22

# Force reinstallation
launchpad shim --force node

# Disable auto PATH modification
launchpad dev --no-auto-path

# Install specific Bun version
launchpad bun --version 1.0.0

# Bootstrap with custom options
launchpad bootstrap --skip-bun --verbose

# Remove packages with dry-run preview
launchpad remove python --dry-run

# Complete removal without confirmation
launchpad uninstall --force

# Keep specific components during uninstall
launchpad uninstall --keep-shell-integration

# Generate environment script with options
launchpad dev:dump --verbose --dryrun

# Quiet installation
launchpad install --quiet node@22
```

## Development Environment Configuration

### Project-Level Configuration

Create a `dependencies.yaml` file in your project root:

```yaml
dependencies:
  - node@22
  - python@3.12
  - gnu.org/wget@1.21

env:
  NODE_ENV: development
  API_URL: https://api.example.com
  DATABASE_URL: postgresql://localhost/myapp
```

### Global Environment Configuration

Set global environment defaults in your Launchpad config:

```ts
const config: LaunchpadConfig = {
  // Global environment variables for all projects
  globalEnv: {
    EDITOR: 'code',
    BROWSER: 'chrome',
  },

  // Default packages to include in all environments
  defaultPackages: [
    'git',
    'curl.se',
  ],
}
```

### Environment Isolation Settings

Configure how project environments are isolated:

```ts
const config: LaunchpadConfig = {
  // Base directory for project environments
  envBaseDir: path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs'),

  // Whether to automatically activate environments when entering directories
  autoActivateEnv: true,

  // Whether to show activation/deactivation messages
  showEnvMessages: true,
}
```

## Advanced Configuration

### Custom Binary Stubs

Configure how binary stubs are created:

```ts
const config: LaunchpadConfig = {
  // Template for binary stub scripts
  stubTemplate: `#!/bin/sh
# Custom stub template
export CUSTOM_VAR=value
exec "{binary}" "$@"
`,

  // Whether to create isolated stubs (recommended)
  isolatedStubs: true,
}
```

### Package Resolution

Configure package resolution behavior:

```ts
const config: LaunchpadConfig = {
  // Custom package registry URLs
  registries: [
    'https://pkgx.sh/packages',
    'https://custom-registry.com',
  ],

  // Package name aliases
  aliases: {
    node: 'nodejs.org',
    python: 'python.org',
  },
}
```

### Installation Paths

Configure different installation paths for different types of packages:

```ts
const config: LaunchpadConfig = {
  // Runtime-specific installation paths
  runtimePaths: {
    'nodejs.org': '/opt/node',
    'python.org': '/opt/python',
  },

  // System vs user installation preference
  preferUserInstall: true,
}
```

## Platform-Specific Configuration

### macOS Configuration

```ts
const config: LaunchpadConfig = {
  // Use Homebrew paths when available
  useHomebrewPaths: true,

  // macOS-specific binary directories
  macBinaryPaths: [
    '/usr/local/bin',
    '/opt/homebrew/bin',
  ],
}
```

### Linux Configuration

```ts
const config: LaunchpadConfig = {
  // Linux-specific paths
  linuxBinaryPaths: [
    '/usr/local/bin',
    '/usr/bin',
    '/opt/bin',
  ],

  // Whether to use system package manager as fallback
  useSystemPackageManager: true,
}
```

### Windows Configuration

```ts
const config: LaunchpadConfig = {
  // Windows-specific paths
  windowsBinaryPaths: [
    'C:\\Program Files\\Launchpad\\bin',
    '%USERPROFILE%\\.local\\bin',
  ],

  // Whether to add .exe extension automatically
  autoAddExeExtension: true,
}
```

## Troubleshooting Configuration

### Debugging Configuration

Enable configuration debugging:

```bash
LAUNCHPAD_DEBUG_CONFIG=true launchpad version
```

### Configuration Validation

Validate your configuration:

```bash
launchpad config:validate
```

### Configuration Location

Find where Launchpad is loading configuration from:

```bash
launchpad config:show
```
