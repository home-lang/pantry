# wavpack

> WavPack encode/decode library, command-line programs, and several plugins

## Package Information

- **Domain**: `wavpack.com`
- **Name**: `wavpack`
- **Homepage**: https://www.wavpack.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/wavpack.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install wavpack.com
```

## Programs

This package provides the following executable programs:

- `wavpack`
- `wvunpack`
- `wvtag`
- `wvgain`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `5.9.0`, `5.8.1`, `5.8.0`, `5.7.0`

</details>

**Latest Version**: `5.9.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +wavpack.com@5.9.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.wavpack

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/wavpack.com/package.yml)
- [Homepage](https://www.wavpack.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
