# yubikey-manager

> Python library and command line tool for configuring any YubiKey over all USB interfaces.

## Package Information

- **Domain**: `developers.yubico.com/yubikey-manager`
- **Name**: `yubikey-manager`
- **Homepage**: https://developers.yubico.com/yubikey-manager/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/developers.yubico.com/yubikey-manager/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install developers.yubico.com/yubikey-manager
```

## Programs

This package provides the following executable programs:

- `ykman`

## Available Versions

<details>
<summary>Show all 12 versions</summary>

- `5.9.0`, `5.8.0`, `5.7.2`, `5.7.1`, `5.7.0`
- `5.6.1`, `5.6.0`, `5.5.1`, `5.5.0`, `5.4.0`
- `5.3.0`, `5.2.1`

</details>

**Latest Version**: `5.9.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +developers.yubico.com/yubikey-manager@5.9.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.11`
- `linux:pcsclite.apdu.fr^2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['yubikey-manager']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/developers.yubico.com/yubikey-manager/package.yml)
- [Homepage](https://developers.yubico.com/yubikey-manager/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
