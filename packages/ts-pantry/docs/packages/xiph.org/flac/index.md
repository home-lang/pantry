# flac

> Free Lossless Audio Codec

## Package Information

- **Domain**: `xiph.org/flac`
- **Name**: `flac`
- **Homepage**: https://xiph.org/flac/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/xiph.org/flac/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install xiph.org/flac
```

## Programs

This package provides the following executable programs:

- `flac`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.5.0`, `1.4.3`, `1.4.2`

</details>

**Latest Version**: `1.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +xiph.org/flac@1.5.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `xiph.org/ogg^1.3.5`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.flac

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/xiph.org/flac/package.yml)
- [Homepage](https://xiph.org/flac/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
