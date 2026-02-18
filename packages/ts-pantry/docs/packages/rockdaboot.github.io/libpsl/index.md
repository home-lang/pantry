# libpsl

> C library for the Public Suffix List

## Package Information

- **Domain**: `rockdaboot.github.io/libpsl`
- **Name**: `libpsl`
- **Homepage**: <https://rockdaboot.github.io/libpsl>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rockdaboot.github.io/libpsl/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rockdaboot.github.io/libpsl
```

## Programs

This package provides the following executable programs:

No programs specified.

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.21.5`, `0.21.2`

</details>

**Latest Version**: `0.21.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rockdaboot.github.io/libpsl@0.21.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `unicode.org^71`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libpsl

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rockdaboot.github.io/libpsl/package.yml)
- [Homepage](https://rockdaboot.github.io/libpsl)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
