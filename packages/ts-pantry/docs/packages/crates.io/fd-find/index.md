# fd

> A simple, fast and user-friendly alternative to 'find'

## Package Information

- **Domain**: `crates.io/fd-find`
- **Name**: `fd`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/fd-find/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/fd-find
```

## Programs

This package provides the following executable programs:

- `fd`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `10.3.0`
- `10.2.0`
- `10.1.0`
- `10.0.0`
- `9.0.0`
- `8.7.1`, `8.7.0`
- `8.6.0`
- `8.5.3`

</details>

**Latest Version**: `10.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/fd-find@10.3.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.fd

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/fd-find/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
