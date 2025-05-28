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

  // Password for sudo operations, loaded from .env SUDO_PASSWORD
  // (default: '')
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
| `sudoPassword` | string | `''` | Password for sudo operations |

### Path Management

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoAddToPath` | boolean | `true` | Automatically add shim directories to PATH |

### Bootstrap Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `firstTimeSetup` | boolean | `true` | Show first-time setup prompts |
| `autoBootstrap` | boolean | `true` | Offer automatic bootstrap for missing tools |

### Removal Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `confirmRemoval` | boolean | `true` | Require confirmation before removing packages |
| `removeOrphans` | boolean | `false` | Automatically remove orphaned dependencies |

## Environment Variables

You can also configure Launchpad using environment variables:

| Environment Variable | Description |
|----------------------|-------------|
| `LAUNCHPAD_VERBOSE` | Enable verbose logging |
| `LAUNCHPAD_INSTALL_PATH` | Set installation path |
| `LAUNCHPAD_SHIM_PATH` | Set shim path |
| `LAUNCHPAD_AUTO_SUDO` | Enable/disable auto sudo |
| `SUDO_PASSWORD` | Password for sudo operations |
| `LAUNCHPAD_AUTO_ADD_PATH` | Enable/disable auto PATH modification |
| `LAUNCHPAD_FIRST_TIME_SETUP` | Enable/disable first-time setup prompts |
| `LAUNCHPAD_AUTO_BOOTSTRAP` | Enable/disable automatic bootstrap offers |
| `LAUNCHPAD_CONFIRM_REMOVAL` | Enable/disable removal confirmation prompts |

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
```
