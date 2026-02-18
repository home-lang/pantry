# bison

> Parser generator

## Package Information

- **Domain**: `gnu.org/bison`
- **Name**: `bison`
- **Homepage**: <https://www.gnu.org/software/bison/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/bison/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/bison
```

## Programs

This package provides the following executable programs:

- `bison`
- `yacc`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `3.8.2`

</details>

**Latest Version**: `3.8.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/bison@3.8.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/m4@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.bison

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/bison/package.yml)
- [Homepage](https://www.gnu.org/software/bison/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
