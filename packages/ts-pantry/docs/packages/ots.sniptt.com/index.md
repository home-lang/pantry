# ots

> 🔐 Share end-to-end encrypted secrets with others via a one-time URL

## Package Information

- **Domain**: `ots.sniptt.com`
- **Name**: `ots`
- **Homepage**: <https://ots.sniptt.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ots.sniptt.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ots.sniptt.com
```

## Programs

This package provides the following executable programs:

- `ots`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.3.1`, `0.3.0`
- `0.2.0`

</details>

**Latest Version**: `0.3.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ots.sniptt.com@0.3.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.ots

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ots.sniptt.com/package.yml)
- [Homepage](https://ots.sniptt.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
