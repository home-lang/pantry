# bind9

> Package from pantry: isc.org/bind9

## Package Information

- **Domain**: `isc.org/bind9`
- **Name**: `bind9`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/isc.org/bind9/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install isc.org/bind9
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `gnome.org/libxml2@2.13`
- `nghttp2.org@1.57`
- `libuv.org@1.49`
- `liburcu.org@0.15`
- `openldap.org/liblmdb@0.9`
- `openssl.org@1.1`
- `gnu.org/readline@8.2`
- `github.com/json-c/json-c@0.18`
- `gnu.org/libidn2@2.3`
- `jemalloc.net@5`
- `mesonbuild.com@1`
- `ninja-build.org`
- `linux:kernel.org/libcap`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.bind9

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/isc.org/bind9/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
