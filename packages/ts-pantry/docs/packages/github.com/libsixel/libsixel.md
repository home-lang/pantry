# libsixel

> Mirror of "sixel" original version (kmiya's sixel). The origin of libsixel.

## Package Information

- **Domain**: `github.com/libsixel/libsixel`
- **Name**: `libsixel`
- **Homepage**: http://nanno.dip.jp/softlib/man/rlogin/#REGWIND
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libsixel/libsixel/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/libsixel/libsixel
```

## Programs

This package provides the following executable programs:

- `img2sixel`
- `sixel2png`
- `libsixel-config`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.10.3`

</details>

**Latest Version**: `1.10.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/libsixel/libsixel@1.10.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libjpeg-turbo.org`
- `libpng.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libsixel

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libsixel/libsixel/package.yml)
- [Homepage](http://nanno.dip.jp/softlib/man/rlogin/#REGWIND)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
