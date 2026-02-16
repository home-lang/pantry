# mc

> Unix like utilities for object store

## Package Information

- **Domain**: `min.io/mc`
- **Name**: `mc`
- **Homepage**: https://min.io/download
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/min.io/mc/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install min.io/mc
```

## Programs

This package provides the following executable programs:

- `mc`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2023.10.24.21.42.22`

</details>

**Latest Version**: `2023.10.24.21.42.22`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +min.io/mc@2023.10.24.21.42.22 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/min.io/mc/package.yml)
- [Homepage](https://min.io/download)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
