# create-dmg

> A shell script to build fancy DMGs

## Package Information

- **Domain**: `github.com/create-dmg/create-dmg`
- **Name**: `create-dmg`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/create-dmg/create-dmg/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/create-dmg/create-dmg
```

## Programs

This package provides the following executable programs:

- `create-dmg`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `1.2.3`, `1.2.2`, `1.2.1`, `1.2.0`
- `1.1.0`

</details>

**Latest Version**: `1.2.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/create-dmg/create-dmg@1.2.3 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['create-dmg']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/create-dmg/create-dmg/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
