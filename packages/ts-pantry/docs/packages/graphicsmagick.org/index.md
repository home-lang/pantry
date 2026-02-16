# gm

> Image processing tools collection

## Package Information

- **Domain**: `graphicsmagick.org`
- **Name**: `gm`
- **Homepage**: http://www.graphicsmagick.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/graphicsmagick.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install graphicsmagick.org
```

## Programs

This package provides the following executable programs:

- `gm`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `1.3.46`, `1.3.45`, `1.3.44`, `1.3.43`, `1.3.42`
- `1.3.40`

</details>

**Latest Version**: `1.3.46`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +graphicsmagick.org@1.3.46 -- $SHELL -i
```

## Dependencies

This package depends on:

- `freetype.org`
- `github.com/jasper-software/jasper`
- `libjpeg-turbo.org`
- `jpeg.org/jpegxl`
- `libpng.org`
- `simplesystems.org/libtiff`
- `gnu.org/libtool`
- `littlecms.com>=2.0`
- `google.com/webp`
- `sourceware.org/bzip2`
- `gnome.org/libxml2`
- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gm

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/graphicsmagick.org/package.yml)
- [Homepage](http://www.graphicsmagick.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
