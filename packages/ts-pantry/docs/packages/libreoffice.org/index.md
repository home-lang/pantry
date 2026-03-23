# LibreOffice

> A free and powerful office suite.

## Package Information

- **Domain**: `libreoffice.org`
- **Name**: `LibreOffice`
- **Homepage**: <https://libreoffice.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libreoffice.org/package.yml)

## Installation

```bash
# Install with pantry
pantry install libreoffice.org
```

## Programs

This package provides the following executable programs:

- `libreoffice`

## Aliases

This package can also be accessed using these aliases:

- `libreoffice`
- `soffice`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `24.8.5`, `24.8.4`

</details>

**Latest Version**: `24.8.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libreoffice.org@24.8.5 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libreoffice

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libreoffice.org/package.yml)
- [Homepage](https://libreoffice.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
