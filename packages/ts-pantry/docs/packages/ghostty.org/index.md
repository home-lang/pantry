# Ghostty

> A fast, feature-rich, and cross-platform terminal emulator.

## Package Information

- **Domain**: `ghostty.org`
- **Name**: `Ghostty`
- **Homepage**: <https://ghostty.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ghostty.org/package.yml)

## Installation

```bash
# Install with pantry
pantry install ghostty.org
```

## Programs

This package provides the following executable programs:

- `ghostty`

## Aliases

This package can also be accessed using these aliases:

- `ghostty`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.1.0`
- `1.0.1`, `1.0.0`

</details>

**Latest Version**: `1.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ghostty.org@1.1.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ghostty

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ghostty.org/package.yml)
- [Homepage](https://ghostty.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
