# mint

> Dependency manager that installs and runs Swift command-line tool packages

## Package Information

- **Domain**: `github.com/yonaskolb/Mint`
- **Name**: `mint`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/yonaskolb/Mint/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/yonaskolb/Mint
```

## Programs

This package provides the following executable programs:

- `mint`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.18.0`, `0.17.5`

</details>

**Latest Version**: `0.18.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/yonaskolb/Mint@0.18.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mint

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/yonaskolb/Mint/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
