# samply

> Command-line sampling profiler for macOS, Linux, and Windows

## Package Information

- **Domain**: `crates.io/samply`
- **Name**: `samply`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/samply/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/samply
```

## Programs

This package provides the following executable programs:

- `samply`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.13.1`, `0.13.0`
- `0.12.0`

</details>

**Latest Version**: `0.13.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/samply@0.13.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.samply

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/samply/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
