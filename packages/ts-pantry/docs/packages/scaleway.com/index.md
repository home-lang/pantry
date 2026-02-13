# scw

> Command Line Interface for Scaleway

## Package Information

- **Domain**: `scaleway.com`
- **Name**: `scw`
- **Homepage**: https://www.scaleway.com/en/cli/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/scaleway.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install scaleway.com
```

## Programs

This package provides the following executable programs:

- `scw`

## Available Versions

<details>
<summary>Show all 20 versions</summary>

- `2.51.0`, `2.50.0`, `2.49.0`, `2.48.0`, `2.47.0`
- `2.46.0`, `2.45.0`, `2.44.0`, `2.43.0`, `2.42.0`
- `2.41.0`, `2.40.0`, `2.39.0`, `2.38.0`, `2.37.0`
- `2.36.0`, `2.35.0`, `2.34.0`, `2.33.0`, `2.32.1`

</details>

**Latest Version**: `2.51.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +scaleway.com@2.51.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.scw

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/scaleway.com/package.yml)
- [Homepage](https://www.scaleway.com/en/cli/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
