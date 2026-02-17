# swift-sh

> Easily script with third-party Swift dependencies.

## Package Information

- **Domain**: `github.com/mxcl/swift-sh`
- **Name**: `swift-sh`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mxcl/swift-sh/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/mxcl/swift-sh
```

## Programs

This package provides the following executable programs:

- `swift-sh`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.5.0`
- `2.4.0`

</details>

**Latest Version**: `2.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/mxcl/swift-sh@2.5.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['swift-sh']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mxcl/swift-sh/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
