# imagemagick

> ImageMagick is a powerful, open-source software suite for creating, editing, converting, and manipulating images in over 200 formats. Ideal for web developers, graphic designers, and researchers, it offers versatile tools for image processing, including batch processing, format conversion, and complex image transformations.

## Package Information

- **Domain**: `imagemagick.org`
- **Name**: `imagemagick`
- **Homepage**: https://imagemagick.org/index.php
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/imagemagick.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install imagemagick.org
```

## Programs

This package provides the following executable programs:

- `animate`
- `compare`
- `composite`
- `conjure`
- `convert`
- `display`
- `identify`
- `import`
- `magick`
- `magick-script`
- `Magick++-config`
- `MagickCore-config`
- `MagickWand-config`
- `mogrify`
- `montage`
- `stream`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `7.1.1.27`, `7.1.1.12`, `7.1.0.61`

</details>

**Latest Version**: `7.1.1.27`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +imagemagick.org@7.1.1.27 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.imagemagick

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/imagemagick.org/package.yml)
- [Homepage](https://imagemagick.org/index.php)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
