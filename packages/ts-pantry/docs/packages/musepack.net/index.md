# musepack

> Audio compression format and tools

## Package Information

- **Domain**: `musepack.net`
- **Name**: `musepack`
- **Homepage**: <https://www.musepack.net/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/musepack.net/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install musepack.net
```

## Programs

This package provides the following executable programs:

- `mpc2sv8`
- `mpcchap`
- `mpccut`
- `mpcdec`
- `mpcenc`
- `mpcgain`
- `wavcmp`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `475.0.0`

</details>

**Latest Version**: `475.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +musepack.net@475.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `musepack.net/libreplaygain`
- `musepack.net/libcuefile`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.musepack

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/musepack.net/package.yml)
- [Homepage](https://www.musepack.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
