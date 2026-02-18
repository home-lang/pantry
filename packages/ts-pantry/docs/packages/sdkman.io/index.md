# sdkman-init.sh

> The SDKMAN! Command Line Interface

## Package Information

- **Domain**: `sdkman.io`
- **Name**: `sdkman-init.sh`
- **Homepage**: <https://sdkman.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sdkman.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sdkman.io
```

## Programs

This package provides the following executable programs:

- `sdkman-init.sh`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `5.20.0`
- `5.19.0`
- `5.18.2`

</details>

**Latest Version**: `5.20.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sdkman.io@5.20.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['sdkman-init.sh']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sdkman.io/package.yml)
- [Homepage](https://sdkman.io)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
