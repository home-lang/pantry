# Commit Publishing

Publish packages directly from git commits without version bumps. This is pantry's built-in native alternative to `pkg-pr-new`.

## Quick Start

```bash
# Publish all packages from current commit
pantry publish:commit './packages/*'

# Single package
pantry publish:commit ./my-package

# Dry run
pantry publish:commit './packages/*' --dry-run
```

## How It Works

1. Reads the current git commit SHA
2. Resolves glob patterns to find package directories
3. Reads `package.json` from each, skipping private packages
4. Creates tarballs and uploads to the Pantry registry
5. Stores metadata in DynamoDB for commit/package lookups
6. Prints install URLs for each published package

## Install URLs

```bash
npm install https://registry.stacksjs.org/commits/abc1234/@scope/package/tarball
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--registry <url>` | Registry URL | `https://registry.stacksjs.org` |
| `--token <token>` | Auth token (or `PANTRY_TOKEN` env) | |
| `--dry-run` | Preview without publishing | `false` |
| `--compact` | Minimal CI output | `false` |

## CI/CD Integration

Replace `pkg-pr-new` in GitHub Actions:

```yaml
# Before
- run: bunx pkg-pr-new publish './packages/*'

# After
- run: pantry publish:commit './packages/*'
  env:
    PANTRY_TOKEN: ${{ secrets.PANTRY_TOKEN }}
```

## Storage

- **S3**: Tarballs under `commits/{sha}/{safeName}/{safeName}.tgz`
- **DynamoDB**: Dual key patterns for commit-to-packages and package-to-commits lookups
- **Expiry**: 90-day automatic cleanup via S3 lifecycle rules

## Next Steps

- [Package Management](./package-management.md) - Standard package publishing
- [Custom Registries](../advanced/custom-registries.md) - Use your own registry
