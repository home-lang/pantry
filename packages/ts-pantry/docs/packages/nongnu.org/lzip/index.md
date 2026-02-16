# lzip

> LZMA-based compression program similar to gzip or bzip2

## Package Information

- **Domain**: `nongnu.org/lzip`
- **Name**: `lzip`
- **Homepage**: <https://www.nongnu.org/lzip/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/nongnu.org/lzip/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install nongnu.org/lzip
```

## Programs

This package provides the following executable programs:

- `lzip`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.23.0`

</details>

**Latest Version**: `1.23.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +nongnu.org/lzip@1.23.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.lzip

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/nongnu.org/lzip/package.yml)
- [Homepage](https://www.nongnu.org/lzip/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
