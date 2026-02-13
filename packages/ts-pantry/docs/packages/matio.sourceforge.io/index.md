# libmatio

> C library for reading and writing MATLAB MAT files

## Package Information

- **Domain**: `matio.sourceforge.io`
- **Name**: `libmatio`
- **Homepage**: https://matio.sourceforge.net/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/matio.sourceforge.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install matio.sourceforge.io
```

## Programs

This package provides the following executable programs:

- `matdump`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `1.5.30`, `1.5.29`, `1.5.28`, `1.5.27`, `1.5.26`
- `1.5.25`, `1.5.24`, `1.5.23`

</details>

**Latest Version**: `1.5.30`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +matio.sourceforge.io@1.5.30 -- $SHELL -i
```

## Dependencies

This package depends on:

- `hdfgroup.org/HDF5`
- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libmatio

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/matio.sourceforge.io/package.yml)
- [Homepage](https://matio.sourceforge.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
