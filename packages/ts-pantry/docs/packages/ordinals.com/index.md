# ord

> Index, block explorer, and command-line wallet

## Package Information

- **Domain**: `ordinals.com`
- **Name**: `ord`
- **Homepage**: https://ordinals.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ordinals.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ordinals.com
```

## Programs

This package provides the following executable programs:

- `ord`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `0.6.1`, `0.6.0`
- `0.5.1`, `0.5.0`

</details>

**Latest Version**: `0.6.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ordinals.com@0.6.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ord

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ordinals.com/package.yml)
- [Homepage](https://ordinals.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
