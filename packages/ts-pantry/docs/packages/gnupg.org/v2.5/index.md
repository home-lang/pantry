# v2.5

> Package from pantry: gnupg.org/v2.5

## Package Information

- **Domain**: `gnupg.org/v2.5`
- **Name**: `v2.5`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/v2.5/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnupg.org/v2.5
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `zlib.net^1.1`
- `sourceware.org/bzip2`
- `gnupg.org/npth`
- `gnupg.org/libgpg-error`
- `gnupg.org/libksba`
- `gnupg.org/libassuan@3`
- `gnupg.org/libgcrypt^1.11`
- `gnupg.org/pinentry`
- `gnutls.org^3`
- `openldap.org^2`
- `gnu.org/readline^8`
- `sqlite.org^3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['v2.5']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/v2.5/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
