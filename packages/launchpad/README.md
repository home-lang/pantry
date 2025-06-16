<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# launchpad

> A lightweight package manager built on top of pkgx to simplify package installation and management. _Similar to Homebrew, but faster._

## Features

Launchpad offers a streamlined approach to package management with these key features:

- 📦 **[Package Management](https://github.com/stacksjs/launchpad/tree/main/docs/features/package-management.md)** — Install and manage packages efficiently
- 🔄 **Package Updates** — Keep packages up-to-date with intelligent version management
- 🔧 **Auto-updates** — Configure automatic updates
- 🔌 **[PATH Integration](https://github.com/stacksjs/launchpad/tree/main/docs/features/path-management.md)** — Automatically ensures installation directories are maintained in your PATH
- 🔄 **[Executable Shims](https://github.com/stacksjs/launchpad/tree/main/docs/features/shim-creation.md)** — Create executable shims for packages automatically
- 💻 **CLI & Library** — Programmatically or manually manage your dependencies using the CLI or library
- 🪟 **Cross-platform** — Full support for macOS, Linux, and Windows systems

## Why Launchpad?

Traditional package managers like Homebrew have limitations:

- **Slow installations** — Installing or updating can take minutes
- **Dependency chains** — Updating one package triggers unwanted updates
- **Environment conflicts** — Different projects need different versions
- **PATH management** — Manual PATH configuration is error-prone
- **Platform inconsistency** — Different systems need different approaches

Launchpad solves these by providing:

- **Fast installations** — Leverage pkgx for efficient package management
- **Isolated packages** — Install only what you need without conflicts
- **Automatic PATH management** — Tools are available immediately
- **Consistent interface** — Same commands work everywhere
- **Dev environments** — Project-specific development environment support

[Read more about why we created Launchpad](https://github.com/stacksjs/launchpad/tree/main/docs/why.md)

## Installation

Launchpad is available through multiple package managers:

```bash
# Install with Bun (recommended)
bun add -g @stacksjs/launchpad

# Or with npm
npm install -g @stacksjs/launchpad

# Or with yarn
yarn global add @stacksjs/launchpad

# Or with pnpm
pnpm add -g @stacksjs/launchpad
```

See [Installation Guide](https://github.com/stacksjs/launchpad/tree/main/docs/install.md) for more options.

## Quick Start

### Install packages

```bash
# Install packages
launchpad install node python

# Use the shorthand
launchpad i node@22
```

### Create shims

```bash
# Create shims for executables
launchpad shim node@22 typescript@5.7

# Specify custom path
launchpad shim --path ~/bin node@22
```

### Install pkgx

```bash
# Install pkgx itself
launchpad pkgx

# Force reinstall
launchpad pkgx --force
```

### Install dev package

```bash
# Install the dev package
launchpad dev

# With customization
launchpad dev --path ~/bin
```

### Install Bun

```bash
# Install Bun directly
launchpad bun

# Install specific version
launchpad bun --version 1.2.14
```

### Configure auto-updates

```bash
# Check current auto-update status
launchpad autoupdate

# Enable auto-updates
launchpad autoupdate:enable

# Disable auto-updates
launchpad autoupdate:disable
```

### Update packages

```bash
# Update all packages
launchpad update

# Update specific packages
launchpad update node python

# Update with latest versions (ignore constraints)
launchpad upgrade bun --latest

# Preview what would be updated
launchpad up --dry-run
```

### List installed packages

```bash
# List all installed packages
launchpad list
# or
launchpad ls
```

## Configuration

Launchpad can be configured via a config file (`launchpad.config.ts`, `.launchpadrc`, etc.) or through command-line options.

Example configuration:

```ts
import type { LaunchpadConfig } from '@stacksjs/launchpad'

const config: LaunchpadConfig = {
  // Enable verbose logging
  verbose: true,

  // Installation path for binaries
  installationPath: '/usr/local',

  // Auto-elevate with sudo when needed
  autoSudo: true,

  // Retry settings
  maxRetries: 3,
  timeout: 60000,

  // Version handling
  symlinkVersions: true,
  forceReinstall: false,

  // PATH management
  shimPath: '~/.local/bin',
  autoAddToPath: true,
}

export default config
```

See [Configuration Guide](https://github.com/stacksjs/launchpad/tree/main/docs/config.md) for all options.

## GitHub Action

Launchpad provides a GitHub Action for CI/CD workflows:

```yaml
- name: Install Dependencies
  uses: stacksjs/launchpad-installer@v1
  with:
    packages: node@22 typescript@5.7 bun@1.2.14
```

See [GitHub Action Documentation](https://github.com/stacksjs/launchpad/tree/main/packages/action/README.md) for details.

## Advanced Usage

Explore advanced topics in our documentation:

- [Custom Shims](https://github.com/stacksjs/launchpad/tree/main/docs/advanced/custom-shims.md)
- [Cross-platform Compatibility](https://github.com/stacksjs/launchpad/tree/main/docs/advanced/cross-platform.md)
- [Performance Optimization](https://github.com/stacksjs/launchpad/tree/main/docs/advanced/performance.md)
- [API Reference](https://github.com/stacksjs/launchpad/tree/main/docs/api/reference.md)

## Comparing to Alternatives

### vs Homebrew

- **Speed**: Significantly faster installations
- **Isolation**: Changes to one package don't affect others
- **Less disk space**: Only install what you need

### vs Manual Installation

- **Simplicity**: Single command to install complex tools
- **PATH management**: No need to manually edit shell config files
- **Version control**: Easily install specific versions
- **Consistency**: Same experience across all platforms

## Changelog

Please see our [releases](https://github.com/stackjs/launchpad/releases) page for information on changes.

## Contributing

Please see [CONTRIBUTING](https://github.com/stacksjs/contributing) for details.

## Community

For help or discussion:

- [Discussions on GitHub](https://github.com/stacksjs/launchpad/discussions)
- [Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

“Software that is free, but hopes for a postcard.” We love receiving postcards from around the world showing where Stacks is being used! We showcase them on our website too.

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094, United States 🌎

## Credits

- [Max Howell](https://github.com/mxcl) - for creating [pkgx](https://github.com/pkgxdev/pkgx) and [Homebrew](https://github.com/Homebrew/brew)
- [pkgm](https://github.com/pkgxdev/pkgm) & [dev](https://github.com/pkgxdev/dev) - thanks for the inspiration
- [Chris Breuer](https://github.com/chrisbbreuer)
- [All Contributors](https://github.com/stacksjs/launchpad/graphs/contributors)

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## License

The MIT License (MIT). Please see [LICENSE](https://github.com/stacksjs/launchpad/blob/main/LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@stacksjs/launchpad?style=flat-square
[npm-version-href]: https://npmjs.com/package/@stacksjs/launchpad
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/launchpad/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/launchpad/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/launchpad/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/launchpad -->
