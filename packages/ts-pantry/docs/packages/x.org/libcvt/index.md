# cvt

> VESA CVT standard timing modelines generator

## Package Information

- **Domain**: `x.org/libcvt`
- **Name**: `cvt`
- **Homepage**: <https://www.x.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/x.org/libcvt/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install x.org/libcvt
```

## Programs

This package provides the following executable programs:

- `cvt`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.1.3`, `0.1.2`

</details>

**Latest Version**: `0.1.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +x.org/libcvt@0.1.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `x.org/x11^1`
- `x.org/exts`
- `x.org/protocol`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cvt

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/x.org/libcvt/package.yml)
- [Homepage](https://www.x.org)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
