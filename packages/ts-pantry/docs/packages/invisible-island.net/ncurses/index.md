# ncurses

> Text-based UI library

## Package Information

- **Domain**: `invisible-island.net/ncurses`
- **Name**: `ncurses`
- **Homepage**: https://invisible-island.net/ncurses/announce.html
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/invisible-island.net/ncurses/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install invisible-island.net/ncurses
```

## Programs

This package provides the following executable programs:

- `captoinfo`
- `clear`
- `infocmp`
- `infotocap`
- `ncursesw6-config`
- `reset`
- `tabs`
- `tic`
- `toe`
- `tput`
- `tset`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `6.6.0`, `6.5.0`, `6.4.0`, `6.3.0`

</details>

**Latest Version**: `6.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +invisible-island.net/ncurses@6.6.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ncurses

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/invisible-island.net/ncurses/package.yml)
- [Homepage](https://invisible-island.net/ncurses/announce.html)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
