# xorriso

> ISO 9660 Rock Ridge filesystem manipulator

## Package Information

- **Domain**: `gnu.org/xorriso`
- **Name**: `xorriso`
- **Homepage**: <https://www.gnu.org/software/xorriso/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/xorriso/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/xorriso
```

## Programs

This package provides the following executable programs:

- `xorriso`
- `xorrisofs`
- `xorrecord`
- `osirrox`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `1.5.6`, `1.5.4`, `1.5.2`, `1.5.0`
- `1.4.8`, `1.4.6`

</details>

**Latest Version**: `1.5.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/xorriso@1.5.6 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net`
- `sourceware.org/bzip2`
- `gnu.org/readline`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.xorriso

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/xorriso/package.yml)
- [Homepage](https://www.gnu.org/software/xorriso/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
