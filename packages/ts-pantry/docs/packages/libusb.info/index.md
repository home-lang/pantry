# libusb.info

> A cross-platform library to access USB devices

## Package Information

- **Domain**: `libusb.info`
- **Name**: `libusb.info`
- **Homepage**: https://libusb.info
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libusb.info/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libusb.info
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.0.29`, `1.0.28`, `1.0.27`, `1.0.26`

</details>

**Latest Version**: `1.0.29`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libusb.info@1.0.29 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['libusb.info']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libusb.info/package.yml)
- [Homepage](https://libusb.info)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
