# Scripts

Run scripts from `package.json` or `pantry.json` with support for arguments, filtering, parallelization, and watch mode.

## Overview

Pantry provides a powerful script runner compatible with npm/yarn/pnpm scripts:

- Run any script defined in `package.json` or `pantry.json`
- Pass arguments to scripts
- List all available scripts
- Common shortcuts (dev, test, build)
- Workspace filtering
- Parallel/sequential execution
- Watch mode
- Git-aware changed-only mode

## Quick Start

### Basic script execution

```json
{
  "scripts": {
    "dev": "bun run src/index.ts",
    "build": "bun build src/index.ts --outdir=dist",
    "test": "bun test"
  }
}
```

```bash
# Run a script
pantry run dev

# Pass arguments to script
pantry run test -- --watch

# Use shortcuts
pantry dev
pantry test
pantry build
```

### List available scripts

```bash
pantry scripts
# dev: bun run src/index.ts
# build: bun build src/index.ts --outdir=dist
# test: bun test
```

## Configuration

### In package.json

```json
{
  "name": "my-app",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "webpack --mode production",
    "test": "jest",
    "lint": "eslint src",
    "format": "prettier --write src"
  }
}
```

### In pantry.json

```json
{
  "name": "my-app",
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "build": "bun build src/index.ts",
    "test": "bun test",
    "deploy": "./scripts/deploy.sh"
  }
}
```

## Script Arguments

Pass arguments to scripts using `--`:

```bash
# Pass --watch to test
pantry run test -- --watch

# Pass multiple arguments
pantry run build -- --minify --sourcemap

# With shortcuts
pantry test -- --coverage
pantry dev -- --port 4000
```

## Common Shortcuts

Pantry provides shortcuts for common script names:

```bash
# Instead of: pantry run dev
pantry dev

# Instead of: pantry run test
pantry test

# Instead of: pantry run build
pantry build

# Instead of: pantry run start
pantry start
```

## Workspace Scripts

### Filter by workspace

```bash
# Run in specific workspaces
pantry run test --filter="packages/*"

# Run in specific package
pantry run build --filter="packages/core"
```

### Parallel execution

Run scripts in parallel across workspaces:

```bash
# Run build in parallel
pantry run build --parallel

# Run tests in parallel
pantry run test --parallel
```

### Sequential execution

Run scripts sequentially (default):

```bash
# Run one at a time
pantry run build

# Explicit sequential
pantry run build --sequential
```

## Watch Mode

Automatically re-run scripts on file changes:

```bash
# Watch and re-run on changes
pantry run dev --watch

# Watch specific patterns
pantry run build --watch --pattern="src/**/*.ts"
```

## Changed-Only Mode

Run scripts only in changed workspaces (git-aware):

```bash
# Run only in packages with changes
pantry run test --changed

# Since specific commit
pantry run test --changed --since=HEAD~3
```

## Examples

### Development workflow

```json
{
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "dev:debug": "bun run --inspect src/index.ts",
    "dev:prod": "NODE_ENV=production bun run src/index.ts"
  }
}
```

```bash
# Start dev server
pantry dev

# Debug mode
pantry run dev:debug

# Production mode
pantry run dev:prod
```

### Build pipeline

```json
{
  "scripts": {
    "clean": "rm -rf dist",
    "prebuild": "pantry run clean",
    "build": "bun build src/index.ts --outdir=dist",
    "postbuild": "cp package.json dist/",
    "build:watch": "bun build src/index.ts --outdir=dist --watch"
  }
}
```

```bash
# Full build with pre/post hooks
pantry build

# Watch mode
pantry run build:watch
```

### Testing

```json
{
  "scripts": {
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "test:unit": "bun test src/**/*.test.ts",
    "test:integration": "bun test tests/integration/**/_.test.ts"
  }
}
```

```bash
# Run all tests
pantry test

# Watch mode
pantry run test:watch

# Coverage report
pantry run test:coverage

# Specific test suites
pantry run test:unit
pantry run test:integration
```

