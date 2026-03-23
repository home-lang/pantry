# Telegram

> A cloud-based messaging app with a focus on speed and security.

## Package Information

- **Domain**: `telegram.org`
- **Name**: `Telegram`
- **Homepage**: <https://telegram.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/telegram.org/package.yml)

## Installation

```bash
# Install with pantry
pantry install telegram.org
```

## Programs

This package provides the following executable programs:

- `telegram`

## Aliases

This package can also be accessed using these aliases:

- `telegram`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `5.8.0`
- `5.7.0`

</details>

**Latest Version**: `5.8.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +telegram.org@5.8.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.telegram

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/telegram.org/package.yml)
- [Homepage](https://telegram.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
