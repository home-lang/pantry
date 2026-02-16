# curlie

> The power of curl, the ease of use of httpie.

## Package Information

- **Domain**: `curlie.io`
- **Name**: `curlie`
- **Homepage**: <https://rs.github.io/curlie>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/curlie.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install curlie.io
```

## Programs

This package provides the following executable programs:

- `curlie`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `1.8.2`, `1.7.2`

</details>

**Latest Version**: `1.8.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +curlie.io@1.8.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.curlie

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/curlie.io/package.yml)
- [Homepage](https://rs.github.io/curlie)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
