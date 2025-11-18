# Environment Management

Pantry creates isolated, per-project environments with automatic dependency management and intelligent caching.

## Overview

Each project gets its own isolated environment based on:
- Project dependencies
- Runtime versions
- Configuration hash

Environments are:
- **Hash-based** - Unique identifier per configuration
- **Cached** - 1-hour TTL for instant reactivation
- **Automatic** - Created and managed transparently
- **Isolated** - No dependency conflicts between projects

## How It Works

### Environment creation

When you enter a project directory:

1. **Detection** - Pantry finds dependency files:
   - `pantry.json`, `pantry.jsonc`
   - `package.json`
   - Lockfiles (`bun.lockb`, `package-lock.json`, etc.)

2. **Hashing** - Computes MD5 hash of dependencies
   - Includes runtime versions
   - Includes package versions
   - Unique hash per configuration

3. **Cache lookup** - Checks if environment exists:
   - Fast cache (8 most recent, <50μs)
   - Slow cache (disk, ~1ms)
   - 1-hour TTL on cached entries

4. **Environment setup** - If not cached:
   - Creates `~/.pantry/envs/{hash}/`
   - Installs runtimes to `~/.pantry/runtimes/`
   - Installs packages to `{project}/pantry_modules/`
   - Caches environment metadata

5. **Activation** - Updates shell:
   - Exports environment variables
   - Updates PATH
   - Starts configured services

### Environment structure

```
~/.pantry/
├── envs/
│   ├── abc123def456/
│   │   ├── bin/           # Environment binaries
│   │   ├── metadata.json  # Environment info
│   │   └── mtime          # Dependency file timestamp
│   └── fed456cba321/
│       └── ...
└── runtimes/
    ├── bun/1.3.0/
    ├── node/20.10.0/
    └── python/3.11.0/
```

## Environment Lifecycle

### Creation

```bash
cd my-project
# 🔧 Setting up environment...
# 📦 Installing bun@1.3.0...
# 📦 Installing dependencies...
# ✅ Environment ready: my-project (abc123)
```

### Reactivation (cached)

```bash
cd ..
cd my-project
# ✅ Environment ready: my-project (abc123)
# <50μs activation time
```

### Update (dependency change)

```bash
vim pantry.json  # Change version
cd .
# 🔄 Dependencies changed, updating environment...
# 📦 Processing updates from pantry.json
# ✅ Environment updated (def456)
# New hash: def456cba321
```

### Cleanup

Environments are automatically cleaned when:
- Not used for >1 hour
- Cache is full
- Manual cleanup command

## Commands

### List environments

```bash
pantry env:list
```

Output:
```
📦 Development Environments

Hash: abc123def456
Project: /Users/you/projects/my-app
Created: 2024-01-15 10:30:45
Last Used: 2024-01-15 14:22:13
Dependencies: pantry.json (modified 2024-01-15 10:30:00)

Hash: fed456cba321
Project: /Users/you/projects/other-app
Created: 2024-01-14 09:15:22
Last Used: 2024-01-15 12:10:08
Dependencies: package.json (modified 2024-01-14 09:15:00)

Total: 2 environments
```

### Remove environment

```bash
# Remove by hash
pantry env:remove abc123def456

# Remove by project path
pantry env:remove /Users/you/projects/my-app
```

### Clean environments

```bash
# Remove all unused environments
pantry env:clean

# Remove environments older than X days
pantry env:clean --older-than=7
```

## Caching Strategy

### Two-tier cache

**Fast cache** (Ring buffer):
- 8 most recent environments
- L1 cache optimized
- <50μs lookup
- In-memory only

**Slow cache** (Disk):
- All environments
- ~1ms lookup
- Persisted to disk
- Survives restarts

### Cache invalidation

Cache is invalidated when:
- Dependency file modified (mtime check)
- TTL expires (1 hour)
- Manual cache clear
- Environment removed

### TTL behavior

```bash
# First activation
cd my-project  # 100-500ms (create environment)

# Within 1 hour
cd my-project  # <50μs (cached)
cd my-project  # <50μs (cached)
cd my-project  # <50μs (cached)

# After 1 hour
cd my-project  # <1ms (revalidate)

# After dependency change
vim pantry.json
cd my-project  # 100-300ms (update environment)
```

