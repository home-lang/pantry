# texinfo

> Official documentation format of the GNU project

## Package Information

- **Domain**: `gnu.org/texinfo`
- **Name**: `texinfo`
- **Homepage**: https://www.gnu.org/software/texinfo/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/texinfo/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/texinfo
```

## Programs

This package provides the following executable programs:

- `info`
- `install-info`
- `makeinfo`
- `pdftexi2dvi`
- `pod2texi`
- `texi2any`
- `texi2dvi`
- `texi2pdf`
- `texindex`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `7.2.0`, `7.1.1`, `7.1.0`, `7.0.3`, `7.0.1`

</details>

**Latest Version**: `7.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/texinfo@7.2.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `perl.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.texinfo

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/texinfo/package.yml)
- [Homepage](https://www.gnu.org/software/texinfo/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
