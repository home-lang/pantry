# lapack

> LAPACK development repository

## Package Information

- **Domain**: `netlib.org/lapack`
- **Name**: `lapack`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/netlib.org/lapack/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install netlib.org/lapack
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `3.12.1`, `3.12.0`, `3.11.0`

</details>

**Latest Version**: `3.12.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +netlib.org/lapack@3.12.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/gcc^11 # libgfortran`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.lapack

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/netlib.org/lapack/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
