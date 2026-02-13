# checkmake

> experimental linter/analyzer for Makefiles

## Package Information

- **Domain**: `github.com/mrtazz/checkmake`
- **Name**: `checkmake`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mrtazz/checkmake/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/mrtazz/checkmake
```

## Programs

This package provides the following executable programs:

- `checkmake`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `0.3.2`, `0.3.1`, `0.3.0`, `0.2.2`

</details>

**Latest Version**: `0.3.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/mrtazz/checkmake@0.3.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.checkmake

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mrtazz/checkmake/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
