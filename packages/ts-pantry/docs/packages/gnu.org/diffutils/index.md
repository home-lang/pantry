# diffutils

> File comparison utilities

## Package Information

- **Domain**: `gnu.org/diffutils`
- **Name**: `diffutils`
- **Homepage**: <https://www.gnu.org/software/diffutils/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/diffutils/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/diffutils
```

## Programs

This package provides the following executable programs:

- `cmp`
- `diff`
- `diff3`
- `sdiff`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `3.12.0`
- `3.11.0`
- `3.2.0`

</details>

**Latest Version**: `3.12.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/diffutils@3.12.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.diffutils

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/diffutils/package.yml)
- [Homepage](https://www.gnu.org/software/diffutils/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
