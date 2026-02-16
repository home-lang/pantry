# fontconfig

> XML-based font configuration API for X Windows

## Package Information

- **Domain**: `freedesktop.org/fontconfig`
- **Name**: `fontconfig`
- **Homepage**: <https://wiki.freedesktop.org/www/Software/fontconfig/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/fontconfig/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install freedesktop.org/fontconfig
```

## Programs

This package provides the following executable programs:

- `fc-cache`
- `fc-cat`
- `fc-conflist`
- `fc-list`
- `fc-match`
- `fc-pattern`
- `fc-query`
- `fc-scan`
- `fc-validate`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `2.17.1`, `2.17.0`, `2.16.2`, `2.16.0`, `2.15.0`
- `2.14.1`, `2.14.0`

</details>

**Latest Version**: `2.17.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +freedesktop.org/fontconfig@2.17.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `sourceware.org/bzip2@1`
- `freetype.org@2`
- `zlib.net@1`
- `gnome.org/libxml2@2`
- `libexpat.github.io@2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.fontconfig

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/fontconfig/package.yml)
- [Homepage](https://wiki.freedesktop.org/www/Software/fontconfig/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
