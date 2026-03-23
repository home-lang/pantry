# CleanShot X

> A screen capture and recording tool for macOS.

## Package Information

- **Domain**: `cleanshot.com`
- **Name**: `CleanShot X`
- **Homepage**: <https://cleanshot.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/cleanshot.com/package.yml)

## Installation

```bash
# Install with pantry
pantry install cleanshot.com
```

## Programs

This package provides the following executable programs:

- `cleanshot`

## Aliases

This package can also be accessed using these aliases:

- `cleanshot`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `4.7.4`, `4.7.3`, `4.7.2`

</details>

**Latest Version**: `4.7.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +cleanshot.com@4.7.4 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cleanshot

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/cleanshot.com/package.yml)
- [Homepage](https://cleanshot.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
