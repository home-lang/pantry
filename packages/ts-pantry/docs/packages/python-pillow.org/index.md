# python-pillow

> Python Imaging Library (Fork)

## Package Information

- **Domain**: `python-pillow.org`
- **Name**: `python-pillow`
- **Homepage**: https://python-pillow.github.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/python-pillow.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install python-pillow.org
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `12.1.0`, `12.0.0`, `11.3.0`, `11.2.1`, `11.1.0`
- `11.0.0`, `10.4.0`, `10.3.0`, `10.2.0`

</details>

**Latest Version**: `12.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +python-pillow.org@12.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libjpeg-turbo.org^2`
- `pngquant.org/lib^4`
- `simplesystems.org/libtiff^4`
- `x.org/xcb^1`
- `littlecms.com^2`
- `openjpeg.org^2`
- `tcl.tk/tcl^8`
- `google.com/webp^1`
- `zlib.net^1`
- `python.org~3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['python-pillow']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/python-pillow.org/package.yml)
- [Homepage](https://python-pillow.github.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
