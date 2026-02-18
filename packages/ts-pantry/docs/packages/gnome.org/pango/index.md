# pango

> Framework for layout and rendering of i18n text

## Package Information

- **Domain**: `gnome.org/pango`
- **Name**: `pango`
- **Homepage**: <https://www.gtk.org/docs/architecture/pango>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/pango/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnome.org/pango
```

## Programs

This package provides the following executable programs:

- `pango-list`
- `pango-segmentation`
- `pango-view`

## Available Versions

<details>
<summary>Show all 15 versions</summary>

- `1.57.0`
- `1.56.4`, `1.56.3`, `1.56.2`, `1.56.1`, `1.56.0`
- `1.55.5`, `1.55.0`
- `1.54.0`
- `1.52.2`, `1.52.1`, `1.52.0`
- `1.51.2`
- `1.50.14`, `1.50.9`

</details>

**Latest Version**: `1.57.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnome.org/pango@1.57.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `cairographics.org^1.18`
- `freetype.org@2`
- `gnome.org/glib@2`
- `harfbuzz.org@8`
- `freedesktop.org/fontconfig@2`
- `sourceware.org/libffi@3`
- `gnu.org/fribidi@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pango

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/pango/package.yml)
- [Homepage](https://www.gtk.org/docs/architecture/pango)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
