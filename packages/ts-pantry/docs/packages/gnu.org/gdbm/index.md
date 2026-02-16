# gdbm

> GNU database manager

## Package Information

- **Domain**: `gnu.org/gdbm`
- **Name**: `gdbm`
- **Homepage**: <https://www.gnu.org.ua/software/gdbm/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gdbm/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/gdbm
```

## Programs

This package provides the following executable programs:

- `gdbm_dump`
- `gdbm_load`
- `gdbmtool`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.26.0`, `1.25.0`, `1.24.0`, `1.23.0`

</details>

**Latest Version**: `1.26.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/gdbm@1.26.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gdbm

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gdbm/package.yml)
- [Homepage](https://www.gnu.org.ua/software/gdbm/)
- [Back to Package Catalog](../../../package-catalog.md)

---

_This documentation was auto-generated from package data._
