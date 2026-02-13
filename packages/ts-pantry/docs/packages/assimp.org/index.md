# assimp

> The official Open-Asset-Importer-Library Repository. Loads 40+ 3D-file-formats into one unified and clean data structure.

## Package Information

- **Domain**: `assimp.org`
- **Name**: `assimp`
- **Homepage**: https://www.assimp.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/assimp.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install assimp.org
```

## Programs

This package provides the following executable programs:

- `assimp`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `6.0.3`, `6.0.2`, `6.0.1`, `5.4.3`, `5.4.2`
- `5.4.1`, `5.4.0`, `5.3.1`, `5.3.0`, `5.2.5`

</details>

**Latest Version**: `6.0.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +assimp.org@6.0.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.assimp

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/assimp.org/package.yml)
- [Homepage](https://www.assimp.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
