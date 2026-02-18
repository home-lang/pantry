# wxwidgets

> Cross-Platform C++ GUI Library

## Package Information

- **Domain**: `wxwidgets.org`
- **Name**: `wxwidgets`
- **Homepage**: <https://www.wxwidgets.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/wxwidgets.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install wxwidgets.org
```

## Programs

This package provides the following executable programs:

- `wx-config`
- `wxrc`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `3.3.1`, `3.3.0`
- `3.2.9`, `3.2.8.1`, `3.2.8`, `3.2.7`, `3.2.6`, `3.2.5`, `3.2.4`, `3.2.3`

</details>

**Latest Version**: `3.3.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +wxwidgets.org@3.3.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libjpeg-turbo.org`
- `libpng.org`
- `simplesystems.org/libtiff`
- `pcre.org/v2`
- `libexpat.github.io`
- `zlib.net`
- `linux:x.org/sm`
- `linux:freedesktop.org/mesa-glu`
- `linux:gtk.org/gtk3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.wxwidgets

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/wxwidgets.org/package.yml)
- [Homepage](https://www.wxwidgets.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
