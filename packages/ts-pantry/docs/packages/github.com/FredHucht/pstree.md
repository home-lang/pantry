# pstree

> pstree shows the process listing as a tree

## Package Information

- **Domain**: `github.com/FredHucht/pstree`
- **Name**: `pstree`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/FredHucht/pstree/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/FredHucht/pstree
```

## Programs

This package provides the following executable programs:

- `pstree`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.40.0`

</details>

**Latest Version**: `2.40.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/FredHucht/pstree@2.40.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pstree

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/FredHucht/pstree/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