## Environment Isolation

### Per-project isolation

Each project gets its own environment:

```bash
# Project A
cd ~/projects/app-a
which bun
# /Users/you/.pantry/runtimes/bun/1.3.0/bin/bun

# Project B
cd ~/projects/app-b
which bun
# /Users/you/.pantry/runtimes/bun/1.3.1/bin/bun
```

### Dependency isolation

Projects with same dependencies share runtimes but have separate package installs:

```
Project A (bun 1.3.0, react 18.2.0)
└── Uses: ~/.pantry/runtimes/bun/1.3.0/
└── Packages: ~/projects/app-a/pantry_modules/

Project B (bun 1.3.0, react 18.3.0)
└── Uses: ~/.pantry/runtimes/bun/1.3.0/ (shared!)
└── Packages: ~/projects/app-b/pantry_modules/
```

## Examples

### Basic project

```json
{
  "name": "basic-app",
  "dependencies": {
    "bun": "1.3.0",
    "react": "18.2.0"
  }
}
```

Environment hash: Based on `bun@1.3.0` + `react@18.2.0`

### Multiple runtimes

```json
{
  "name": "full-stack-app",
  "dependencies": {
    "node": "20.10.0",
    "python": "3.11.0",
    "bun": "1.3.0"
  }
}
```

Environment hash: Based on all three runtime versions

### With services

```json
{
  "name": "backend-app",
  "dependencies": {
    "node": "20.10.0"
  },
  "services": {
    "postgres": true,
    "redis": true
  }
}
```

Environment includes service configuration in hash

## Best Practices

### 1. Commit dependency files

Always commit your dependency files:

```bash
git add pantry.json package.json bun.lockb
git commit -m "Lock dependencies"
```

### 2. Use lockfiles

Lockfiles ensure reproducible environments:

```bash
# Generate lockfile
pantry install

# Commit lockfile
git add bun.lockb
```

### 3. Regular cache cleanup

Clean old environments periodically:

```bash
# Weekly cleanup
pantry env:clean --older-than=7
```

### 4. Check environment status

Verify environment setup:

```bash
pantry env:list
env | grep PANTRY_
```

### 5. Pin runtime versions

Use exact runtime versions for reproducibility:

```json
{
  "dependencies": {
    "bun": "1.3.0",
    "node": "20.10.0"
  }
}
```

## Environment Variables

Pantry exports these variables:

```bash
# Current project directory
PANTRY_CURRENT_PROJECT="/path/to/project"

# Environment bin directory
PANTRY_ENV_BIN_PATH="/Users/you/.pantry/envs/abc123/bin"

# Environment root directory
PANTRY_ENV_DIR="/Users/you/.pantry/envs/abc123"

# Updated PATH
PATH="runtime:project:env:$PATH"
```

## Performance

Environment operations are **extremely fast**:

| Operation | Time | Notes |
|-----------|------|-------|
| Hash computation | <1ms | MD5 of dependencies |
| Fast cache lookup | <50μs | Ring buffer (8 entries) |
| Slow cache lookup | ~1ms | Disk read |
| Environment creation | 100-500ms | Runtime + package install |
| Environment activation | <100μs | PATH update + env vars |
| mtime check | <1ms | File stat |

## Troubleshooting

### Environment not activating

```bash
# Check if dependency file exists
ls pantry.json package.json

# Check environment cache
pantry env:list

# Clear cache and retry
pantry cache:clear
cd .
```

### Wrong environment activated

```bash
# Check current environment
env | grep PANTRY_

# Check environment hash
pantry env:list

# Remove old environment
pantry env:remove abc123
cd .
```

### Environment won't update

```bash
# Force cache clear
pantry cache:clear

# Remove environment
pantry env:remove $(basename $PWD)

# Reactivate
cd .
```

### Disk space issues

```bash
# Check environment disk usage
du -sh ~/.pantry/envs/*

# Clean old environments
pantry env:clean --older-than=7

# Remove specific environment
pantry env:remove abc123def456
```

## Next Steps

- [Runtime Management](./runtime-management.md) - Understand runtime versioning
- [Caching](../advanced/caching.md) - Deep dive into cache strategies
- [Performance](../advanced/performance.md) - Optimization techniques
