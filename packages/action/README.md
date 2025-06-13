<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# Launchpad Installer

A GitHub Action to install system dependencies using Launchpad.

## Usage

This action allows you to easily install dependencies with Launchpad in your GitHub Actions workflows.

```yaml
- name: Install Dependencies with Launchpad
  uses: stacksjs/launchpad-installer@v1
  # Automatically detects and installs project dependencies
  # Optional parameters:
  # with:
  #   packages: node python go # override auto-detection
  #   config-path: launchpad.config.ts
```

## Inputs

| Name       | Description                           | Required | Default              |
|------------|---------------------------------------|----------|----------------------|
| packages   | Space-separated list of packages to install (overrides auto-detection) | No  | (empty) - auto-detects from project files |
| config-path | Path to launchpad config file        | No       | `launchpad.config.ts` |

## Features

- 🚀 **Cross-platform support**: Works on Linux, macOS, and Windows runners
- 🔍 **Smart dependency detection**: Automatically detects project dependencies from package.json, requirements.txt, go.mod, and more
- 🔄 **Config file support**: Can extract package list from your launchpad config file
- 🌐 **Context-aware**: Provides full GitHub context to commands
- 🔧 **Bun-powered**: Uses Bun for faster installation

## Examples

### Basic Usage (Auto-detection)

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
        # Automatically detects Node.js from package.json
        # and installs node + any other detected dependencies
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
        # Auto-detects dependencies across all platforms
```

### Manual Package Override

```yaml
name: Manual Override

on:
  push:
    branches: [main]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Specific Dependencies
        uses: stacksjs/launchpad-installer@v1
        with:
          packages: node python go rust
          # Override auto-detection with specific packages

      - name: Run Tests
        run: npm test
```

### Custom Config Path

```yaml
name: Custom Config

on:
  push:
    branches: [main]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Dependencies from Custom Config
        uses: stacksjs/launchpad-installer@v1
        with:
          config-path: .github/launchpad.config.ts

      - name: Run Tests
        run: npm test
```

## Testing

```bash
bun test
```

## Changelog

Please see our [releases](https://github.com/stacksjs/launchpad-installer/releases) page for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/stacksjs/contributing) for details.

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

The MIT License (MIT). Please see [LICENSE](https://github.com/stacksjs/launchpad/blob/main/LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/launchpad-installer?style=flat-square
[npm-version-href]: https://npmjs.com/package/launchpad-installer
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/launchpad-installer/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/launchpad-installer/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/launchpad-installer/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/launchpad-installer -->
