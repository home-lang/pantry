# nvim

> Ambitious Vim-fork focused on extensibility and agility

## Package Information

- **Domain**: `neovim.io`
- **Name**: `nvim`
- **Homepage**: https://neovim.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/neovim.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install neovim.io
```

## Programs

This package provides the following executable programs:

- `nvim`

## Available Versions

<details>
<summary>Show all 19 versions</summary>

- `0.11.6`, `0.11.5`, `0.11.4`, `0.11.3`, `0.11.2`, `0.11.1`, `0.11.0`
- `0.10.4`, `0.10.3`, `0.10.2`, `0.10.1`, `0.10.0`
- `0.9.5`, `0.9.4`, `0.9.2`, `0.9.1`, `0.9.0`
- `0.8.2`, `0.8.1`

</details>

**Latest Version**: `0.11.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +neovim.io@0.11.6 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/gettext^0`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.nvim

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/neovim.io/package.yml)
- [Homepage](https://neovim.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
