# gpp

> General-purpose preprocessor with customizable syntax

## Package Information

- **Domain**: `logological.org/gpp`
- **Name**: `gpp`
- **Homepage**: <https://logological.org/gpp>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/logological.org/gpp/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install logological.org/gpp
```

## Programs

This package provides the following executable programs:

- `gpp`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.28.0`, `2.27.0`

</details>

**Latest Version**: `2.28.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +logological.org/gpp@2.28.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gpp

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/logological.org/gpp/package.yml)
- [Homepage](https://logological.org/gpp)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
