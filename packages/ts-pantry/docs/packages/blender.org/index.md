# Blender

> A free and open-source 3D creation suite.

## Package Information

- **Domain**: `blender.org`
- **Name**: `Blender`
- **Homepage**: <https://blender.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/blender.org/package.yml)

## Installation

```bash
# Install with pantry
pantry install blender.org
```

## Programs

This package provides the following executable programs:

- `blender`

## Aliases

This package can also be accessed using these aliases:

- `blender`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `4.3.2`, `4.3.1`

</details>

**Latest Version**: `4.3.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +blender.org@4.3.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.blender

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/blender.org/package.yml)
- [Homepage](https://blender.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
