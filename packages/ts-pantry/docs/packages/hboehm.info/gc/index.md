# gc

> The Boehm-Demers-Weiser conservative C/C++ Garbage Collector (bdwgc, also known as bdw-gc, boehm-gc, libgc)

## Package Information

- **Domain**: `hboehm.info/gc`
- **Name**: `gc`
- **Homepage**: <https://www.hboehm.info/gc/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/hboehm.info/gc/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install hboehm.info/gc
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `8.2.12`, `8.2.10`, `8.2.8`, `8.2.6`, `8.2.4`
- `8.0.18`, `8.0.16`, `8.0.14`, `8.0.12`
- `7.6.26`, `7.6.24`, `7.6.22`, `7.6.20`

</details>

**Latest Version**: `8.2.12`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +hboehm.info/gc@8.2.12 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/hboehm.info/gc/package.yml)
- [Homepage](https://www.hboehm.info/gc/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
