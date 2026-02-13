# rist

> Reliable Internet Stream Transport (RIST)

## Package Information

- **Domain**: `code.videolan.org/rist/librist`
- **Name**: `rist`
- **Homepage**: https://code.videolan.org/rist/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/code.videolan.org/rist/librist/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install code.videolan.org/rist/librist
```

## Programs

This package provides the following executable programs:

- `rist2rist`
- `ristreceiver`
- `ristsender`
- `ristsrppasswd`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.2.11`, `0.2.8`, `0.2.7`

</details>

**Latest Version**: `0.2.11`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +code.videolan.org/rist/librist@0.2.11 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rist

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/code.videolan.org/rist/librist/package.yml)
- [Homepage](https://code.videolan.org/rist/)
- [Back to Package Catalog](../../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
