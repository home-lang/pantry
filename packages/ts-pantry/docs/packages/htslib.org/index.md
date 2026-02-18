# htslib

> C library for high-throughput sequencing data formats

## Package Information

- **Domain**: `htslib.org`
- **Name**: `htslib`
- **Homepage**: <https://www.htslib.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/htslib.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install htslib.org
```

## Programs

This package provides the following executable programs:

- `bgzip`
- `htsfile`
- `tabix`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `1.23.0`
- `1.22.1`, `1.22.0`
- `1.21.0`
- `1.20.0`
- `1.19.1`, `1.19.0`
- `1.18.0`

</details>

**Latest Version**: `1.23.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +htslib.org@1.23.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `sourceware.org/bzip2`
- `tukaani.org/xz`
- `zlib.net^1`
- `curl.se>=5`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.htslib

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/htslib.org/package.yml)
- [Homepage](https://www.htslib.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
