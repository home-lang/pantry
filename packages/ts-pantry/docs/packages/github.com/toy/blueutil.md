# blueutil

> CLI for bluetooth on OSX: power, discoverable state, list, inquire devices, connect, info, …

## Package Information

- **Domain**: `github.com/toy/blueutil`
- **Name**: `blueutil`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/toy/blueutil/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/toy/blueutil
```

## Programs

This package provides the following executable programs:

- `blueutil`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `2.13.0`, `2.12.0`, `2.11.0`, `2.10.0`, `2.9.1`

</details>

**Latest Version**: `2.13.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/toy/blueutil@2.13.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.blueutil

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/toy/blueutil/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
