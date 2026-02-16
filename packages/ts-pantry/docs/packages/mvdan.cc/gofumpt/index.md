# gofumpt

> A stricter gofmt

## Package Information

- **Domain**: `mvdan.cc/gofumpt`
- **Name**: `gofumpt`
- **Homepage**: <https://pkg.go.dev/mvdan.cc/gofumpt>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mvdan.cc/gofumpt/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mvdan.cc/gofumpt
```

## Programs

This package provides the following executable programs:

- `gofumpt`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `0.9.2`, `0.9.1`, `0.9.0`, `0.8.0`, `0.7.0`

</details>

**Latest Version**: `0.9.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mvdan.cc/gofumpt@0.9.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gofumpt

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mvdan.cc/gofumpt/package.yml)
- [Homepage](https://pkg.go.dev/mvdan.cc/gofumpt)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
