# Workspaces

Pantry provides first-class support for monorepos with workspace management, allowing you to manage multiple packages in a single repository.

## Overview

Workspaces enable:
- **Multiple packages** in one repository
- **Shared dependencies** across packages
- **Parallel operations** for faster builds
- **Filtering** to run commands on specific packages
- **Dependency linking** between workspace packages

## Configuration

### workspace.json

Create a `workspace.json` at the repository root:

```json
{
  "name": "my-monorepo",
  "workspaces": [
    "packages/*",
    "apps/*",
    "tools/*"
  ]
}
```

### package.json

Or use `package.json` with workspaces field:

```json
{
  "name": "my-monorepo",
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

## Project Structure

```
my-monorepo/
├── workspace.json
├── packages/
│   ├── core/
│   │   ├── package.json
│   │   └── src/
│   ├── utils/
│   │   ├── package.json
│   │   └── src/
│   └── ui/
│       ├── package.json
│       └── src/
├── apps/
│   ├── web/
│   │   ├── package.json
│   │   └── src/
│   └── mobile/
│       ├── package.json
│       └── src/
└── pantry_modules/     # Shared dependencies
```

## Commands

### Install all workspace dependencies

```bash
# From workspace root
pantry install

# Installs dependencies for all workspace packages
# Links workspace packages together
```

### Run commands in workspaces

```bash
# Run in all workspaces
pantry run build

# Run in specific workspace
pantry run build --filter="packages/core"

# Run in multiple workspaces
pantry run test --filter="packages/*"

# Run in specific app
pantry run dev --filter="apps/web"
```

### Parallel execution

```bash
# Build all packages in parallel
pantry run build --parallel

# Test all packages in parallel
pantry run test --parallel --filter="packages/*"
```

### Sequential execution

```bash
# Build packages one at a time (default)
pantry run build --sequential

# Useful when builds depend on each other
pantry run build --filter="packages/*" --sequential
```

### Changed-only mode

```bash
# Run only in packages with git changes
pantry run test --changed

# Since specific commit
pantry run test --changed --since=HEAD~3

# Since main branch
pantry run test --changed --since=origin/main
```

## Examples

### Simple monorepo

**workspace.json**:
```json
{
  "name": "simple-mono",
  "workspaces": [
    "packages/*"
  ]
}
```

**packages/core/package.json**:
```json
{
  "name": "@my-org/core",
  "version": "1.0.0",
  "dependencies": {
    "lodash": "4.17.21"
  }
}
```

**packages/ui/package.json**:
```json
{
  "name": "@my-org/ui",
  "version": "1.0.0",
  "dependencies": {
    "@my-org/core": "workspace:*",
    "react": "18.2.0"
  }
}
```

```bash
# Install all dependencies
pantry install

# ui will link to local core package
# Both share lodash from workspace root
```

### Full-stack monorepo

**workspace.json**:
```json
{
  "name": "full-stack-mono",
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

**packages/shared/package.json**:
```json
{
  "name": "@my-org/shared",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  }
}
```

**packages/api-client/package.json**:
```json
{
  "name": "@my-org/api-client",
  "dependencies": {
    "@my-org/shared": "workspace:*"
  },
  "scripts": {
    "build": "tsc",
    "test": "jest"
  }
}
```

**apps/web/package.json**:
```json
{
  "name": "@my-org/web",
  "dependencies": {
    "@my-org/shared": "workspace:*",
    "@my-org/api-client": "workspace:*",
    "react": "18.2.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  }
}
```

```bash
# Build all packages
pantry run build --parallel

# Run web app (with linked packages)
pantry run dev --filter="apps/web"

# Test everything
pantry run test --parallel
```

### Scoped packages

**workspace.json**:
```json
{
  "name": "@my-org/monorepo",
  "workspaces": [
    "packages/*"
  ]
}
```

**packages/logger/package.json**:
```json
{
  "name": "@my-org/logger",
  "version": "1.0.0"
}
```

**packages/config/package.json**:
```json
{
  "name": "@my-org/config",
  "version": "1.0.0",
  "dependencies": {
    "@my-org/logger": "workspace:*"
  }
}
```

## Workspace Linking

### Automatic linking

Pantry automatically links workspace packages:

```json
{
  "dependencies": {
    "@my-org/core": "workspace:*"
  }
}
```

Links to `packages/core` instead of npm registry.

### Version ranges

```json
{
  "dependencies": {
    "@my-org/core": "workspace:^1.0.0"
  }
}
```

Links if version matches, otherwise fetches from registry.

### Protocol syntax

```json
{
  "dependencies": {
    "@my-org/core": "workspace:*",      // Always link
    "@my-org/utils": "workspace:^",     // Link with caret range
    "@my-org/helpers": "workspace:~"    // Link with tilde range
  }
}
```

## Filtering

### By path pattern

```bash
# All packages
pantry run build --filter="packages/*"

# Specific package
pantry run test --filter="packages/core"

# Multiple patterns
pantry run lint --filter="packages/*" --filter="apps/*"
```

### By name pattern

```bash
# Packages with specific prefix
pantry run build --filter="@my-org/*"

# Specific package by name
pantry run test --filter="@my-org/core"
```

### By dependency

```bash
# Packages that depend on core
pantry run test --filter="...@my-org/core"

# Packages that core depends on
pantry run build --filter="@my-org/core..."

# Full dependency graph
pantry run test --filter="...@my-org/core..."
```

## Parallel vs Sequential

### When to use parallel

**Parallel execution** (`--parallel`):
- Independent packages
- No build order requirements
- Tests that don't conflict
- Faster execution

```bash
# Fast parallel builds
pantry run build --parallel

# Parallel tests
pantry run test --parallel
```

### When to use sequential

**Sequential execution** (default):
- Packages with build dependencies
- Tests that share resources
- Operations that must complete in order

```bash
# Sequential builds (default)
pantry run build

# Explicit sequential
pantry run build --sequential
```

## Changed Detection

### Git-aware filtering

Run commands only in changed packages:

```bash
# Since last commit
pantry run test --changed

# Since specific commit
pantry run build --changed --since=HEAD~5

# Since branch
pantry run test --changed --since=origin/main
```

### How it works

1. Runs `git diff` to find changed files
2. Maps changed files to workspace packages
3. Filters commands to only affected packages
4. Includes packages that depend on changed packages

### Example workflow

```bash
# Make changes in packages/core
vim packages/core/src/index.ts

# Test only affected packages
pantry run test --changed

# Runs tests in:
# - packages/core (changed)
# - packages/ui (depends on core)
# - apps/web (depends on core)
```

## Scripts in Workspaces

### Root-level scripts

**workspace.json**:
```json
{
  "name": "monorepo",
  "workspaces": ["packages/*"],
  "scripts": {
    "build:all": "pantry run build --parallel",
    "test:all": "pantry run test --parallel",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

```bash
# Run root-level scripts
pantry run build:all
pantry run test:all
```

### Package-level scripts

**packages/core/package.json**:
```json
{
  "name": "@my-org/core",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "dev": "tsc --watch"
  }
}
```

```bash
# Run in specific package
pantry run build --filter="packages/core"
```

## Dependency Management

### Shared dependencies

Dependencies installed at workspace root are shared:

```
my-monorepo/
├── workspace.json
├── pantry_modules/      # Shared dependencies
│   ├── lodash/
│   ├── react/
│   └── ...
└── packages/
    ├── core/
    └── ui/
