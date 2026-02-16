# mupdf

> Lightweight PDF and XPS viewer

## Package Information

- **Domain**: `mupdf.com`
- **Name**: `mupdf`
- **Homepage**: https://mupdf.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mupdf.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mupdf.com
```

## Programs

This package provides the following executable programs:

- `mupdf-gl`
- `muraster`
- `mutool`

## Available Versions

<details>
<summary>Show all 40 versions</summary>

- `1.27.1`, `1.27.0`, `1.26.12`, `1.26.11`, `1.26.10`
- `1.26.9`, `1.26.8`, `1.26.7`, `1.26.6`, `1.26.5`
- `1.26.4`, `1.26.3`, `1.26.2`, `1.26.1`, `1.26.0`
- `1.25.6`, `1.25.5`, `1.25.4`, `1.25.3`, `1.25.2`
- `1.25.1`, `1.25.0`, `1.24.11`, `1.24.10`, `1.24.9`
- `1.24.8`, `1.24.7`, `1.24.6`, `1.24.5`, `1.24.4`
- `1.24.3`, `1.24.2`, `1.24.1`, `1.24.0`, `1.23.11`
- `1.23.10`, `1.23.9`, `1.23.8`, `1.23.7`, `1.23.6`

</details>

**Latest Version**: `1.27.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mupdf.com@1.27.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1`
- `openssl.org^1.1`
- `info-zip.org/unzip^6`
- `github.com/google/brotli^1`
- `freetype.org^2`
- `harfbuzz.org^9`
- `mujs.com^1`
- `openjpeg.org^2`
- `jbig2dec.com^0`
- `darwin:libarchive.org^3`
- `linux:mesa3d.org^23`
- `linux:freeglut.sourceforge.io^3`
- `linux:freedesktop.org/mesa-glu^9`
- `linux:x.org/protocol>=2022`
- `linux:x.org/x11^1`
- `linux:x.org/xcursor^1`
- `linux:x.org/xinerama^1`
- `linux:x.org/xrandr^1`
- `linux:gnome.org/glib^2`
- `linux:x.org/xtrans^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mupdf

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mupdf.com/package.yml)
- [Homepage](https://mupdf.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
