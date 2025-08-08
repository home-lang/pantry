<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# launchpad

> A modern dependency manager for your system and your projects. Effortlessly manage development tools, runtime environments, and project dependencies with automatic environment isolation. _Think Homebrew meets project-aware dependency management._

## What is Launchpad?

Launchpad is a comprehensive dependency management solution that bridges the gap between system-wide package management and project-specific environments. Whether you're setting up a new development machine, managing system tools, or working on projects with specific dependency requirements, Launchpad provides a unified interface for all your dependency needs.

**System Management:**
- Install and manage development tools system-wide
- Automatic PATH configuration and shell integration
- Cross-platform compatibility _(macOS, Linux, Windows)_
- Smart permission handling and installation paths

**Project Management:**
- Automatic project environment detection and activation
- Isolated dependency environments per project
- Version-specific tool installation
- Seamless switching between project contexts

At its core, Launchpad leverages pkgx's powerful package ecosystem while adding intelligent management, environment isolation, and developer-friendly workflows.

## Features

Launchpad transforms how you manage dependencies across your entire development workflow:

### System-Wide Dependency Management
- 📦 **Global Tool Installation** — Install development tools and runtimes system-wide with automatic PATH management
- 🔧 **Smart Installation Paths** — Automatically chooses `/usr/local` for system-wide access or `~/.local` for user-specific installs (pkgm compatible)
- 🔌 **Shell Integration** — Seamless integration with your shell for immediate tool availability
- 🪟 **Cross-Platform Support** — Consistent experience across macOS, Linux, and Windows

### Service Management
- ⚡ **19+ Pre-configured Services** — PostgreSQL, Redis, Kafka, Prometheus, Grafana, Vault, and more
- 🚀 **One-Command Service Control** — Start, stop, restart services with automatic configuration
- 🏥 **Health Monitoring** — Built-in health checks with automatic status detection
- 🔧 **Auto-Configuration** — Default configuration files generated for each service
- 🔐 **Configurable Database Credentials** — Customize database usernames, passwords, and authentication methods
- 🖥️ **Cross-Platform Service Management** — Uses launchd on macOS, systemd on Linux

### Project-Aware Environment Management
- 🌍 **Automatic Environment Isolation** — Project-specific environments that activate when you enter a project directory
- 🎯 **Dependency Detection** — Automatically reads `dependencies.yaml`, `package.json`, and other project files
- 🔄 **Context Switching** — Seamlessly switch between different project environments
- 📋 **Version Management** — Install and manage specific versions of tools per project
- 🗂️ **Environment Management** — List, inspect, clean, and remove project environments with readable identifiers

### Developer Experience
- ⚡ **Fast Operations** — Leverage pkgx for efficient package management
- 🗑️ **Clean Removal** — Remove packages or completely uninstall with proper cleanup
- 🔄 **Auto-Updates** — Configure automatic updates for your dependency management tools
- 🎛️ **Flexible Configuration** — Customize behavior through config files or command-line options

## Why Launchpad?

Modern development requires managing dependencies at multiple levels - from system tools to project-specific requirements. Traditional approaches fall short:

**Traditional Package Managers (Homebrew, apt, etc.):**
- ❌ **Global conflicts** — Different projects need different versions
- ❌ **Slow operations** — Installing or updating can take minutes
- ❌ **Manual environment management** — Switching between project contexts is manual
- ❌ **PATH pollution** — All tools are globally available, causing conflicts

**Manual Dependency Management:**
- ❌ **Inconsistent setups** — Different team members have different environments
- ❌ **Complex PATH management** — Manual shell configuration is error-prone
- ❌ **Version drift** — Hard to maintain consistent tool versions
- ❌ **Platform differences** — Different setup procedures for each OS

**Launchpad's Solution:**
- ✅ **Unified Management** — Single tool for both system and project dependencies
- ✅ **Automatic Isolation** — Project environments activate automatically
- ✅ **Fast Operations** — Efficient package management with intelligent caching
- ✅ **Consistent Experience** — Same commands and behavior across all platforms
- ✅ **Smart Defaults** — Sensible installation paths and configuration out of the box

