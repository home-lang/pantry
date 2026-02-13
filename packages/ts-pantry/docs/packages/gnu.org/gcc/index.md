# gcc

> Package from pantry: gnu.org/gcc

## Package Information

- **Domain**: `gnu.org/gcc`
- **Name**: `gcc`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gcc/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/gcc
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `gnu.org/binutils`
- `gnu.org/gmp>=4.2`
- `gnu.org/mpfr>=2.4.0`
- `gnu.org/mpc>=0.8.0`
- `zlib.net^1.3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gcc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gcc/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
