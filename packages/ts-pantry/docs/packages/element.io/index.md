# Element

> A decentralized, encrypted messaging and collaboration client built on Matrix.

## Package Information

- **Domain**: `element.io`
- **Name**: `Element`
- **Homepage**: <https://element.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/element.io/package.yml)

## Installation

```bash
# Install with pantry
pantry install element.io
```

## Programs

This package provides the following executable programs:

- `element`

## Aliases

This package can also be accessed using these aliases:

- `element`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `1.11.86`, `1.11.85`

</details>

**Latest Version**: `1.11.86`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +element.io@1.11.86 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.element

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/element.io/package.yml)
- [Homepage](https://element.io)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
