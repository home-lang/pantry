# netcdf

> Official GitHub repository for netCDF-C libraries and utilities.

## Package Information

- **Domain**: `unidata.ucar.edu/netcdf`
- **Name**: `netcdf`
- **Homepage**: <https://www.unidata.ucar.edu/software/netcdf/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/unidata.ucar.edu/netcdf/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install unidata.ucar.edu/netcdf
```

## Programs

This package provides the following executable programs:

- `nc-config`
- `nccopy`
- `ncdump`
- `ncgen`
- `ncgen3`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `4.9.3`, `4.9.2`

</details>

**Latest Version**: `4.9.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +unidata.ucar.edu/netcdf@4.9.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `hdfgroup.org/HDF5`
- `sourceware.org/bzip2`
- `curl.se`
- `gnome.org/libxml2`
- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.netcdf

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/unidata.ucar.edu/netcdf/package.yml)
- [Homepage](https://www.unidata.ucar.edu/software/netcdf/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
