# guil

> GNU Ubiquitous Intelligent Language for Extensions

## Package Information

- **Domain**: `gnu.org/guile`
- **Name**: `guil`
- **Homepage**: <https://www.gnu.org/software/guile/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/guile/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/guile
```

## Programs

This package provides the following executable programs:

- `guild`
- `guile`
- `guile-config`
- `guile-snarf`
- `guile-tools`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `3.0.11`, `3.0.10`, `3.0.9`

</details>

**Latest Version**: `3.0.11`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/guile@3.0.11 -- $SHELL -i
```

## Dependencies

This package depends on:

- `hboehm.info/gc^8`
- `gnu.org/gmp^6`
- `gnu.org/libtool^2`
- `gnu.org/libunistring^1`
- `freedesktop.org/pkg-config^0.29 # guile-config is a wrapper around pkg-config.`
- `gnu.org/readline^8`
- `gnu.org/gperf^3`
- `sourceware.org/libffi^3`
- `github.com/besser82/libxcrypt^4`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.guil

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/guile/package.yml)
- [Homepage](https://www.gnu.org/software/guile/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
