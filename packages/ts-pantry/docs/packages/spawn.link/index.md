# spawn.link

> a featureful union filesystem

## Package Information

- **Domain**: `spawn.link`
- **Name**: `spawn.link`
- **Homepage**: <https://trapexit.github.io/mergerfs/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/spawn.link/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install spawn.link
```

## Programs

This package provides the following executable programs:

- `mergerfs`
- `mergerfs-fusermount`
- `mount.mergerfs`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `2.41.1`, `2.41.0`
- `2.40.2`, `2.40.1`, `2.40.0`
- `2.39.0`
- `2.38.0`
- `2.37.1`, `2.37.0`
- `2.36.0`
- `2.35.1`

</details>

**Latest Version**: `2.41.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +spawn.link@2.41.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['spawn.link']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/spawn.link/package.yml)
- [Homepage](https://trapexit.github.io/mergerfs/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
