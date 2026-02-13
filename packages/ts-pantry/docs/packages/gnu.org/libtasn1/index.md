# asn1

> ASN.1 structure parser library

## Package Information

- **Domain**: `gnu.org/libtasn1`
- **Name**: `asn1`
- **Homepage**: https://www.gnu.org/software/libtasn1/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/libtasn1/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/libtasn1
```

## Programs

This package provides the following executable programs:

- `asn1Coding`
- `asn1Decoding`
- `asn1Parser`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `4.21.0`, `4.20.0`, `4.19.0`

</details>

**Latest Version**: `4.21.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/libtasn1@4.21.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.asn1

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/libtasn1/package.yml)
- [Homepage](https://www.gnu.org/software/libtasn1/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
