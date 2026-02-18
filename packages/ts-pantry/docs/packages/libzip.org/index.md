# zip

> A C library for reading, creating, and modifying zip archives.

## Package Information

- **Domain**: `libzip.org`
- **Name**: `zip`
- **Homepage**: <https://libzip.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libzip.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libzip.org
```

## Programs

This package provides the following executable programs:

- `zipcmp`
- `zipmerge`
- `ziptool`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `1.11.4`, `1.11.3`, `1.11.2`, `1.11.1`
- `1.10.1`, `1.10.0`
- `1.9.2`

</details>

**Latest Version**: `1.11.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libzip.org@1.11.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `facebook.com/zstd>=1.5.0`
- `darwin:sourceware.org/bzip2>=1.0.8`
- `darwin:tukaani.org/xz>=5.2.7`
- `darwin:zlib.net>=1.2.13`
- `linux:openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.zip

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libzip.org/package.yml)
- [Homepage](https://libzip.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
