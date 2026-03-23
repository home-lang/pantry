# Stats

> A macOS system monitor in your menu bar.

## Package Information

- **Domain**: `stats.app`
- **Name**: `Stats`
- **Homepage**: <https://github.com/exelban/stats>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/stats.app/package.yml)

## Installation

```bash
# Install with pantry
pantry install stats.app
```

## Programs

This package provides the following executable programs:

- `stats`

## Aliases

This package can also be accessed using these aliases:

- `stats`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `2.11.23`, `2.11.22`, `2.11.21`

</details>

**Latest Version**: `2.11.23`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +stats.app@2.11.23 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.stats

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/stats.app/package.yml)
- [Homepage](https://github.com/exelban/stats)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
