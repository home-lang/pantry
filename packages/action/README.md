<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# Launchpad Installer

A GitHub Action to install packages using Launchpad in your CI/CD workflow.

## Usage

This action allows you to easily install dependencies with Launchpad in your GitHub Actions workflows.

```yaml
- name: Install Dependencies with Launchpad
  uses: stacksjs/launchpad-installer@v1
  with:
    packages: node python go # optional, space-separated list
    # Optional parameters:
    # config-path: launchpad.config.ts
    # use-dev: false
```

## Inputs

| Name       | Description                           | Required | Default              |
|------------|---------------------------------------|----------|----------------------|
| packages   | Space-separated list of packages to install | No  | (empty) - will try to extract from config |
| config-path | Path to launchpad config file        | No       | `launchpad.config.ts` |
| use-dev    | Whether to install the dev package    | No       | `false`              |

## Features

- 🚀 **Cross-platform support**: Works on Linux, macOS, and Windows runners
- 🔄 **Automatic package detection**: Can extract package list from your config file
- 💻 **Dev environment support**: Option to install the `dev` package
- 🌐 **Context-aware**: Provides full GitHub context to commands
- 🔧 **Bun-powered**: Uses Bun for faster installation

## Examples

### Basic Usage

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Dependencies
        uses: stacksjs/launchpad-installer@v1
        with:
          packages: node typescript
```

### Using with Config File

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Dependencies from Config
        uses: stacksjs/launchpad-installer@v1
        # Will automatically detect packages from launchpad.config.ts
```

### Multi-platform Workflow

```yaml
name: Multi-platform CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    steps:
      - uses: actions/checkout@v4

      - name: Install Dependencies
        uses: stacksjs/launchpad-installer@v1
        with:
          packages: node python go
          use-dev: true
```

### Setting up Development Environment

```yaml
name: Development Setup

on:
  push:
    branches: [main]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Development Environment
        uses: stacksjs/launchpad-installer@v1
        with:
          use-dev: true

      - name: Run Development Tasks
        run: launchpad dev . && npm run dev
```

## Testing

```bash
bun test
```

## Changelog

Please see our [releases](https://github.com/stacksjs/launchpad-installer/releases) page for more information on what has changed recently.

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
[npm-version-src]: https://img.shields.io/npm/v/launchpad-installer?style=flat-square
[npm-version-href]: https://npmjs.com/package/launchpad-installer
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/launchpad-installer/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/launchpad-installer/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/launchpad-installer/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/launchpad-installer -->
