# smi

> Library to Access SMI MIB Information

## Package Information

- **Domain**: `ibr.cs.tu-bs.de/libsmi`
- **Name**: `smi`
- **Homepage**: <https://www.ibr.cs.tu-bs.de/projects/libsmi/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ibr.cs.tu-bs.de/libsmi/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ibr.cs.tu-bs.de/libsmi
```

## Programs

This package provides the following executable programs:

- `smidiff`
- `smidump`
- `smilint`
- `smiquery`
- `smixlate`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.4.8`

</details>

**Latest Version**: `0.4.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ibr.cs.tu-bs.de/libsmi@0.4.8 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.smi

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ibr.cs.tu-bs.de/libsmi/package.yml)
- [Homepage](https://www.ibr.cs.tu-bs.de/projects/libsmi/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
