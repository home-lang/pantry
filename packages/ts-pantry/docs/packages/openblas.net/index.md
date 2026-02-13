# openblas

> OpenBLAS is an optimized BLAS library based on GotoBLAS2 1.13 BSD version.

## Package Information

- **Domain**: `openblas.net`
- **Name**: `openblas`
- **Homepage**: http://www.openblas.net
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openblas.net/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openblas.net
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `0.3.31`, `0.3.30`, `0.3.29`, `0.3.28`, `0.3.27`
- `0.3.26`, `0.3.25`, `0.3.24`, `0.3.23`

</details>

**Latest Version**: `0.3.31`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +openblas.net@0.3.31 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.openblas

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openblas.net/package.yml)
- [Homepage](http://www.openblas.net)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
