# harfbuzz

> HarfBuzz text shaping engine

## Package Information

- **Domain**: `harfbuzz.org`
- **Name**: `harfbuzz`
- **Homepage**: http://harfbuzz.github.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/harfbuzz.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install harfbuzz.org
```

## Programs

This package provides the following executable programs:

- `hb-ot-shape-closure`
- `hb-shape`
- `hb-subset`
- `hb-view`

## Available Versions

<details>
<summary>Show all 45 versions</summary>

- `999.999.999`, `12.3.1`, `12.3.0`, `12.2.0`, `12.1.0`
- `12.0.0`, `11.5.1`, `11.5.0`, `11.4.5`, `11.4.4`
- `11.4.3`, `11.4.2`, `11.4.1`, `11.3.3`, `11.3.2`
- `11.3.1`, `11.3.0`, `11.2.1`, `11.2.0`, `11.1.0`
- `11.0.1`, `11.0.0`, `10.4.0`, `10.3.0`, `10.2.0`
- `10.1.0`, `10.0.1`, `10.0.0`, `9.0.0`, `8.5.0`
- `8.4.0`, `8.3.0`, `8.2.2`, `8.2.1`, `8.2.0`
- `8.1.1`, `8.1.0`, `8.0.1`, `8.0.0`, `7.3.0`
- `7.2.0`, `7.1.0`, `7.0.1`, `7.0.0`, `5.3.1`

</details>

**Latest Version**: `999.999.999`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +harfbuzz.org@999.999.999 -- $SHELL -i
```

## Dependencies

This package depends on:

- `cairographics.org@1`
- `freetype.org@2`
- `gnome.org/glib@2`
- `graphite.sil.org`
- `unicode.org^71`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.harfbuzz

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/harfbuzz.org/package.yml)
- [Homepage](http://harfbuzz.github.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
