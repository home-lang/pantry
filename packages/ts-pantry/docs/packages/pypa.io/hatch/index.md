# hatch

> Modern, extensible Python project management

## Package Information

- **Domain**: `pypa.io/hatch`
- **Name**: `hatch`
- **Homepage**: <https://hatch.pypa.io/latest/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pypa.io/hatch/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pypa.io/hatch
```

## Programs

This package provides the following executable programs:

- `hatch`
- `hatchling`

## Available Versions

<details>
<summary>Show all 18 versions</summary>

- `1.28.0`
- `1.27.0`
- `1.26.3`, `1.26.2`, `1.26.1`, `1.26.0`
- `1.25.0`
- `1.24.2`, `1.24.1`, `1.24.0`
- `1.23.0`
- `1.22.5`, `1.22.4`, `1.22.3`, `1.22.2`, `1.22.1`, `1.22.0`
- `1.21.1`

</details>

**Latest Version**: `1.28.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pypa.io/hatch@1.28.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.hatch

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pypa.io/hatch/package.yml)
- [Homepage](https://hatch.pypa.io/latest/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
