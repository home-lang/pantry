# open-mpi

> Open MPI main development repository

## Package Information

- **Domain**: `open-mpi.org`
- **Name**: `open-mpi`
- **Homepage**: <https://www.open-mpi.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/open-mpi.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install open-mpi.org
```

## Programs

This package provides the following executable programs:

- `mpic++`
- `mpiCC`
- `mpicc`
- `mpicxx`
- `mpiexec`
- `mpif77`
- `mpif90`
- `mpifort`
- `mpirun`
- `ompi_info`
- `opal_wrapper`

## Available Versions

<details>
<summary>Show all 12 versions</summary>

- `5.0.9`, `5.0.8`, `5.0.7`, `5.0.6`, `5.0.5`
- `5.0.4`, `5.0.3`, `5.0.2`, `5.0.1`, `4.1.8`
- `4.1.7`, `4.1.5`

</details>

**Latest Version**: `5.0.9`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +open-mpi.org@5.0.9 -- $SHELL -i
```

## Dependencies

This package depends on:

- `open-mpi.org/hwloc`
- `openpmix.github.io@5`
- `libevent.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['open-mpi']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/open-mpi.org/package.yml)
- [Homepage](https://www.open-mpi.org)
- [Back to Package Catalog](../../package-catalog.md)

---

_This documentation was auto-generated from package data._
