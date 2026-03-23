# Transmit

> A file transfer client for macOS.

## Package Information

- **Domain**: `transmit.panic.com`
- **Name**: `Transmit`
- **Homepage**: <https://panic.com/transmit>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/transmit.panic.com/package.yml)

## Installation

```bash
# Install with pantry
pantry install transmit.panic.com
```

## Programs

This package provides the following executable programs:

- `transmit`

## Aliases

This package can also be accessed using these aliases:

- `transmit`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `5.10.7`, `5.10.6`

</details>

**Latest Version**: `5.10.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +transmit.panic.com@5.10.7 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.transmit

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/transmit.panic.com/package.yml)
- [Homepage](https://panic.com/transmit)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
