# Get Started

There are two ways of using this reverse proxy: _as a library or as a CLI._

## Library

Given the npm package is installed:

```ts
import type { TlsConfig } from '@stacksjs/rpx'
import { startProxy } from '@stacksjs/rpx'

export interface CleanupConfig {
  hosts: boolean // clean up /etc/hosts, defaults to false
  certs: boolean // clean up certificates, defaults to false
}

export interface ReverseProxyConfig {
  from: string // domain to proxy from, defaults to localhost:3000
  to: string // domain to proxy to, defaults to stacks.localhost
  cleanUrls?: boolean // removes the .html extension from URLs, defaults to false
  https: boolean | TlsConfig // automatically uses https, defaults to true, also redirects http to https
  cleanup?: boolean | CleanupConfig // automatically cleans up /etc/hosts, defaults to false
  verbose: boolean // log verbose output, defaults to false
}

const config: ReverseProxyOptions = {
  from: 'localhost:3000',
  to: 'my-docs.localhost',
  cleanUrls: true,
  https: true,
  cleanup: false,
}

startProxy(config)
```

In case you are trying to start multiple proxies, you may use this configuration:

```ts
// reverse-proxy.config.{ts,js}
import type { ReverseProxyOptions } from '@stacksjs/rpx'
import os from 'node:os'
import path from 'node:path'

const config: ReverseProxyOptions = {
  https: { // https: true -> also works with sensible defaults
    caCertPath: path.join(os.homedir(), '.stacks', 'ssl', `stacks.localhost.ca.crt`),
    certPath: path.join(os.homedir(), '.stacks', 'ssl', `stacks.localhost.crt`),
    keyPath: path.join(os.homedir(), '.stacks', 'ssl', `stacks.localhost.crt.key`),
  },

  cleanup: {
    hosts: true,
    certs: false,
  },

  proxies: [
    {
      from: 'localhost:5173',
      to: 'my-app.localhost',
      cleanUrls: true,
    },
    {
      from: 'localhost:5174',
      to: 'my-api.local',
    },
  ],

  verbose: true,
}

export default config
```

## CLI

```bash
rpx --from localhost:3000 --to my-project.localhost
rpx --from localhost:8080 --to my-project.test --keyPath ./key.pem --certPath ./cert.pem
rpx --help
rpx --version
```

## Testing

```bash
bun test
```

# Basic Usage

Launchpad provides a simple yet powerful command-line interface for managing packages and development environments. This guide covers the most common operations.

## Command Overview

Here are the main commands available in Launchpad:

| Command | Description |
|---------|-------------|
| `install` or `i` | Install packages |
| `shim` | Create shims for packages |
| `pkgx` | Install pkgx itself |
| `dev` | Install the dev package |
| `bun` | Install Bun runtime directly |
| `zsh` | Install Zsh shell |
| `list` or `ls` | List installed packages |
| `autoupdate` | Check auto-update status |
| `autoupdate:enable` | Enable auto-updates |
| `autoupdate:disable` | Disable auto-updates |
| `version` | Show version information |
| `help` | Display help information |

## Installing Packages

Install one or more packages using the `install` or `i` command:

```bash
# Install a single package
launchpad install node@22

# Install multiple packages
launchpad install python@3.12 ruby@3.3

# Short form
launchpad i go
```

By default, packages are installed to a system location (typically `/usr/local` if writable, or `~/.local` otherwise). You can specify a custom installation path:

```bash
# Install to a specific location
launchpad install --path ~/my-packages node
```

## Creating Shims

Shims are lightweight executable scripts that point to the actual binaries. They allow you to run commands without having to modify your PATH for each package:

```bash
# Create shims for a package
launchpad shim node

# Create shims with a custom path
launchpad shim --path ~/bin typescript
```

## Installing the Dev Package

The `dev` command provides a convenient way to install the `dev` package, which enables development-aware environments:

```bash
# Install dev
launchpad dev

# Force reinstall
launchpad dev --force

# Specify installation path
launchpad dev --path ~/bin
```

## Installing pkgx

If you don't have pkgx installed, Launchpad can install it for you:

```bash
# Install pkgx
launchpad pkgx

# Force reinstall
launchpad pkgx --force
```

## Installing Bun

Launchpad provides a dedicated command for installing Bun directly from GitHub releases:

```bash
# Install latest Bun version
launchpad bun

# Install specific version
launchpad bun --version 1.0.0

# Specify installation path
launchpad bun --path ~/bin
```

The `bun` command automatically detects your platform, downloads the appropriate binary, and adds it to your PATH.

## Installing Zsh

Launchpad provides a dedicated command for installing the Zsh shell:

```bash
# Install zsh
launchpad zsh

# Force reinstall
launchpad zsh --force

# Specify installation path
launchpad zsh --path ~/bin
```

After installation, Launchpad provides instructions for making zsh your default shell:

```bash
# Make zsh your default shell
chsh -s /path/to/installed/zsh
```

## Managing Auto-updates

Control how pkgx handles updates:

```bash
# Check current auto-update status
launchpad autoupdate

# Enable auto-updates
launchpad autoupdate:enable

# Disable auto-updates
launchpad autoupdate:disable
```

## Listing Installed Packages

View what packages are currently installed:

```bash
# List all installed packages
launchpad list

# Or use the shorthand
launchpad ls
```

## Common Options

Most commands support these options:

| Option | Description |
|--------|-------------|
| `--verbose` | Enable detailed logging |
| `--path` | Specify installation/shim path |
| `--force` | Force reinstall even if already installed |
| `--no-auto-path` | Don't automatically add to PATH |
| `--sudo` | Use sudo for installation (if needed) |

## Using PATH Integration

By default, Launchpad automatically adds shim directories to your PATH. You can disable this behavior:

```bash
launchpad shim node --no-auto-path
```

## Getting Help

For detailed information about any command:

```bash
launchpad help
launchpad <command> --help
```
