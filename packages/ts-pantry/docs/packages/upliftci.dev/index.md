# uplift

> Semantic versioning the easy way. Powered by Conventional Commits. Built for use with CI.

## Package Information

- **Domain**: `upliftci.dev`
- **Name**: `uplift`
- **Homepage**: <https://upliftci.dev>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/upliftci.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install upliftci.dev
```

## Programs

This package provides the following executable programs:

- `uplift`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `2.26.0`, `2.25.0`, `2.24.1`, `2.24.0`, `2.23.0`
- `2.22.0`

</details>

**Latest Version**: `2.26.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +upliftci.dev@2.26.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.uplift

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/upliftci.dev/package.yml)
- [Homepage](https://upliftci.dev)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
