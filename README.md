<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# launchpad

> A lightweight package manager built on top of pkgx to simplify package installation and management. _Similar to Homebrew._

## Features

Launchpad offers the following features:

- 📦 **Package Management** _Install and manage packages directly using pkgx_
- 🔄 **Executable Shims** _Create executable shims for packages automatically_
- 🛠️ **pkgx Installation** _Install and manage the pkgx utility itself_
- 💻 **Dev Environment** _Dedicated command for the dev package for development environments_
- 🔧 **Auto-updates** _Configure automatic updates for pkgx_
- 🔌 **PATH Integration** _Automatically add installation directories to your PATH_
- 🪟 **Cross-platform** _Support for macOS, Linux, and Windows systems_

## Installation

```bash
# Install with Bun
bun add -g launchpad

# Or with npm
npm install -g launchpad

# Or with yarn
yarn global add launchpad
```

## Usage

### Install packages

```bash
# Install packages
launchpad install node python

# Use a shorthand
launchpad i node
```

### Create shims

```bash
# Create shims for executables from packages
launchpad shim node typescript

# Specify custom path
launchpad shim --path ~/bin node
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
# Install the dev package for development environments
launchpad dev

# With customization
launchpad dev --path ~/bin --force
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

### Customize PATH behavior

```bash
# Prevent automatic PATH modifications
launchpad shim node --no-auto-path
launchpad dev --no-auto-path
```

### List installed packages

```bash
# List all installed packages
launchpad list

# Or use the shorthand
launchpad ls
```

## Configuration

Launchpad uses a configuration file in your home directory at `~/.launchpadrc` or `.launchpad.json` in your project. Example configuration:

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

## Changelog

Please see our [releases](https://github.com/stackjs/launchpad/releases) page for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/launchpad/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

"Software that is free, but hopes for a postcard." We love receiving postcards from around the world showing where Stacks is being used! We showcase them on our website too.

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094, United States 🌎

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## License

The MIT License (MIT). Please see [LICENSE](LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@stacksjs/launchpad?style=flat-square
[npm-version-href]: https://npmjs.com/package/@stacksjs/launchpad
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/launchpad/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/launchpad/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/launchpad/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/launchpad -->
