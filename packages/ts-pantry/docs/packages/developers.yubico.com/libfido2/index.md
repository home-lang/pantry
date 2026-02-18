# fido2

> Provides library functionality for FIDO2, including communication with a device over USB or NFC.

## Package Information

- **Domain**: `developers.yubico.com/libfido2`
- **Name**: `fido2`
- **Homepage**: <https://developers.yubico.com/libfido2/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/developers.yubico.com/libfido2/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install developers.yubico.com/libfido2
```

## Programs

This package provides the following executable programs:

- `fido2-assert`
- `fido2-cred`
- `fido2-token`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.16.0`
- `1.15.0`
- `1.14.0`
- `1.13.0`

</details>

**Latest Version**: `1.16.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +developers.yubico.com/libfido2@1.16.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/PJK/libcbor@0`
- `openssl.org@1`
- `zlib.net@1`
- `linux:systemd.io`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.fido2

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/developers.yubico.com/libfido2/package.yml)
- [Homepage](https://developers.yubico.com/libfido2/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
