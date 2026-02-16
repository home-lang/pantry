# shovel

> An Ethereum to Postgres indexer

## Package Information

- **Domain**: `indexsupply.com/shovel`
- **Name**: `shovel`
- **Homepage**: <https://indexsupply.com/shovel>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/indexsupply.com/shovel/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install indexsupply.com/shovel
```

## Programs

This package provides the following executable programs:

- `shovel`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `1.6.0`, `1.5.0`, `1.4.0`, `1.3.0`, `1.2.0`
- `1.1.0`, `1.0.0`

</details>

**Latest Version**: `1.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +indexsupply.com/shovel@1.6.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.shovel

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/indexsupply.com/shovel/package.yml)
- [Homepage](https://indexsupply.com/shovel)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
