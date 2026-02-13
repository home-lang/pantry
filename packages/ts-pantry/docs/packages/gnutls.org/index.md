# gnutls.org

> Package from pantry: gnutls.org

## Package Information

- **Domain**: `gnutls.org`
- **Name**: `gnutls.org`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnutls.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnutls.org
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `freedesktop.org/p11-kit`
- `gnu.org/libidn2`
- `gnu.org/libunistring^1`
- `gnu.org/libtasn1^4`
- `gnu.org/nettle`
- `gnu.org/gettext`
- `gnu.org/gmp`
- `unbound.net^1`
- `curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['gnutls.org']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnutls.org/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
