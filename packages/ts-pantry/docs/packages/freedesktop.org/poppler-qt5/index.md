# poppler-qt5

> PDF rendering library (based on the xpdf-3.0 code base)

## Package Information

- **Domain**: `freedesktop.org/poppler-qt5`
- **Name**: `poppler-qt5`
- **Homepage**: https://poppler.freedesktop.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/poppler-qt5/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install freedesktop.org/poppler-qt5
```

## Programs

This package provides the following executable programs:

- `pdfattach`
- `pdfdetach`
- `pdffonts`
- `pdfimages`
- `pdfinfo`
- `pdfseparate`
- `pdfsig`
- `pdftocairo`
- `pdftohtml`
- `pdftoppm`
- `pdftops`
- `pdftotext`
- `pdfunite`

## Available Versions

<details>
<summary>Show all 29 versions</summary>

- `26.1.0`, `25.12.0`, `25.11.0`, `25.10.0`, `25.9.1`
- `25.9.0`, `25.8.0`, `25.7.0`, `25.6.0`, `25.5.0`
- `25.4.0`, `25.3.0`, `25.2.0`, `25.1.0`, `24.12.0`
- `24.11.0`, `24.10.0`, `24.9.0`, `24.8.0`, `24.7.0`
- `24.6.1`, `24.6.0`, `24.5.0`, `24.4.0`, `24.3.0`
- `24.2.0`, `24.1.0`, `23.12.0`, `23.11.0`

</details>

**Latest Version**: `26.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +freedesktop.org/poppler-qt5@26.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnupg.org/libassuan^2`
- `cairographics.org^1`
- `freedesktop.org/fontconfig^2`
- `freetype.org^2`
- `gnu.org/gettext^0`
- `gnome.org/libxml2~2.13 # since 25.4.0, 2.14 changed the API version`
- `gnome.org/libxslt~1.1.44 # 1.1.45 bumps the libxml2 version requirement`
- `gnome.org/glib^2`
- `gnupg.org/gpgme^1`
- `gnupg.org/libgpg-error^1`
- `libjpeg-turbo.org^2`
- `libpng.org^1`
- `simplesystems.org/libtiff^4`
- `littlecms.com^2`
- `mozilla.org/nss^3`
- `openjpeg.org^2`
- `qt.io~5`
- `curl.se^8`
- `darwin:gnupg.org/libassuan^2`
- `linux:gnu.org/gcc`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['poppler-qt5']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/poppler-qt5/package.yml)
- [Homepage](https://poppler.freedesktop.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
