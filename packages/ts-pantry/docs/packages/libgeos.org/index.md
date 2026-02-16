# geos-config

> Geometry Engine, Open Source

## Package Information

- **Domain**: `libgeos.org`
- **Name**: `geos-config`
- **Homepage**: https://libgeos.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libgeos.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libgeos.org
```

## Programs

This package provides the following executable programs:

- `geos-config`

## Available Versions

<details>
<summary>Show all 17 versions</summary>

- `3.14.1`, `3.14.0`, `3.13.1`, `3.13.0`, `3.12.3`
- `3.12.2`, `3.12.1`, `3.12.0`, `3.11.5`, `3.11.4`
- `3.11.3`, `3.11.2`, `3.10.7`, `3.10.6`, `3.9.6`
- `3.9.5`, `3.8.4`

</details>

**Latest Version**: `3.14.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libgeos.org@3.14.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['geos-config']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libgeos.org/package.yml)
- [Homepage](https://libgeos.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
