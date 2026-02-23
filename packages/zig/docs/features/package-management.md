# Package Management

Pantry provides lightning-fast package installation with smart dependency resolution and multiple package manager support.

## Overview

Pantry can read and manage dependencies from various package manager formats:

- `pantry.json` / `pantry.jsonc` - Native format
- `package.json` - npm/Node.js format
- `bun.lockb` - Bun lockfile
- `package-lock.json` - npm lockfile
- `yarn.lock` - Yarn lockfile
- `pnpm-lock.yaml` - pnpm lockfile

## Installation

### Install packages

```bash
# Install from current directory
pantry install

# Install specific packages
pantry install react vue lodash

# Install globally
pantry install -g typescript prettier eslint
```

### Add packages

```bash
# Add package to dependencies
pantry add react

# Add with specific version
pantry add react@18.2.0
```

### Remove packages

```bash
# Remove package
pantry remove lodash

# Remove multiple packages
pantry remove lodash axios moment
```

### Update packages

```bash
# Update all packages
pantry update

# Update specific package
pantry update react
```

## Configuration

### pantry.json

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "18.2.0",
    "vue": "3.3.0",
    "lodash": "4.17.21"
  },
  "devDependencies": {
    "typescript": "5.0.0",
    "vite": "4.0.0"
  }
}
```

### package.json

Pantry is fully compatible with `package.json`:

```json
{
  "name": "my-project",
  "dependencies": {
    "express": "^4.18.0",
    "postgres": "^3.3.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

## Version Pinning

Pin exact versions for reproducible builds:

```json
{
  "dependencies": {
    "react": "18.2.0",
    "vue": "3.3.4"
  }
}
```

## Workspace Support

Pantry supports monorepos with workspace configuration:

```json
{
  "name": "my-monorepo",
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

See [Workspaces](../advanced/workspaces.md) for more details.

## Custom Registries

Install packages from custom registries:

```bash
# Configure custom registry
pantry config set registry https://registry.mycompany.com

# Install from custom registry
pantry install my-private-package
```

See [Custom Registries](../advanced/custom-registries.md) for more details.

## Package Publishing

Publish your packages to npm or custom registries:

```bash
# Publish to npm
pantry publish

# Publish to custom registry
pantry publish --registry https://registry.mycompany.com
```

## Commit Publishing

Publish packages directly from git commits without version bumps. This is pantry's built-in alternative to `pkg-pr-new`.

### Publish from a Commit

```bash
# Publish all packages matching a glob pattern
pantry publish:commit './packages/*'

# Publish a single package directory
pantry publish:commit ./my-package

# Preview without actually publishing
pantry publish:commit './packages/*' --dry-run

# Custom registry
pantry publish:commit './packages/*' --registry https://registry.example.com

# Compact output for CI
pantry publish:commit './packages/*' --compact
```

### How It Works

1. Reads the current git commit SHA via `git rev-parse HEAD`
2. Resolves glob patterns to discover package directories
3. Reads `package.json` from each directory, skipping private packages
4. Creates tarballs and uploads to the Pantry registry under `commits/{sha}/`
5. Stores metadata in DynamoDB for fast lookup
6. Prints install URLs for each published package

### Install URLs

Each published commit package gets an install URL:

```bash
npm install https://registry.stacksjs.org/commits/abc1234/@scope/package/tarball
```

### CI/CD Integration

Replace `pkg-pr-new` in your GitHub Actions:

```yaml
# Before
- run: bunx pkg-pr-new publish './packages/*'

# After
- run: pantry publish:commit './packages/*'
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--registry` | Registry URL | `https://registry.stacksjs.org` |
| `--token` | Auth token (or `PANTRY_TOKEN` env) | |
| `--dry-run` | Preview without publishing | `false` |
| `--compact` | Minimal CI-friendly output | `false` |

## Best Practices

### 1. Use lockfiles for reproducibility

Always commit your lockfiles (`bun.lockb`, `package-lock.json`, etc.) to ensure consistent installs across environments.

### 2. Pin important dependencies

For critical dependencies, use exact versions instead of ranges:

```json
{
  "dependencies": {
    "express": "4.18.2"
  }
}
```

### 3. Separate dev and production dependencies

```json
{
  "dependencies": {
    "express": "4.18.2"
  },
  "devDependencies": {
    "jest": "29.5.0",
    "typescript": "5.0.0"
  }
}
```

### 4. Regular updates

Keep dependencies up to date:

```bash
# Check for outdated packages
pantry outdated

# Update packages
pantry update
```

## Performance

Pantry's package installation is **20-50x faster** than npm, yarn, and pnpm:

- **Concurrent downloads** - Parallel package fetching
- **Smart caching** - Aggressive caching with 1-hour TTL
- **Optimized extraction** - Fast tarball extraction
- **Zero-copy reads** - Lock-free cache access

See [Performance](../advanced/performance.md) for benchmarks.

## Common Commands

```bash
# List installed packages
pantry list

# Show why a package is installed
pantry why lodash

# Check for security vulnerabilities
pantry audit

# Clean node_modules
pantry clean

# Initialize new project
pantry init
```

## Next Steps

- [Runtime Management](./runtime-management.md) - Manage runtime versions (bun, node, deno, python)
- [Scripts](./scripts.md) - Run scripts from package.json
- [Services](./services.md) - Manage background services
