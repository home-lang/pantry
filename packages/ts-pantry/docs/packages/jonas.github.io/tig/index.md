# tig

> Text interface for Git repositories

## Package Information

- **Domain**: `jonas.github.io/tig`
- **Name**: `tig`
- **Homepage**: <https://jonas.github.io/tig/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/jonas.github.io/tig/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install jonas.github.io/tig
```

## Programs

This package provides the following executable programs:

- `tig`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `2.6.0`, `2.5.12`, `2.5.11`, `2.5.10`, `2.5.9`
- `2.5.8`

</details>

**Latest Version**: `2.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +jonas.github.io/tig@2.6.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/libiconv^1`
- `invisible-island.net/ncurses^6`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tig

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/jonas.github.io/tig/package.yml)
- [Homepage](https://jonas.github.io/tig/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
