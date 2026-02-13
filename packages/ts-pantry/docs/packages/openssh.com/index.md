# openssh.com

> Package from pantry: openssh.com

## Package Information

- **Domain**: `openssh.com`
- **Name**: `openssh.com`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openssh.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openssh.com
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `nlnetlabs.nl/ldns`
- `developers.yubico.com/libfido2`
- `openssl.org`
- `kerberos.org`
- `thrysoee.dk/editline`
- `github.com/besser82/libxcrypt`
- `zlib.net`
- `linux:linux-pam.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['openssh.com']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openssh.com/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
