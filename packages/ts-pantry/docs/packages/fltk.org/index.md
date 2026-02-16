# fltk

> FLTK - Fast Light Tool Kit - <https://github.com/fltk/fltk> - cross platform GUI development

## Package Information

- **Domain**: `fltk.org`
- **Name**: `fltk`
- **Homepage**: <https://www.fltk.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/fltk.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install fltk.org
```

## Programs

This package provides the following executable programs:

- `fluid`
- `fltk-config`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `1.4.4`, `1.4.3`, `1.4.2`, `1.4.1`, `1.3.11`
- `1.3.10`, `1.3.9`

</details>

**Latest Version**: `1.4.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +fltk.org@1.4.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libjpeg-turbo.org^2`
- `libpng.org^1`
- `linux:x.org/xft^2`
- `linux:x.org/xt^1`
- `linux:freedesktop.org/mesa-glu^9`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.fltk

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/fltk.org/package.yml)
- [Homepage](https://www.fltk.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