[Read more about why we created Launchpad](https://github.com/stacksjs/launchpad/tree/main/docs/why.md)

## Development

### Scripts

Launchpad includes several utility scripts for development and maintenance:

#### Dynamic PHP Version Management
```bash
# Get latest PHP versions from ts-pkgx registry
bun scripts/get-php-versions.ts

# Check if there are new PHP versions available
bun scripts/check-php-updates.ts

# These scripts:
# - Fetch latest PHP versions dynamically
# - Generates configuration descriptions
# - Check if rebuilds are needed
# - Output JSON for GitHub Actions
# - Create markdown tables for documentation
```

## Installation

Get started with Launchpad through your preferred package manager:

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

Launchpad is designed to handle both system setup and project management seamlessly! 🎯

### System Setup (First Time)

Bootstrap your development environment with everything you need:

```bash
# Complete system setup - installs to /usr/local by default
./launchpad bootstrap

# Or for a custom installation path
./launchpad bootstrap --path ~/.local --verbose

# Skip specific components if needed
./launchpad bootstrap --skip-bun --skip-shell-integration
```

The bootstrap command sets up your entire development foundation:

- ✅ Install Bun (JavaScript runtime)
- ✅ Configure your PATH automatically
- ✅ Set up shell integration for project auto-activation
- ✅ Provide clear next steps

### System-Wide Tool Management

Install and manage development tools across your entire system:

```bash
# Install essential development tools system-wide
launchpad install node python go rust

# Install specific versions
launchpad install node@22 python@3.12

# Install to /usr/local (default system-wide location)
launchpad install typescript --system

# Or specify any custom path
launchpad install docker --path /opt/tools

# Use shorthand for quick installs
launchpad i node@22 typescript@5.7
```

**Smart Installation Behavior:**
- **Default**: Installs to `/usr/local` if writable, otherwise `~/.local`
- **System-wide**: Use `--system` for explicit system installation (same as default)
- **Custom paths**: Use `--path <directory>` for any location
- **Automatic PATH**: Tools are immediately available in new shells

### Project Environment Management

Launchpad automatically manages project-specific dependencies:

```bash
# Create a project with dependencies
echo "dependencies:
  - node@22
  - typescript@5.7
  - bun@1.2" > dependencies.yaml

# Environment activates automatically when you enter the directory
cd my-project
# → ✅ Environment activated for /path/to/my-project

# Tools are available in project context
node --version  # Uses project-specific Node.js
tsc --version   # Uses project-specific TypeScript

# Leave project - environment deactivates automatically
cd ..
# → 🔄 Environment deactivated
```

**Supported Project Files:**
- `dependencies.yaml` / `dependencies.yml`
- `package.json` (Node.js projects)
- `pyproject.toml` (Python projects)
- `Cargo.toml` (Rust projects)
- And more...

### Environment Management

Manage your project environments with human-readable identifiers:

```bash
# List all development environments
launchpad env:list

# Inspect a specific environment
launchpad env:inspect my-project_1a2b3c4d

# Clean up old or failed environments
launchpad env:clean --dry-run

# Remove a specific environment
launchpad env:remove old-project_5e6f7g8h --force
```

**Environment Hash Format:** `{project-name}_{8-char-hex}`
- `final-project_7db6cf06` - Easy to identify and manage
- `working-test_208a31ec` - Human-readable project identification
- `my-app_1a2b3c4d` - Collision-resistant unique identifiers

### Package Management

Remove packages and manage your installation:

```bash
# Remove specific system tools
launchpad remove node python

# Remove project-specific versions (using uninstall command)
launchpad uninstall node@22

# See what would be removed
launchpad uninstall python --dry-run

# Complete system cleanup
launchpad clean --force
```

### Service Management

Manage development services with ease:

```bash
# Start essential development services
launchpad service start postgres redis

# Start multiple services at once
launchpad service start postgres redis nginx prometheus

# Check service status
launchpad service status postgres
launchpad service list

# Stop services when done
launchpad service stop postgres redis

# Enable auto-start for essential services
launchpad service enable postgres redis
```

**Available Services (31+):**
- **Databases**: PostgreSQL, MySQL, MongoDB, Redis, InfluxDB, CockroachDB, Neo4j, ClickHouse
- **Web Servers**: Nginx, Caddy
- **Message Queues**: Kafka, RabbitMQ, Apache Pulsar, NATS
- **Monitoring**: Prometheus, Grafana, Jaeger
- **Infrastructure**: Vault, Consul, etcd, MinIO, SonarQube, Temporal
- **Development & CI/CD**: Jenkins, LocalStack, Verdaccio
- **API & Backend**: Hasura, Keycloak
- **Caching**: Memcached, Elasticsearch

#### Configure services in deps.yaml

Add services to your dependency file to auto-start when the project environment activates:

```yaml
# deps.yaml
dependencies:
  - node@22
  - postgresql@15

services:
  enabled: true
  autoStart:
    - postgres
    - redis
```

#### Database Configuration

Customize database credentials for all database services:

```bash
# Configure database credentials globally
export LAUNCHPAD_DB_USERNAME="myuser"
export LAUNCHPAD_DB_PASSWORD="mypassword"
export LAUNCHPAD_DB_AUTH_METHOD="md5"  # PostgreSQL: trust|md5|scram-sha-256

# Start databases with custom credentials
launchpad service start postgres mysql
# Creates project-specific databases with your configured credentials
```

**Default Credentials** (secure for development):
- Username: `root`
- Password: `password`
- Auth Method: `trust` (PostgreSQL)

**Configuration Options:**
- Environment variables: `LAUNCHPAD_DB_USERNAME`, `LAUNCHPAD_DB_PASSWORD`, `LAUNCHPAD_DB_AUTH_METHOD`
- Config file: `launchpad.config.ts` → `services.database`
- Per-project databases automatically created with your credentials

### Advanced Operations

```bash
# Create executable shims
launchpad shim node@22 typescript@5.7

# List all installed packages
launchpad list

# Update packages
launchpad update node python --latest

# Cache management
launchpad cache:stats     # Show cache statistics
launchpad cache:clean     # Clean old cached packages
launchpad cache:clear     # Clear all cache

# Install additional tools
launchpad bootstrap  # Bootstrap essential tools
launchpad bun     # Install Bun runtime
```

## Configuration

Customize Launchpad's behavior for your system and projects:

```ts
import type { LaunchpadConfig } from '@stacksjs/launchpad'

const config: LaunchpadConfig = {
  // System-wide installation preferences
  installationPath: '/usr/local', // Default system location
  sudoPassword: '', // Password for sudo operations, can be loaded from `SUDO_PASSWORD` environment variable

  // Development environment settings
  devAware: true, // Enable dev-aware installations
  symlinkVersions: true, // Create version-specific symlinks
  forceReinstall: false, // Force reinstall if already installed

  // Operation settings
  verbose: true, // Detailed logging
  maxRetries: 3, // Retry failed operations
  timeout: 60000, // Operation timeout in milliseconds

  // PATH and shell integration
  shimPath: '~/.local/bin', // Custom shim location
  autoAddToPath: true, // Automatic PATH management

  // Shell message configuration
  showShellMessages: true,
  shellActivationMessage: '✅ Environment activated for {path}',
  shellDeactivationMessage: 'Environment deactivated',

  // Service management configuration
  services: {
    enabled: true, // Enable service management
    dataDir: '~/.local/share/launchpad/services', // Services data directory
    logDir: '~/.local/share/launchpad/logs', // Services log directory
    autoRestart: true, // Auto-restart failed services
    startupTimeout: 30, // Service startup timeout
    shutdownTimeout: 10, // Service shutdown timeout
  },

  // Registry and installation method
  useRegistry: true, // Use package registry
  installMethod: 'curl', // Installation method
  installPath: '/usr/local', // Installation path (same as installationPath)
}

export default config
```

See [Configuration Guide](https://github.com/stacksjs/launchpad/tree/main/docs/config.md) for all options.

## GitHub Action

Integrate Launchpad into your CI/CD workflows:

```yaml
- name: Setup Development Environment
  uses: stacksjs/launchpad-installer@v1
  with:
    packages: node@22 typescript@5.7 bun@1.2.14
```

See [GitHub Action Documentation](https://github.com/stacksjs/launchpad/tree/main/packages/action/README.md) for details.

## Advanced Usage

Explore advanced dependency management topics:

- [Service Management](https://github.com/stacksjs/launchpad/tree/main/docs/features/service-management.md)
- [Project Environment Configuration](https://github.com/stacksjs/launchpad/tree/main/docs/features/package-management.md)
- [Custom Shims and Tool Management](https://github.com/stacksjs/launchpad/tree/main/docs/advanced/custom-shims.md)
- [Cross-platform Compatibility](https://github.com/stacksjs/launchpad/tree/main/docs/advanced/cross-platform.md)
- [Performance Optimization](https://github.com/stacksjs/launchpad/tree/main/docs/advanced/performance.md)
- [API Reference](https://github.com/stacksjs/launchpad/tree/main/docs/api/reference.md)

## Comparing to Alternatives

### vs Traditional Package Managers (Homebrew, apt, yum)

- **🎯 Project Awareness**: Automatic project environment management vs manual setup
- **⚡ Speed**: Faster installations with intelligent caching
- **🔒 Isolation**: Project-specific versions vs global conflicts
- **🌍 Cross-Platform**: Consistent experience across all operating systems
- **⚙️ Service Management**: Built-in service management vs manual configuration

### vs Language-Specific Managers (nvm, pyenv, rbenv)

- **🔄 Unified Interface**: Single tool for all languages vs multiple managers
- **🤖 Automatic Switching**: Context-aware environment activation
- **📦 Broader Scope**: Manages system tools beyond just language runtimes
- **🛠️ Integrated Workflow**: Seamless integration between system and project dependencies

### vs Container-Based Solutions (Docker, devcontainers)

- **🚀 Lightweight**: Native performance without virtualization overhead
- **💻 System Integration**: Tools available in your native shell and IDE
- **🔧 Flexible**: Mix system-wide and project-specific tools as needed
- **⚡ Instant**: No container startup time or resource overhead
- **🎛️ Service Management**: Native service management without containers

## Changelog

Please see our [releases](https://github.com/stacksjs/launchpad/releases) page for information on changes.

## Contributing

Please see [CONTRIBUTING](https://github.com/stacksjs/contributing) for details.

## Community

For help or discussion:

- [Discussions on GitHub](https://github.com/stacksjs/launchpad/discussions)
- [Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

"Software that is free, but hopes for a postcard." We love receiving postcards from around the world showing where Stacks is being used! We showcase them on our website too.

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

The MIT License (MIT). Please see [LICENSE](LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@stacksjs/launchpad?style=flat-square
[npm-version-href]: https://npmjs.com/package/@stacksjs/launchpad
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/launchpad/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/launchpad/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/launchpad/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/launchpad -->
