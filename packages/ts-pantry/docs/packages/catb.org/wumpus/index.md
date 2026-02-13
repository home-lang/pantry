# wumpus

> Exact clone of the ancient BASIC Hunt the Wumpus game

## Package Information

- **Domain**: `catb.org/wumpus`
- **Name**: `wumpus`
- **Homepage**: http://www.catb.org/~esr/wumpus/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/catb.org/wumpus/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install catb.org/wumpus
```

## Programs

This package provides the following executable programs:

- `wumpus`
- `superhack`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `1.10.0`, `1.9.0`, `1.8.0`, `1.6.0`, `1.5.0`
- `1.4.0`

</details>

**Latest Version**: `1.10.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +catb.org/wumpus@1.10.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.wumpus

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/catb.org/wumpus/package.yml)
- [Homepage](http://www.catb.org/~esr/wumpus/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
