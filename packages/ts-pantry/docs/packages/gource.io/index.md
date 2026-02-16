# gource

> software version control visualization

## Package Information

- **Domain**: `gource.io`
- **Name**: `gource`
- **Homepage**: https://gource.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gource.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gource.io
```

## Programs

This package provides the following executable programs:

- `gource`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.55.0`, `0.54.0`

</details>

**Latest Version**: `0.55.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gource.io@0.55.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `boost.org^1.82`
- `freetype.org^2`
- `libpng.org^1.6`
- `pcre.org/v2^10`
- `libsdl.org^2`
- `glew.sourceforge.io^2`
- `libsdl.org/SDL_image^2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gource

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gource.io/package.yml)
- [Homepage](https://gource.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
