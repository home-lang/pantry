# The Unarchiver

> A multi-format archive decompressor for macOS.

## Package Information

- **Domain**: `the-unarchiver.com`
- **Name**: `The Unarchiver`
- **Homepage**: <https://theunarchiver.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/the-unarchiver.com/package.yml)

## Installation

```bash
# Install with pantry
pantry install the-unarchiver.com
```

## Programs

This package provides the following executable programs:

- `unar`
- `lsar`

## Aliases

This package can also be accessed using these aliases:

- `the-unarchiver`
- `unar`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `5.7.3`, `5.7.2`

</details>

**Latest Version**: `5.7.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +the-unarchiver.com@5.7.3 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['the-unarchiver']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/the-unarchiver.com/package.yml)
- [Homepage](https://theunarchiver.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
