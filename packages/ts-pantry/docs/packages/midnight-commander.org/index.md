# Midnight Commander

> Terminal-based visual file manager

## Package Information

- **Domain**: `midnight-commander.org`
- **Name**: `Midnight Commander`
- **Homepage**: <https://www.midnight-commander.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/midnight-commander.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install midnight-commander.org
```

## Programs

This package provides the following executable programs:

- `mc`
- `mcdiff`
- `mcedit`
- `mcview`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `4.8.33`, `4.8.32`, `4.8.31`, `4.8.30`, `4.8.29`, `4.8.28`

</details>

**Latest Version**: `4.8.33`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +midnight-commander.org@4.8.33 -- $SHELL -i
```

## Dependencies

This package depends on:

- `invisible-island.net/ncurses`
- `gnome.org/glib>=2.30`
- `gnu.org/gettext>=0.18.2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['Midnight Commander']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/midnight-commander.org/package.yml)
- [Homepage](https://www.midnight-commander.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
