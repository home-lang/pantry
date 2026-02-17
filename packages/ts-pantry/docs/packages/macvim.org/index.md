# macvim

> Vim - the text editor - for macOS

## Package Information

- **Domain**: `macvim.org`
- **Name**: `macvim`
- **Homepage**: https://macvim.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/macvim.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install macvim.org
```

## Programs

This package provides the following executable programs:

- `gview`
- `gvim`
- `gvimdiff`
- `gvimtutor`
- `mview`
- `mvim`
- `mvimdiff`
- `mvimtutor`
- `view`
- `vim`
- `vimdiff`
- `vimtutor`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `182.0.0`
- `181.0.0`
- `180.0.0`
- `179.0.0`
- `178.0.0`
- `177.0.0`

</details>

**Latest Version**: `182.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +macvim.org@182.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `cscope.sourceforge.io`
- `invisible-island.net/ncurses`
- `lua.org`
- `python.org~3.11`
- `ruby-lang.org`
- `libsodium.org`
- `gnu.org/gettext`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.macvim

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/macvim.org/package.yml)
- [Homepage](https://macvim.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
