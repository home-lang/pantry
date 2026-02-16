# mamba

> The Fast Cross-Platform Package Manager

## Package Information

- **Domain**: `github.com/mamba-org/mamba`
- **Name**: `mamba`
- **Homepage**: <https://mamba.readthedocs.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mamba-org/mamba/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/mamba-org/mamba
```

## Programs

This package provides the following executable programs:

- `mamba`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `22.11.1.4`

</details>

**Latest Version**: `22.11.1.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/mamba-org/mamba@22.11.1.4 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mamba

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mamba-org/mamba/package.yml)
- [Homepage](https://mamba.readthedocs.io)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
