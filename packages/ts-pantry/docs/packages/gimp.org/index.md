# GIMP

> A free and open-source raster graphics editor.

## Package Information

- **Domain**: `gimp.org`
- **Name**: `GIMP`
- **Homepage**: <https://gimp.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gimp.org/package.yml)

## Installation

```bash
# Install with pantry
pantry install gimp.org
```

## Programs

This package provides the following executable programs:

- `gimp`

## Aliases

This package can also be accessed using these aliases:

- `gimp`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.10.38`, `2.10.36`

</details>

**Latest Version**: `2.10.38`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gimp.org@2.10.38 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gimp

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gimp.org/package.yml)
- [Homepage](https://gimp.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
