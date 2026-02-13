# htop

> Improved top (interactive process viewer)

## Package Information

- **Domain**: `htop.dev`
- **Name**: `htop`
- **Homepage**: https://htop.dev/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/htop.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install htop.dev
```

## Programs

This package provides the following executable programs:

- `htop`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `3.4.1`, `3.4.0`, `3.3.0`, `3.2.2`, `3.2.1`

</details>

**Latest Version**: `3.4.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +htop.dev@3.4.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `invisible-island.net/ncurses@6`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.htop

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/htop.dev/package.yml)
- [Homepage](https://htop.dev/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
