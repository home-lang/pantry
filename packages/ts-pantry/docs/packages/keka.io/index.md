# Keka

> A file archiver for macOS.

## Package Information

- **Domain**: `keka.io`
- **Name**: `Keka`
- **Homepage**: <https://keka.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/keka.io/package.yml)

## Installation

```bash
# Install with pantry
pantry install keka.io
```

## Programs

This package provides the following executable programs:

- `keka`

## Aliases

This package can also be accessed using these aliases:

- `keka`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `1.4.7`, `1.4.6`

</details>

**Latest Version**: `1.4.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +keka.io@1.4.7 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.keka

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/keka.io/package.yml)
- [Homepage](https://keka.io)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
