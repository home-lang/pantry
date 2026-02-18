# d2

> D2 is a modern diagram scripting language that turns text to diagrams.

## Package Information

- **Domain**: `d2lang.com`
- **Name**: `d2`
- **Homepage**: <https://d2lang.com/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/d2lang.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install d2lang.com
```

## Programs

This package provides the following executable programs:

- `d2`

## Available Versions

<details>
<summary>Show all 12 versions</summary>

- `0.7.1`, `0.7.0`
- `0.6.9`, `0.6.8`, `0.6.7`, `0.6.6`, `0.6.5`, `0.6.4`, `0.6.3`, `0.6.2`, `0.6.1`, `0.6.0`

</details>

**Latest Version**: `0.7.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +d2lang.com@0.7.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.d2

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/d2lang.com/package.yml)
- [Homepage](https://d2lang.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
