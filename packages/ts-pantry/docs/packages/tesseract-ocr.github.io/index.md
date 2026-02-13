# tesseract

> Tesseract Open Source OCR Engine (main repository)

## Package Information

- **Domain**: `tesseract-ocr.github.io`
- **Name**: `tesseract`
- **Homepage**: https://github.com/tesseract-ocr/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/tesseract-ocr.github.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install tesseract-ocr.github.io
```

## Programs

This package provides the following executable programs:

- `tesseract`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `5.5.2`, `5.5.1`, `5.5.0`, `5.4.1`, `5.4.0`
- `5.3.4`, `5.3.3`, `5.3.2`, `5.3.1`, `5.3.0`

</details>

**Latest Version**: `5.5.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +tesseract-ocr.github.io@5.5.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `cairographics.org@1`
- `unicode.org@71`
- `leptonica.org`
- `libarchive.org`
- `gnome.org/pango@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tesseract

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/tesseract-ocr.github.io/package.yml)
- [Homepage](https://github.com/tesseract-ocr/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
