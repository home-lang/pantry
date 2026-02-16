# direnv

> Load/unload environment variables based on $PWD

## Package Information

- **Domain**: `direnv.net`
- **Name**: `direnv`
- **Homepage**: <https://direnv.net/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/direnv.net/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install direnv.net
```

## Programs

This package provides the following executable programs:

- `direnv`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `2.37.1`, `2.37.0`, `2.36.0`, `2.35.0`, `2.34.0`
- `2.33.0`, `2.32.3`, `2.32.2`

</details>

**Latest Version**: `2.37.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +direnv.net@2.37.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.direnv

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/direnv.net/package.yml)
- [Homepage](https://direnv.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
