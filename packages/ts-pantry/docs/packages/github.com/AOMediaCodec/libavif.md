# avif

> libavif - Library for encoding and decoding .avif files

## Package Information

- **Domain**: `github.com/AOMediaCodec/libavif`
- **Name**: `avif`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/AOMediaCodec/libavif/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/AOMediaCodec/libavif
```

## Programs

This package provides the following executable programs:

- `avifenc`
- `avifdec`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `1.3.0`
- `1.2.1`, `1.2.0`
- `1.1.1`, `1.1.0`
- `1.0.4`, `1.0.3`, `1.0.2`, `1.0.1`, `1.0.0`
- `0.11.1`

</details>

**Latest Version**: `1.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/AOMediaCodec/libavif@1.3.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `aomedia.googlesource.com/aom^3`
- `libpng.org^1`
- `libjpeg-turbo.org^2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.avif

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/AOMediaCodec/libavif/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
