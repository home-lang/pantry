# ccache

> Object-file caching compiler wrapper

## Package Information

- **Domain**: `ccache.dev`
- **Name**: `ccache`
- **Homepage**: <https://ccache.dev/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ccache.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ccache.dev
```

## Programs

This package provides the following executable programs:

- `ccache`

## Available Versions

<details>
<summary>Show all 14 versions</summary>

- `4.12.3`, `4.12.2`, `4.12.1`, `4.12.0`
- `4.11.3`, `4.11.2`, `4.11.1`, `4.11.0`
- `4.10.2`, `4.10.1`, `4.10.0`
- `4.9.1`, `4.9.0`
- `4.8.3`

</details>

**Latest Version**: `4.12.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ccache.dev@4.12.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/redis/hiredis`
- `facebook.com/zstd`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ccache

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ccache.dev/package.yml)
- [Homepage](https://ccache.dev/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
