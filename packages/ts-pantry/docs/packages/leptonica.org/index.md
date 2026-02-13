# leptonica

> Leptonica is an open source library containing software that is broadly useful for image processing and image analysis applications. The official github repository for Leptonica is: danbloomberg/leptonica. See leptonica.org for more documentation.

## Package Information

- **Domain**: `leptonica.org`
- **Name**: `leptonica`
- **Homepage**: http://www.leptonica.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/leptonica.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install leptonica.org
```

## Programs

This package provides the following executable programs:

- `convertfilestopdf`
- `convertfilestops`
- `convertformat`
- `convertsegfilestopdf`
- `convertsegfilestops`
- `converttopdf`
- `converttops`
- `fileinfo`
- `imagetops`
- `xtractprotos`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `1.87.0`, `1.86.0`, `1.85.0`, `1.84.1`, `1.84.0`
- `1.83.1`

</details>

**Latest Version**: `1.87.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +leptonica.org@1.87.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `giflib.sourceforge.io@5`
- `libjpeg-turbo.org@2`
- `libpng.org@1`
- `simplesystems.org/libtiff@4`
- `openjpeg.org`
- `google.com/webp`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.leptonica

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/leptonica.org/package.yml)
- [Homepage](http://www.leptonica.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