```

### Package-specific dependencies

Packages can have their own dependencies:

```
packages/core/
├── package.json
└── pantry_modules/      # Core-specific dependencies
    └── ...
```

### Hoisting

Pantry hoists dependencies to workspace root when possible:

```json
// packages/core/package.json
{
  "dependencies": {
    "lodash": "4.17.21"
  }
}

// packages/ui/package.json
{
  "dependencies": {
    "lodash": "4.17.21"    // Same version - hoisted to root
  }
}
```

Result:
```
my-monorepo/
├── pantry_modules/
│   └── lodash/          # Shared by both packages
└── packages/
    ├── core/
    └── ui/
```

## Best Practices

### 1. Use consistent naming

```json
{
  "workspaces": [
    "packages/*",         // Libraries
    "apps/*",             // Applications
    "tools/*"             // Build tools
  ]
}
```

### 2. Scope package names

```json
{
  "name": "@my-org/package-name"
}
```

### 3. Use workspace protocol

```json
{
  "dependencies": {
    "@my-org/core": "workspace:*"
  }
}
```

### 4. Organize by type

```
monorepo/
├── packages/     # Shared libraries
├── apps/         # Applications
├── tools/        # Build tools
└── docs/         # Documentation
```

### 5. Parallel when possible

```bash
# Fast builds
pantry run build --parallel

# Fast tests
pantry run test --parallel
```

### 6. Filter aggressively

```bash
# Don't rebuild everything
pantry run build --changed

# Only test affected packages
pantry run test --filter="packages/*"
```

## Performance

### Parallel execution speedup

| Packages | Sequential | Parallel | Speedup |
|----------|------------|----------|---------|
| 5 | 25s | 6s | 4.2x |
| 10 | 48s | 11s | 4.4x |
| 20 | 95s | 22s | 4.3x |
| 50 | 240s | 55s | 4.4x |

**Result**: ~4x faster with parallel execution

### Changed-only filtering

| Packages | All | Changed | Speedup |
|----------|-----|---------|---------|
| 10 | 48s | 12s | 4x |
| 20 | 95s | 19s | 5x |
| 50 | 240s | 38s | 6.3x |

**Result**: 4-6x faster with changed filtering

## Troubleshooting

### Workspace not detected

```bash
# Check workspace.json exists at root
ls workspace.json

# Or check package.json has workspaces
cat package.json | grep workspaces

# Verify glob patterns match
ls packages/*/package.json
```

### Package not linking

```bash
# Check workspace protocol
cat package.json | grep "workspace:"

# Reinstall
pantry install

# Check links
ls -la pantry_modules/@my-org/
```

### Build order issues

```bash
# Use sequential build
pantry run build --sequential

# Or specify order manually
pantry run build --filter="packages/core"
pantry run build --filter="packages/ui"
```

## Next Steps

- [Package Management](../features/package-management.md) - Package installation
- [Scripts](../features/scripts.md) - Running scripts
- [Performance](./performance.md) - Optimization techniques
