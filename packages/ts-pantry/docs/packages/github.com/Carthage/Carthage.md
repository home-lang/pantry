# carthage

> A simple, decentralized dependency manager for Cocoa

## Package Information

- **Domain**: `github.com/Carthage/Carthage`
- **Name**: `carthage`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Carthage/Carthage/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/Carthage/Carthage
```

## Programs

This package provides the following executable programs:

- `carthage`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.40.0`
- `0.39.1`, `0.39.0`

</details>

**Latest Version**: `0.40.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/Carthage/Carthage@0.40.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.carthage

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Carthage/Carthage/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
