# Maccy

> A lightweight clipboard manager for macOS.

## Package Information

- **Domain**: `maccy.app`
- **Name**: `Maccy`
- **Homepage**: <https://maccy.app>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/maccy.app/package.yml)

## Installation

```bash
# Install with pantry
pantry install maccy.app
```

## Programs

This package provides the following executable programs:

- `maccy`

## Aliases

This package can also be accessed using these aliases:

- `maccy`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `2.4.0`
- `2.3.0`
- `2.2.0`

</details>

**Latest Version**: `2.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +maccy.app@2.4.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.maccy

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/maccy.app/package.yml)
- [Homepage](https://maccy.app)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
