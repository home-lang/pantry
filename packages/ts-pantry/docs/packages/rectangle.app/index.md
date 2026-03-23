# Rectangle

> A window management app for macOS based on Spectacle.

## Package Information

- **Domain**: `rectangle.app`
- **Name**: `Rectangle`
- **Homepage**: <https://rectangleapp.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rectangle.app/package.yml)

## Installation

```bash
# Install with pantry
pantry install rectangle.app
```

## Programs

This package provides the following executable programs:

- `rectangle`

## Aliases

This package can also be accessed using these aliases:

- `rectangle`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.83`
- `0.82`
- `0.81`

</details>

**Latest Version**: `0.83`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rectangle.app@0.83 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rectangle

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rectangle.app/package.yml)
- [Homepage](https://rectangleapp.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
