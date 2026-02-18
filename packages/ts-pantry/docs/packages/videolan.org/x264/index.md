# x264

> H.264/AVC encoder

## Package Information

- **Domain**: `videolan.org/x264`
- **Name**: `x264`
- **Homepage**: https://www.videolan.org/developers/x264.html
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/videolan.org/x264/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install videolan.org/x264
```

## Programs

This package provides the following executable programs:

- `x264`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.164.3095`

</details>

**Latest Version**: `0.164.3095`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +videolan.org/x264@0.164.3095 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.x264

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/videolan.org/x264/package.yml)
- [Homepage](https://www.videolan.org/developers/x264.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
