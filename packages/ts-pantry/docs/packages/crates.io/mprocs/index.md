# mprocs

> Run multiple commands in parallel

## Package Information

- **Domain**: `crates.io/mprocs`
- **Name**: `mprocs`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/mprocs/package.yml)

## Installation

```bash
# Install with pantry
pantry install crates.io/mprocs
```

## Programs

This package provides the following executable programs:

- `mprocs`

## Available Versions

<details>
<summary>Show all 12 versions</summary>

- `0.9.2`, `0.9.1`, `0.9.0`
- `0.8.3`, `0.8.2`, `0.8.1`, `0.8.0`
- `0.7.3`, `0.7.2`, `0.7.1`, `0.7.0`
- `0.6.4`

</details>

**Latest Version**: `0.9.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/mprocs@0.9.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mprocs

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/mprocs/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
