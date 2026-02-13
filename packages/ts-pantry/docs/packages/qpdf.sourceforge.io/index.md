# qpdf

> qpdf: A content-preserving PDF document transformer

## Package Information

- **Domain**: `qpdf.sourceforge.io`
- **Name**: `qpdf`
- **Homepage**: https://qpdf.sourceforge.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/qpdf.sourceforge.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install qpdf.sourceforge.io
```

## Programs

This package provides the following executable programs:

- `qpdf`

## Available Versions

<details>
<summary>Show all 12 versions</summary>

- `12.3.1`, `12.3.0`, `12.2.0`, `12.1.0`, `12.0.0`
- `11.10.1`, `11.10.0`, `11.9.1`, `11.9.0`, `11.8.0`
- `11.7.0`, `11.6.4`

</details>

**Latest Version**: `12.3.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +qpdf.sourceforge.io@12.3.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1`
- `libjpeg-turbo.org^2`
- `openssl.org^1.1`
- `gnutls.org^3`
- `linux:gnu.org/gcc/libstdcxx^13 # needs newer libstdc++ for C++20 support`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.qpdf

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/qpdf.sourceforge.io/package.yml)
- [Homepage](https://qpdf.sourceforge.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
