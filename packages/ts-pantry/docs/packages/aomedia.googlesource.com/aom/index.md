# aom

> Codec library for encoding and decoding AV1 video streams

## Package Information

- **Domain**: `aomedia.googlesource.com/aom`
- **Name**: `aom`
- **Homepage**: <https://aomedia.googlesource.com/aom>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/aomedia.googlesource.com/aom/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install aomedia.googlesource.com/aom
```

## Programs

This package provides the following executable programs:

- `aomenc`
- `aomdec`

## Available Versions

<details>
<summary>Show all 17 versions</summary>

- `3.13.1`, `3.13.0`
- `3.12.1`, `3.12.0`
- `3.11.0`
- `3.10.0`
- `3.9.1`, `3.9.0`
- `3.8.3`, `3.8.2`, `3.8.1`, `3.8.0`
- `3.7.2`, `3.7.1`, `3.7.0`
- `3.6.1`
- `3.5.0`

</details>

**Latest Version**: `3.13.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +aomedia.googlesource.com/aom@3.13.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.aom

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/aomedia.googlesource.com/aom/package.yml)
- [Homepage](https://aomedia.googlesource.com/aom)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