### Code quality

```json
{
  "scripts": {
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write src",
    "format:check": "prettier --check src",
    "typecheck": "tsc --noEmit",
    "validate": "pantry run lint && pantry run format:check && pantry run typecheck && pantry run test"
  }
}
```

```bash
# Check code
pantry run lint
pantry run format:check
pantry run typecheck

# Fix issues
pantry run lint:fix
pantry run format

# Full validation
pantry run validate
```

### Monorepo scripts

```json
{
  "scripts": {
    "build": "bun build",
    "build:all": "pantry run build --filter=\"packages/_\" --parallel",
    "test": "bun test",
    "test:all": "pantry run test --filter=\"packages/_\"",
    "test:changed": "pantry run test --changed",
    "dev": "bun run --hot src/index.ts",
    "dev:all": "pantry run dev --filter=\"apps/_\" --parallel"
  }
}
```

```bash
# Build all packages in parallel
pantry run build:all

# Test all packages
pantry run test:all

# Test only changed packages
pantry run test:changed

# Run all apps in parallel
pantry run dev:all
```

## Environment Variables

Scripts have access to environment variables:

```json
{
  "scripts": {
    "start": "PORT=3000 node server.js",
    "dev": "NODE_ENV=development npm run start",
    "prod": "NODE_ENV=production npm run start"
  }
}
```

```bash
# Set environment variables
PORT=4000 pantry start

# Or use .env files (automatically loaded)
pantry dev
```

## Lifecycle Scripts

Pantry supports npm-style lifecycle scripts:

```json
{
  "scripts": {
    "preinstall": "echo 'Before install'",
    "install": "echo 'Installing'",
    "postinstall": "echo 'After install'",

    "pretest": "echo 'Before test'",
    "test": "bun test",
    "posttest": "echo 'After test'",

    "prebuild": "rm -rf dist",
    "build": "bun build src/index.ts",
    "postbuild": "cp package.json dist/"
  }
}
```

```bash
# Runs: pretest → test → posttest
pantry test

# Runs: prebuild → build → postbuild
pantry build
```

## Best Practices

### 1. Use descriptive script names

```json
{
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "dev:debug": "bun run --inspect src/index.ts",
    "dev:prod": "NODE_ENV=production bun run src/index.ts"
  }
}
```

### 2. Compose scripts

```json
{
  "scripts": {
    "clean": "rm -rf dist",
    "compile": "tsc",
    "bundle": "webpack",
    "build": "pantry run clean && pantry run compile && pantry run bundle"
  }
}
```

### 3. Use pre/post hooks

```json
{
  "scripts": {
    "pretest": "pantry run lint",
    "test": "bun test",
    "posttest": "pantry run coverage"
  }
}
```

### 4. Document complex scripts

```json
{
  "scripts": {
    "build:prod": "# Build for production with minification\nNODE_ENV=production webpack --mode production"
  }
}
```

### 5. Use parallel execution for independent tasks

```bash
# Fast parallel builds
pantry run build --parallel --filter="packages/*"
```

## Performance

Script execution is **extremely fast**:

- **Sub-millisecond startup** - Minimal overhead
- **Parallel execution** - Utilize all CPU cores
- **Smart caching** - Cache script metadata
- **Zero-copy** - Direct script execution

## Common Commands

```bash
# List all scripts
pantry scripts

# Run a script
pantry run dev

# Run with arguments
pantry run test -- --watch

# Use shortcuts
pantry dev
pantry test
pantry build

# Workspace filtering
pantry run build --filter="packages/*"

# Parallel execution
pantry run test --parallel

# Watch mode
pantry run dev --watch

# Changed only
pantry run test --changed
```

## Next Steps

- [Package Management](./package-management.md) - Install and manage packages
- [Runtime Management](./runtime-management.md) - Manage runtime versions
- [Workspaces](../advanced/workspaces.md) - Monorepo management
