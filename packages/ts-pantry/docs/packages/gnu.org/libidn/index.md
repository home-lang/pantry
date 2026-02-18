# idn

> International domain name library

## Package Information

- **Domain**: `gnu.org/libidn`
- **Name**: `idn`
- **Homepage**: <https://www.gnu.org/software/libidn/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/libidn/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/libidn
```

## Programs

This package provides the following executable programs:

- `idn`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.43.0`
- `1.42.0`
- `1.41.0`

</details>

**Latest Version**: `1.43.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/libidn@1.43.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.idn

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/libidn/package.yml)
- [Homepage](https://www.gnu.org/software/libidn/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
