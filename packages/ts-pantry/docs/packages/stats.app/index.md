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
<summary>Show all 20 versions</summary>

- `2.12.5`, `2.12.4`, `2.12.3`, `2.12.2`, `2.12.1`, `2.12.0`
- `2.11.67`, `2.11.66`, `2.11.65`, `2.11.64`, `2.11.63`, `2.11.62`, `2.11.61`, `2.11.60`, `2.11.59`, `2.11.58`, `2.11.57`, `2.11.56`, `2.11.55`, `2.11.54`

</details>

**Latest Version**: `2.12.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +stats.app@2.12.5 -- $SHELL -i
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
