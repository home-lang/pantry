# libgd.github

> Graphics library to dynamically manipulate images

## Package Information

- **Domain**: `libgd.github.io`
- **Name**: `libgd.github`
- **Homepage**: https://libgd.github.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libgd.github.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libgd.github.io
```

## Programs

This package provides the following executable programs:

- `bdftogd`
- `gd2copypal`
- `gd2togif`
- `gdcmpgif`
- `giftogd2`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.3.3`

</details>

**Latest Version**: `2.3.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libgd.github.io@2.3.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `freedesktop.org/fontconfig`
- `freetype.org`
- `libjpeg-turbo.org`
- `github.com/AOMediaCodec/libavif`
- `libpng.org`
- `simplesystems.org/libtiff`
- `google.com/webp`
- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['libgd.github']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libgd.github.io/package.yml)
- [Homepage](https://libgd.github.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
