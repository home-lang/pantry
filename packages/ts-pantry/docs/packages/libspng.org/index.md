# libspng

> Simple, modern libpng alternative

## Package Information

- **Domain**: `libspng.org`
- **Name**: `libspng`
- **Homepage**: <https://libspng.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libspng.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libspng.org
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.5.0`

</details>

**Latest Version**: `0.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libspng.org@0.5.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `darwin:zlib.net`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libspng

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libspng.org/package.yml)
- [Homepage](https://libspng.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
