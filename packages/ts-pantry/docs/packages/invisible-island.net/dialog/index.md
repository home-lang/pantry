# dialog

> Display user-friendly message boxes from shell scripts

## Package Information

- **Domain**: `invisible-island.net/dialog`
- **Name**: `dialog`
- **Homepage**: <https://invisible-island.net/dialog/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/invisible-island.net/dialog/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install invisible-island.net/dialog
```

## Programs

This package provides the following executable programs:

- `dialog`
- `dialog-config`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.3.20230209`

</details>

**Latest Version**: `1.3.20230209`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +invisible-island.net/dialog@1.3.20230209 -- $SHELL -i
```

## Dependencies

This package depends on:

- `invisible-island.net/ncurses`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.dialog

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/invisible-island.net/dialog/package.yml)
- [Homepage](https://invisible-island.net/dialog/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
