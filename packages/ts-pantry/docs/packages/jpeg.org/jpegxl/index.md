# jpegxl

> JPEG XL image format reference implementation

## Package Information

- **Domain**: `jpeg.org/jpegxl`
- **Name**: `jpegxl`
- **Homepage**: <https://jpeg.org/jpegxl/index.html>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/jpeg.org/jpegxl/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install jpeg.org/jpegxl
```

## Programs

This package provides the following executable programs:

- `cjxl`
- `djxl`
- `jxlinfo`

## Available Versions

<details>
<summary>Show all 18 versions</summary>

- `0.11.1`, `0.11.0`
- `0.10.4`, `0.10.3`, `0.10.2`, `0.10.1`, `0.10.0`
- `0.9.4`, `0.9.3`, `0.9.2`, `0.9.1`, `0.9.0`
- `0.8.4`, `0.8.3`, `0.8.2`, `0.8.1`
- `0.7.2`, `0.7.1`

</details>

**Latest Version**: `0.11.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +jpeg.org/jpegxl@0.11.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `github.com/google/brotli^1`
- `littlecms.com^2.13`
- `google.com/highway^1`
- `google.com/webp^1`
- `giflib.sourceforge.io^5`
- `openexr.com^3`
- `libpng.org^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.jpegxl

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/jpeg.org/jpegxl/package.yml)
- [Homepage](https://jpeg.org/jpegxl/index.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
