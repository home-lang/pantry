# lunarvim

> 🌙 LunarVim is an IDE layer for Neovim. Completely free and community driven.

## Package Information

- **Domain**: `lunarvim.org`
- **Name**: `lunarvim`
- **Homepage**: https://www.lunarvim.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/lunarvim.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install lunarvim.org
```

## Programs

This package provides the following executable programs:

- `lvim`
- `nvim`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `1.4.0`, `1.3.0`

</details>

**Latest Version**: `1.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +lunarvim.org@1.4.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/bash`
- `crates.io/fd-find`
- `pip.pypa.io`
- `python.org^3`
- `nodejs.org`
- `rust-lang.org/cargo`
- `neovim.io`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.lunarvim

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/lunarvim.org/package.yml)
- [Homepage](https://www.lunarvim.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
