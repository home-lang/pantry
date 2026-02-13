# zola

> A fast static site generator in a single binary with everything built-in. https://www.getzola.org

## Package Information

- **Domain**: `getzola.org`
- **Name**: `zola`
- **Homepage**: https://www.getzola.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/getzola.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install getzola.org
```

## Programs

This package provides the following executable programs:

- `zola`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `0.22.1`, `0.22.0`, `0.21.0`, `0.20.0`, `0.19.2`
- `0.19.1`, `0.19.0`, `0.18.0`, `0.17.2`

</details>

**Latest Version**: `0.22.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +getzola.org@0.22.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.zola

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/getzola.org/package.yml)
- [Homepage](https://www.getzola.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
