# srgn

> A grep-like tool which understands source code syntax and allows for manipulation in addition to search

## Package Information

- **Domain**: `crates.io/srgn`
- **Name**: `srgn`
- **Homepage**: https://crates.io/crates/srgn/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/srgn/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/srgn
```

## Programs

This package provides the following executable programs:

- `srgn`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.10.0`

</details>

**Latest Version**: `0.10.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/srgn@0.10.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.srgn

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/srgn/package.yml)
- [Homepage](https://crates.io/crates/srgn/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
