# duf

> Disk Usage/Free Utility - a better 'df' alternative

## Package Information

- **Domain**: `github.com/muesli/duf`
- **Name**: `duf`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/muesli/duf/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/muesli/duf
```

## Programs

This package provides the following executable programs:

- `duf`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.9.1`, `0.9.0`, `0.8.1`

</details>

**Latest Version**: `0.9.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/muesli/duf@0.9.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.duf

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/muesli/duf/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
