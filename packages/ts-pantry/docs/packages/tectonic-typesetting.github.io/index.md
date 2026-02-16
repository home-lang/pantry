# tectonic

> A modernized, complete, self-contained TeX/LaTeX engine, powered by XeTeX and TeXLive.

## Package Information

- **Domain**: `tectonic-typesetting.github.io`
- **Name**: `tectonic`
- **Homepage**: <https://tectonic-typesetting.github.io/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/tectonic-typesetting.github.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install tectonic-typesetting.github.io
```

## Programs

This package provides the following executable programs:

- `tectonic`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `0.15.0`, `0.14.1`, `0.14.0`, `0.13.1`, `0.13.0`
- `0.12.0`

</details>

**Latest Version**: `0.15.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +tectonic-typesetting.github.io@0.15.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `freetype.org`
- `graphite.sil.org`
- `harfbuzz.org`
- `libpng.org`
- `openssl.org^1.1`
- `unicode.org^71`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tectonic

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/tectonic-typesetting.github.io/package.yml)
- [Homepage](https://tectonic-typesetting.github.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
