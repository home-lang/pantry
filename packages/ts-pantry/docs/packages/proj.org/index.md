# proj

> PROJ - Cartographic Projections and Coordinate Transformations Library

## Package Information

- **Domain**: `proj.org`
- **Name**: `proj`
- **Homepage**: <https://proj.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/proj.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install proj.org
```

## Programs

This package provides the following executable programs:

- `proj`

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `9.7.1`, `9.7.0`
- `9.6.2`, `9.6.1`, `9.6.0`
- `9.5.1`, `9.5.0`
- `9.4.1`, `9.4.0`
- `9.3.1`, `9.3.0`
- `9.2.1`, `9.2.0`

</details>

**Latest Version**: `9.7.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +proj.org@9.7.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `simplesystems.org/libtiff`
- `sqlite.org`
- `curl.se`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.proj

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/proj.org/package.yml)
- [Homepage](https://proj.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
