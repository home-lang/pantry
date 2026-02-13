# libpq

> Package from pantry: postgresql.org/libpq

## Package Information

- **Domain**: `postgresql.org/libpq`
- **Name**: `libpq`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/postgresql.org/libpq/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install postgresql.org/libpq
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `kerberos.org`
- `openssl.org^1.1`
- `zlib.net^1`
- `unicode.org^71`
- `linux:gnu.org/readline`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libpq

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/postgresql.org/libpq/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
