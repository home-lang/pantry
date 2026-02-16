# oras

> OCI registry client - managing content like artifacts, images, packages

## Package Information

- **Domain**: `oras.land`
- **Name**: `oras`
- **Homepage**: <https://oras.land>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/oras.land/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install oras.land
```

## Programs

This package provides the following executable programs:

- `oras`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `1.3.0`, `1.2.3`, `1.2.2`, `1.2.1`, `1.2.0`

</details>

**Latest Version**: `1.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +oras.land@1.3.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.oras

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/oras.land/package.yml)
- [Homepage](https://oras.land)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
