# poppler.freedesktop.org

> Package from pantry: poppler.freedesktop.org

## Package Information

- **Domain**: `poppler.freedesktop.org`
- **Name**: `poppler.freedesktop.org`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/poppler.freedesktop.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install poppler.freedesktop.org
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `boost.org>=1.58.0`
- `cairographics.org>=1.16.0`
- `curl.se`
- `freedesktop.org/fontconfig>=2.13`
- `freetype.org>=2.10`
- `gnome.org/glib>=2.64`
- `gnome.org/libxml2~2.13 # since 25.4.0, 2.14 changed the API version`
- `libjpeg-turbo.org`
- `libpng.org`
- `openjpeg.org`
- `poppler.freedesktop.org/poppler-data`
- `simplesystems.org/libtiff`
- `zlib.net`
- `mozilla.org/nss>=3.68`
- `gnupg.org/gpgme~1.19`
- `gnupg.org/libgpg-error@1`
- `gnupg.org/libassuan@2`
- `littlecms.com^2.9`
- `linux:gnu.org/gcc/libstdcxx^14 # apparently, clang c++20 std isn`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['poppler.freedesktop.org']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/poppler.freedesktop.org/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
