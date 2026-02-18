# mozjpeg

> Improved JPEG encoder.

## Package Information

- **Domain**: `mozilla.org/mozjpeg`
- **Name**: `mozjpeg`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mozilla.org/mozjpeg/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mozilla.org/mozjpeg
```

## Programs

This package provides the following executable programs:

- `cjpeg`
- `djpeg`
- `jpegtran`
- `rdjpgcom`
- `tjbench`
- `wrjpgcom`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `4.0.3`

</details>

**Latest Version**: `4.0.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mozilla.org/mozjpeg@4.0.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libpng.org^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mozjpeg

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mozilla.org/mozjpeg/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
