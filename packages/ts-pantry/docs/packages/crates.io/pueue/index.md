# pueue

> Command-line tool for managing long-running shell commands

## Package Information

- **Domain**: `crates.io/pueue`
- **Name**: `pueue`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/pueue/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/pueue
```

## Programs

This package provides the following executable programs:

- `pueue`
- `pueued`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `4.0.2`, `4.0.1`, `4.0.0`, `3.4.1`, `3.4.0`
- `3.3.3`, `3.3.2`

</details>

**Latest Version**: `4.0.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/pueue@4.0.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pueue

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/pueue/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
