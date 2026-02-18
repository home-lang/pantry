# ncdu

> NCurses Disk Usage

## Package Information

- **Domain**: `dev.yorhel.nl/ncdu`
- **Name**: `ncdu`
- **Homepage**: <https://dev.yorhel.nl/ncdu>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/dev.yorhel.nl/ncdu/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install dev.yorhel.nl/ncdu
```

## Programs

This package provides the following executable programs:

- `ncdu`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `1.22.0`
- `1.21.0`
- `1.20.0`
- `1.19.0`
- `1.18.1`

</details>

**Latest Version**: `1.22.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +dev.yorhel.nl/ncdu@1.22.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `invisible-island.net/ncurses`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ncdu

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/dev.yorhel.nl/ncdu/package.yml)
- [Homepage](https://dev.yorhel.nl/ncdu)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
