# WhatsApp

> A messaging app for simple, reliable, and private communication.

## Package Information

- **Domain**: `whatsapp.com`
- **Name**: `WhatsApp`
- **Homepage**: <https://whatsapp.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/whatsapp.com/package.yml)

## Installation

```bash
# Install with pantry
pantry install whatsapp.com
```

## Programs

This package provides the following executable programs:

- `whatsapp`

## Aliases

This package can also be accessed using these aliases:

- `whatsapp`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.24.25.0`, `2.24.24.0`

</details>

**Latest Version**: `2.24.25.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +whatsapp.com@2.24.25.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.whatsapp

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/whatsapp.com/package.yml)
- [Homepage](https://whatsapp.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
