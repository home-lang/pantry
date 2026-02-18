# gphoto2

> The libgphoto2 camera access and control library.

## Package Information

- **Domain**: `gphoto.org/libgphoto2`
- **Name**: `gphoto2`
- **Homepage**: http://www.gphoto.org/proj/libgphoto2/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gphoto.org/libgphoto2/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gphoto.org/libgphoto2
```

## Programs

This package provides the following executable programs:

- `gphoto2-config`
- `gphoto2-port-config`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `2.5.33`, `2.5.32`, `2.5.31`

</details>

**Latest Version**: `2.5.33`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gphoto.org/libgphoto2@2.5.33 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libgd.github.io^2.3`
- `libjpeg-turbo.org^2`
- `libexif.github.io^0.6`
- `gnu.org/libtool^2.4`
- `libusb.info/compat^0.1`
- `curl.se^8`
- `gnome.org/libxml2^2.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gphoto2

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gphoto.org/libgphoto2/package.yml)
- [Homepage](http://www.gphoto.org/proj/libgphoto2/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
