# arpack-ng

> Collection of Fortran77 subroutines designed to solve large scale eigenvalue problems.

## Package Information

- **Domain**: `github.com/opencollab/arpack-ng`
- **Name**: `arpack-ng`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/opencollab/arpack-ng/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/opencollab/arpack-ng
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `3.9.1`

</details>

**Latest Version**: `3.9.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/opencollab/arpack-ng@3.9.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `eigen.tuxfamily.org@3`
- `gnu.org/gcc`
- `open-mpi.org@5`
- `netlib.org/lapack@3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['arpack-ng']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/opencollab/arpack-ng/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
