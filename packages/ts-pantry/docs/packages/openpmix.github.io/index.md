# openpmix.github

> Process Management Interface for HPC environments

## Package Information

- **Domain**: `openpmix.github.io`
- **Name**: `openpmix.github`
- **Homepage**: <https://openpmix.github.io/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openpmix.github.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openpmix.github.io
```

## Programs

This package provides the following executable programs:

- `palloc`
- `pattrs`
- `pctrl`
- `pevent`
- `plookup`
- `pmix_info`
- `pmixcc`
- `pps`
- `pquery`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `6.0.0`, `5.0.10`, `5.0.9`, `5.0.8`, `5.0.7`
- `5.0.6`, `5.0.5`, `5.0.4`, `5.0.3`, `5.0.2`
- `5.0.1`

</details>

**Latest Version**: `6.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +openpmix.github.io@6.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `open-mpi.org/hwloc^2.10`
- `libevent.org^2.1`
- `zlib.net^1.3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['openpmix.github']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openpmix.github.io/package.yml)
- [Homepage](https://openpmix.github.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
