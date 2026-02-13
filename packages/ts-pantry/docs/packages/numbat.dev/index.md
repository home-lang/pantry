# numbat

> A statically typed programming language for scientific computations with first class support for physical dimensions and units

## Package Information

- **Domain**: `numbat.dev`
- **Name**: `numbat`
- **Homepage**: https://numbat.dev
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/numbat.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install numbat.dev
```

## Programs

This package provides the following executable programs:

- `numbat`

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `1.19.0`, `1.18.0`, `1.17.0`, `1.16.0`, `1.15.0`
- `1.14.0`, `1.13.0`, `1.12.0`, `1.11.0`, `1.10.1`
- `1.10.0`, `1.9.0`, `1.8.0`

</details>

**Latest Version**: `1.19.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +numbat.dev@1.19.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.numbat

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/numbat.dev/package.yml)
- [Homepage](https://numbat.dev)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
