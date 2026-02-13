# hwloc

> Portable abstraction of the hierarchical topology of modern architectures

## Package Information

- **Domain**: `open-mpi.org/hwloc`
- **Name**: `hwloc`
- **Homepage**: https://www.open-mpi.org/projects/hwloc/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/open-mpi.org/hwloc/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install open-mpi.org/hwloc
```

## Programs

This package provides the following executable programs:

- `hwloc-annotate`
- `hwloc-bind`
- `hwloc-calc`
- `hwloc-compress-dir`
- `hwloc-diff`
- `hwloc-distrib`
- `hwloc-info`
- `hwloc-patch`
- `hwloc-ps`
- `lstopo-no-graphics`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `2.12.2`, `2.12.1`, `2.12.0`, `2.11.2`, `2.11.1`
- `2.11.0`, `2.10.0`, `2.9.3`, `2.9.2`, `2.9.1`

</details>

**Latest Version**: `2.12.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +open-mpi.org/hwloc@2.12.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.hwloc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/open-mpi.org/hwloc/package.yml)
- [Homepage](https://www.open-mpi.org/projects/hwloc/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
