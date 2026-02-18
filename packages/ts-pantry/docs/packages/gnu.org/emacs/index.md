# emacs

> GNU Emacs text editor

## Package Information

- **Domain**: `gnu.org/emacs`
- **Name**: `emacs`
- **Homepage**: <https://www.gnu.org/software/emacs/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/emacs/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/emacs
```

## Programs

This package provides the following executable programs:

- `emacs`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `30.2.0`
- `30.1.0`
- `29.4.0`
- `29.3.0`
- `29.2.0`
- `29.1.0`
- `28.2.0`

</details>

**Latest Version**: `30.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/emacs@30.2.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/libxml2^2.10.3`
- `invisible-island.net/ncurses^6.3.0`
- `libjpeg-turbo.org^2.1.5.1`
- `gnu.org/sed^4.9.0`
- `gnu.org/texinfo^7.0.1`
- `gnu.org/libidn2^2.3`
- `gnutls.org^3.6`
- `zlib.net^1.2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.emacs

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/emacs/package.yml)
- [Homepage](https://www.gnu.org/software/emacs/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
