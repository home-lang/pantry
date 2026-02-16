# idevicedate

> A cross-platform protocol library to communicate with iOS devices

## Package Information

- **Domain**: `libimobiledevice.org`
- **Name**: `idevicedate`
- **Homepage**: <https://www.libimobiledevice.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libimobiledevice.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libimobiledevice.org
```

## Programs

This package provides the following executable programs:

- `idevicedate`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `1.4.0`, `1.3.0`

</details>

**Latest Version**: `1.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libimobiledevice.org@1.4.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libimobiledevice.org/libplist^2.4`
- `libimobiledevice.org/libtatsu^1`
- `libimobiledevice.org/libimobiledevice-glue^1.3`
- `gnu.org/libtasn1^4.19`
- `libimobiledevice.org/libusbmuxd^2`
- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.idevicedate

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libimobiledevice.org/package.yml)
- [Homepage](https://www.libimobiledevice.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
