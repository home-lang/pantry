# sig

> Interactive grep (for streaming)

## Package Information

- **Domain**: `crates.io/sigrs`
- **Name**: `sig`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/sigrs/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/sigrs
```

## Programs

This package provides the following executable programs:

- `sig`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `0.2.1`, `0.2.0`
- `0.1.4`, `0.1.3`, `0.1.2`, `0.1.1`, `0.1.0`

</details>

**Latest Version**: `0.2.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/sigrs@0.2.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sig

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/sigrs/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
