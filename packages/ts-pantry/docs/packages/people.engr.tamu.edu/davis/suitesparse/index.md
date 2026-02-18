# suite-sparse

> The official SuiteSparse library: a suite of sparse matrix algorithms authored or co-authored by Tim Davis, Texas A&M University.

## Package Information

- **Domain**: `people.engr.tamu.edu/davis/suitesparse`
- **Name**: `suite-sparse`
- **Homepage**: https://people.engr.tamu.edu/davis/suitesparse.html
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/people.engr.tamu.edu/davis/suitesparse/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install people.engr.tamu.edu/davis/suitesparse
```

## Programs

This package provides the following executable programs:

- `mongoose`
- `suitesparse_mongoose`

## Available Versions

<details>
<summary>Show all 24 versions</summary>

- `7.12.2`, `7.12.1`, `7.12.0`
- `7.11.0`
- `7.10.3`, `7.10.2`, `7.10.1`, `7.10.0`
- `7.9.0`
- `7.8.3`, `7.8.2`, `7.8.1`, `7.8.0`
- `7.7.0`
- `7.6.1`, `7.6.0`
- `7.5.1`, `7.5.0`
- `7.4.0`
- `7.3.1`, `7.3.0`
- `7.2.2`, `7.2.1`, `7.2.0`

</details>

**Latest Version**: `7.12.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +people.engr.tamu.edu/davis/suitesparse@7.12.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `glaros.dtc.umn.edu/metis`
- `gnu.org/m4`
- `netlib.org/lapack`
- `gnu.org/gmp`
- `openmp.llvm.org`
- `gnu.org/mpfr`
- `gnu.org/gcc`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['suite-sparse']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/people.engr.tamu.edu/davis/suitesparse/package.yml)
- [Homepage](https://people.engr.tamu.edu/davis/suitesparse.html)
- [Back to Package Catalog](../../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
