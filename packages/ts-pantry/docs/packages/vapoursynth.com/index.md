# vspipe

> A video processing framework with simplicity in mind

## Package Information

- **Domain**: `vapoursynth.com`
- **Name**: `vspipe`
- **Homepage**: <https://www.vapoursynth.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/vapoursynth.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install vapoursynth.com
```

## Programs

This package provides the following executable programs:

- `vspipe`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `73.0.0`
- `72.0.0`
- `71.0.0`
- `70.0.0`
- `69.0.0`
- `68.0.0`
- `67.0.0`
- `66.0.0`
- `65.0.0`
- `64.0.0`

</details>

**Latest Version**: `73.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +vapoursynth.com@73.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.11`
- `github.com/sekrit-twc/zimg`
- `linux:gnu.org/gcc/libstdcxx`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.vspipe

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/vapoursynth.com/package.yml)
- [Homepage](https://www.vapoursynth.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
