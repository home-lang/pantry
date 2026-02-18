# autoconf

> Automatic configure script builder

## Package Information

- **Domain**: `gnu.org/autoconf`
- **Name**: `autoconf`
- **Homepage**: <https://www.gnu.org/software/autoconf/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/autoconf/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/autoconf
```

## Programs

This package provides the following executable programs:

- `autoconf`
- `autoheader`
- `autom4te`
- `autoreconf`
- `autoscan`
- `autoupdate`
- `ifnames`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.72.0`
- `2.71.0`

</details>

**Latest Version**: `2.72.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/autoconf@2.72.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/m4@1`
- `perl.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.autoconf

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/autoconf/package.yml)
- [Homepage](https://www.gnu.org/software/autoconf/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
