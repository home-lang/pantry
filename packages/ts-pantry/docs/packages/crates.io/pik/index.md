# pik

> Process Interactive Kill

## Package Information

- **Domain**: `crates.io/pik`
- **Name**: `pik`
- **Homepage**: https://crates.io/crates/pik
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/pik/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/pik
```

## Programs

This package provides the following executable programs:

- `pik`

## Available Versions

<details>
<summary>Show all 16 versions</summary>

- `0.28.0`, `0.27.0`, `0.26.1`, `0.26.0`, `0.25.0`
- `0.24.0`, `0.23.1`, `0.23.0`, `0.22.0`, `0.21.0`
- `0.20.0`, `0.19.0`, `0.18.1`, `0.18.0`, `0.17.0`
- `0.16.0`

</details>

**Latest Version**: `0.28.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/pik@0.28.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pik

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/pik/package.yml)
- [Homepage](https://crates.io/crates/pik)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
