# Inkscape

> A professional vector graphics editor.

## Package Information

- **Domain**: `inkscape.org`
- **Name**: `Inkscape`
- **Homepage**: <https://inkscape.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/inkscape.org/package.yml)

## Installation

```bash
# Install with pantry
pantry install inkscape.org
```

## Programs

This package provides the following executable programs:

- `inkscape`

## Aliases

This package can also be accessed using these aliases:

- `inkscape`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `1.4.1`, `1.4`

</details>

**Latest Version**: `1.4.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +inkscape.org@1.4.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.inkscape

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/inkscape.org/package.yml)
- [Homepage](https://inkscape.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
