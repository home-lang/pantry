# Commit Publishing

pantry includes a built-in `publish:commit` command for publishing packages from git commits to the Pantry registry. This is a native, high-performance alternative to [`pkg-pr-new`](https://github.com/stackblitz-labs/pkg.pr.new) — enabling continuous releases tied to commits rather than semver versions.

## Overview

Commit publishing lets you:

- Publish packages from any git commit without bumping versions
- Share installable URLs for pull request reviews
- Test unreleased changes in downstream projects
- Automatically discover and publish all packages in a monorepo

## Quick Start

```bash
# Publish all packages matching a glob pattern
pantry publish:commit './packages/*'

# Publish a single package
pantry publish:commit ./my-package
```

Each published package gets an install URL:

```
https://registry.stacksjs.org/commits/abc1234/@scope/my-package/tarball
```

## Usage

### Basic Publishing

```bash
# Publish packages from the current commit
pantry publish:commit './packages/*'
```

pantry will:

1. Read the current git commit SHA (`git rev-parse HEAD`)
2. Resolve the glob pattern to find package directories
3. Read `package.json` from each directory
4. Skip private packages (`"private": true`)
5. Create tarballs and upload them to the registry
6. Print install URLs for each published package

### Monorepo Support

The glob pattern resolves multiple package directories at once:

```bash
# Publish all packages in packages/
pantry publish:commit './packages/*'

# Publish all packages in a specific directory
pantry publish:commit './storage/framework/core/*'

# Publish a single package
pantry publish:commit ./my-package
```

Private packages (those with `"private": true` in `package.json`) are automatically skipped.

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--registry <url>` | Registry URL to publish to | `https://registry.stacksjs.org` |
| `--token <token>` | Authentication token | `PANTRY_TOKEN` env var |
| `--dry-run` | Preview what would be published without uploading | `false` |
| `--compact` | Minimal output suitable for CI environments | `false` |

### Examples

```bash
# Preview what would be published
pantry publish:commit './packages/*' --dry-run

# Use a custom registry
pantry publish:commit './packages/*' --registry https://registry.example.com

# Authenticate with a token
pantry publish:commit './packages/*' --token my-secret-token

# Compact CI output
pantry publish:commit './packages/*' --compact
```

## CI/CD Integration

### GitHub Actions

Replace `pkg-pr-new` in your workflows:

```yaml
# Before (using pkg-pr-new)
- name: Publish Commit
  run: bunx pkg-pr-new publish './storage/framework/core/*'

# After (using pantry)
- name: Publish Commit
  run: pantry publish:commit './storage/framework/core/*'
  env:
    PANTRY_TOKEN: ${{ secrets.PANTRY_TOKEN }}
```

### Full Workflow Example

```yaml
name: Publish Commit Packages

on:
  pull_request:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Dependencies
        uses: stacksjs/pantry-installer@v1

      - name: Publish Commit Packages
        run: pantry publish:commit './packages/*'
        env:
          PANTRY_TOKEN: ${{ secrets.PANTRY_TOKEN }}
```

## Installing Commit Packages

Published commit packages can be installed using standard package managers:

```bash
# Install via npm/bun/yarn/pnpm
npm install https://registry.stacksjs.org/commits/abc1234/@scope/package/tarball

# Or for unscoped packages
npm install https://registry.stacksjs.org/commits/abc1234/my-package/tarball
```

## Registry API

The Pantry registry provides these endpoints for commit packages:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/publish/commit` | Publish packages from a commit |
| `GET` | `/commits/{sha}` | List all packages for a commit |
| `GET` | `/commits/{sha}/{name}` | Get commit package metadata |
| `GET` | `/commits/{sha}/{name}/tarball` | Download the tarball |

### Querying Commit Packages

```bash
# List all packages for a commit
curl https://registry.stacksjs.org/commits/abc1234

# Get metadata for a specific package
curl https://registry.stacksjs.org/commits/abc1234/@scope/my-package
```

## Architecture

### Storage

- **Tarballs**: Stored in S3 under `commits/{sha}/{safeName}/{safeName}.tgz`
- **Metadata**: DynamoDB with dual key patterns:
  - `COMMIT#{sha}` / `PACKAGE#{name}` — look up packages by commit
  - `COMMIT_PACKAGE#{name}` / `SHA#{sha}` — look up commits by package
- **Expiry**: Commit packages automatically expire after 90 days via S3 lifecycle rules

### Package Name Sanitization

Scoped package names are sanitized for S3 keys:

- `@scope/name` becomes `scope-name`
- Unscoped names are used as-is

## Comparison with pkg-pr-new

| Feature | pantry publish:commit | pkg-pr-new |
|---------|----------------------|------------|
| Runtime | Native Zig binary | Node.js (bunx) |
| Monorepo support | Built-in glob patterns | Built-in |
| Private package skipping | Automatic | Automatic |
| Custom registry | `--registry` flag | Limited |
| Authentication | Token-based | GitHub-based |
| Package expiry | 90-day automatic | Varies |
| Install URL format | Registry-based | Custom CDN |
| CI integration | Drop-in replacement | GitHub Action |

## Troubleshooting

### Authentication Errors

Ensure your token is set:

```bash
export PANTRY_TOKEN=your-token
pantry publish:commit './packages/*'

# Or pass directly
pantry publish:commit './packages/*' --token your-token
```

### No Packages Found

Check that your glob pattern matches directories containing `package.json`:

```bash
# Preview what would be published
pantry publish:commit './packages/*' --dry-run
```

### Git SHA Not Found

The command requires a git repository. Ensure you're in a git repo:

```bash
git rev-parse HEAD  # Should print the current SHA
```
