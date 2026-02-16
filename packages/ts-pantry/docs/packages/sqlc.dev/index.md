# sqlc

> Generate type-safe code from SQL

## Package Information

- **Domain**: `sqlc.dev`
- **Name**: `sqlc`
- **Homepage**: https://sqlc.dev/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sqlc.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sqlc.dev
```

## Programs

This package provides the following executable programs:

- `sqlc`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.30.0`, `1.29.0`, `1.28.0`, `1.27.0`

</details>

**Latest Version**: `1.30.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sqlc.dev@1.30.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sqlc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sqlc.dev/package.yml)
- [Homepage](https://sqlc.dev/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
