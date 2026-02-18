# libgeotiff

> Official repository of the libgeotiff project

## Package Information

- **Domain**: `github.com/OSGeo/libgeotiff`
- **Name**: `libgeotiff`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/OSGeo/libgeotiff/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/OSGeo/libgeotiff
```

## Programs

This package provides the following executable programs:

- `applygeo`
- `geotifcp`
- `listgeo`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.7.4`, `1.7.3`, `1.7.2`, `1.7.1`

</details>

**Latest Version**: `1.7.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/OSGeo/libgeotiff@1.7.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libjpeg-turbo.org`
- `simplesystems.org/libtiff`
- `proj.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libgeotiff

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/OSGeo/libgeotiff/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
