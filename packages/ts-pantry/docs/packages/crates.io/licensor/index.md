# licensor

> write licenses to stdout

## Package Information

- **Domain**: `crates.io/licensor`
- **Name**: `licensor`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/licensor/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/licensor
```

## Programs

This package provides the following executable programs:

- `licensor`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.1.0`, `2.0.0`

</details>

**Latest Version**: `2.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/licensor@2.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.licensor

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/licensor/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
