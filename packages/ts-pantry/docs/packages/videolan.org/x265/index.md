# x265

> H.265/HEVC encoder

## Package Information

- **Domain**: `videolan.org/x265`
- **Name**: `x265`
- **Homepage**: https://bitbucket.org/multicoreware/x265_git
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/videolan.org/x265/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install videolan.org/x265
```

## Programs

This package provides the following executable programs:

- `x265`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `4.1.0`
- `3.2.1`

</details>

**Latest Version**: `4.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +videolan.org/x265@4.1.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.x265

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/videolan.org/x265/package.yml)
- [Homepage](https://bitbucket.org/multicoreware/x265_git)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
