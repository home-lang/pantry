# cairo-trace

> Vector graphics library with cross-device output support

## Package Information

- **Domain**: `cairographics.org`
- **Name**: `cairo-trace`
- **Homepage**: https://cairographics.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/cairographics.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install cairographics.org
```

## Programs

This package provides the following executable programs:

- `cairo-trace`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.18.4`, `1.18.2`, `1.18.0`, `1.16.0`

</details>

**Latest Version**: `1.18.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +cairographics.org@1.18.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libpng.org@1`
- `pixman.org^0.40.0`
- `freetype.org@2`
- `gnome.org/glib@2`
- `freedesktop.org/fontconfig@2`
- `sourceware.org/bzip2@1`
- `x.org/x11`
- `x.org/xcb`
- `x.org/exts`
- `x.org/xrender`
- `oberhumer.com/lzo`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['cairo-trace']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/cairographics.org/package.yml)
- [Homepage](https://cairographics.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
