# openslide

> C library to read whole-slide images (a.k.a. virtual slides)

## Package Information

- **Domain**: `openslide.org`
- **Name**: `openslide`
- **Homepage**: <https://openslide.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openslide.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openslide.org
```

## Programs

This package provides the following executable programs:

- `openslide-quickhash1sum`
- `openslide-show-properties`
- `openslide-write-png`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `4.0.0`
- `3.4.1`

</details>

**Latest Version**: `4.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +openslide.org@4.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `cairographics.org`
- `gnome.org/gdk-pixbuf`
- `gnome.org/glib`
- `libjpeg-turbo.org`
- `libpng.org`
- `simplesystems.org/libtiff`
- `gnome.org/libxml2`
- `openjpeg.org`
- `sqlite.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.openslide

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openslide.org/package.yml)
- [Homepage](https://openslide.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
