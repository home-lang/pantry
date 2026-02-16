# mujs

> An embeddable Javascript interpreter in C.

## Package Information

- **Domain**: `mujs.com`
- **Name**: `mujs`
- **Homepage**: <https://www.mujs.com/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mujs.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mujs.com
```

## Programs

This package provides the following executable programs:

- `mujs`
- `mujs-pp`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `1.3.8`, `1.3.7`, `1.3.6`, `1.3.5`, `1.3.4`
- `1.3.3`

</details>

**Latest Version**: `1.3.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mujs.com@1.3.8 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/readline~8.1`
- `linux:invisible-island.net/ncurses`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mujs

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mujs.com/package.yml)
- [Homepage](https://www.mujs.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
