# m4

> GNU M4. Mirror of git://git.savannah.gnu.org/m4.git

## Package Information

- **Domain**: `gnu.org/m4`
- **Name**: `m4`
- **Homepage**: https://www.gnu.org/software/m4/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/m4/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/m4
```

## Programs

This package provides the following executable programs:

- `m4`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.4.21`, `1.4.20`, `1.4.19`

</details>

**Latest Version**: `1.4.21`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/m4@1.4.21 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.m4

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/m4/package.yml)
- [Homepage](https://www.gnu.org/software/m4/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
