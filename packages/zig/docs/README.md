# Pantry Documentation

Welcome to Pantry - a lightning-fast universal package and environment manager written in Zig.

## Getting Started

- **[Installation](#installation)** - Get Pantry installed
- **[Quick Start](#quick-start)** - Start using Pantry in 5 minutes
- **[Features Overview](#features)** - What Pantry can do

## Features

Core functionality and guides:

- **[Package Management](./features/package-management.md)** - Install, add, remove, and update packages
- **[Runtime Management](./features/runtime-management.md)** - Manage Bun, Node, Deno, Python versions per project
- **[Services](./features/services.md)** - Auto-start databases, caches, and web servers
- **[Scripts](./features/scripts.md)** - Run scripts from package.json with arguments and filtering
- **[Shell Integration](./features/shell-integration.md)** - Automatic environment activation on `cd`
- **[Environments](./features/environments.md)** - Isolated per-project environments with caching

## Advanced

Deep dives and advanced topics:

- **[Caching](./advanced/caching.md)** - Two-tier cache system for sub-microsecond performance
- **[Workspaces](./advanced/workspaces.md)** - Monorepo support with parallel execution
- **[Custom Registries](./advanced/custom-registries.md)** - Use private npm registries
- **[Performance](./advanced/performance.md)** - Optimization techniques and internals
- **[Architecture](./advanced/architecture.md)** - System design and implementation details

## API Reference

Complete API documentation:

- **[CLI Commands](./api/cli-commands.md)** - All available commands
- **[Configuration](./api/configuration.md)** - pantry.json reference
- **[Environment Variables](./api/environment-variables.md)** - Available environment variables
- **[Exit Codes](./api/exit-codes.md)** - Command exit codes

## Benchmarks

- **[Performance Comparisons](./benchmarks.md)** - Pantry vs npm, yarn, pnpm, Bun

---

## Installation

### From source

```bash
git clone https://github.com/yourusername/pantry
cd pantry/packages/zig
zig build -Doptimize=ReleaseFast
sudo cp zig-out/bin/pantry /usr/local/bin/
```

### Shell integration

```bash
pantry shell:integrate
```

This adds hooks to your shell RC file for automatic environment activation.

---

## Quick Start

### 1. Create a project

```bash
mkdir my-app
cd my-app
```

### 2. Create pantry.json

```json
{
  "name": "my-app",
  "dependencies": {
    "bun": "1.3.0",
    "react": "18.2.0"
  },
  "scripts": {
    "dev": "bun run src/index.ts",
    "build": "bun build src/index.ts"
  }
}
```

### 3. Install dependencies

```bash
pantry install
# 🔧 Setting up environment
# 📦 Installing bun@1.3.0
# 📦 Installing react@18.2.0
# ✅ Environment ready: my-app
```

### 4. Run scripts

```bash
pantry run dev
# or
pantry dev
```

That's it! Pantry automatically:

- ✅ Installed Bun 1.3.0
- ✅ Installed React 18.2.0
- ✅ Created isolated environment
- ✅ Activated environment with correct PATH

---

## Features

### 🚀 Lightning Fast

**20-50x faster** than npm, yarn, pnpm:

- Sub-microsecond cache lookups (<50μs)
- Concurrent package downloads
- Lock-free cache operations
- Zero-copy networking

### 📦 Universal Package Manager

Install from multiple sources:

- npm registry
- Custom registries
- Git repositories
- Local packages

Supports all formats:

- `pantry.json` / `pantry.jsonc`
- `package.json`
- `bun.lockb`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`

### 🔧 Runtime Version Management

Pin runtime versions per project:

```json
{
  "dependencies": {
    "bun": "1.3.0",
    "node": "20.10.0",
    "python": "3.11.0",
    "deno": "1.40.0"
  }
}
```

Pantry automatically:

- Downloads correct versions
- Activates on `cd` into project
- Updates PATH with highest priority
- Caches for instant subsequent activations

### 🛠️ Service Management

Auto-start services per project:

```json
{
  "services": {
    "postgres": true,
    "redis": {
      "autoStart": true,
      "port": 6379
    }
  }
}
```

31 pre-configured services:

- Databases: postgres, mysql, mongodb, redis
- Web servers: nginx, apache, caddy
- Infrastructure: rabbitmq, kafka, elasticsearch
- And more...

### 🐚 Smart Shell Integration

Automatic environment activation:

- Detects directory changes
- Activates correct runtime versions
- Updates PATH automatically
- Starts configured services

Works with:

- zsh
- bash
- fish

### ⚡ Aggressive Caching

Two-tier cache system:

- **Fast cache**: 8 entries, <50μs lookup
- **Slow cache**: Disk-based, ~1ms lookup
- **1-hour TTL**: No unnecessary revalidation
- **mtime tracking**: Instant invalidation on file changes

### 🏢 Workspace Support

Full monorepo support:

```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

Features:

- Parallel execution
- Changed-only filtering
- Dependency linking
- Shared dependencies

---

## Why Pantry

### vs npm/yarn/pnpm

- **20-50x faster** for all operations
- **Sub-microsecond** cached activations
- **Runtime version management** built-in
- **Service auto-start** per project
- **Smaller binary** (3.2MB vs 45-80MB)
- **Lower memory** (<10MB vs 80-200MB)

### vs Bun

- **15-60x faster** for cached operations
- **More complete** package management
- **Service management** built-in
- **Better shell integration**
- **Smaller binary** (3.2MB vs 60-80MB)
- **Lower memory** (<10MB vs 80-120MB)

### vs asdf/nvm

- **Unified tool** for packages + runtimes
- **Faster** version switching (<50μs vs ~100ms)
- **Project-based** automatic activation
- **Service management** included
- **Package installation** built-in

---

## Community

- **GitHub**: [github.com/yourusername/pantry](https://github.com/yourusername/pantry)
- **Issues**: [Report bugs](https://github.com/yourusername/pantry/issues)
- **Discussions**: [Ask questions](https://github.com/yourusername/pantry/discussions)

---

## License

MIT License - see [LICENSE](../LICENSE) for details.

---

## Next Steps

**New users**:

1. [Installation](#installation) - Get Pantry installed
2. [Quick Start](#quick-start) - Create your first project
3. [Package Management](./features/package-management.md) - Learn package commands

**Migrating**:

1. [From npm/yarn](./guides/migrating-from-npm.md) - Migration guide
2. [From Bun](./guides/migrating-from-bun.md) - Migration guide

**Advanced users**:

1. [Caching](./advanced/caching.md) - Cache optimization
2. [Workspaces](./advanced/workspaces.md) - Monorepo setup
3. [Performance](./advanced/performance.md) - Performance tuning
