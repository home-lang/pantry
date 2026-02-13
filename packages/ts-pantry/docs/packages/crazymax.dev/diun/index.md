# diun

> Receive notifications when an image is updated on a Docker registry

## Package Information

- **Domain**: `crazymax.dev/diun`
- **Name**: `diun`
- **Homepage**: https://crazymax.dev/diun/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crazymax.dev/diun/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crazymax.dev/diun
```

## Programs

This package provides the following executable programs:

- `diun`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `4.31.0`, `4.30.0`, `4.29.0`, `4.28.0`

</details>

**Latest Version**: `4.31.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crazymax.dev/diun@4.31.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.diun

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crazymax.dev/diun/package.yml)
- [Homepage](https://crazymax.dev/diun/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
