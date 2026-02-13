# bake

> Simple and easy to use "script runner" written in Rust.

## Package Information

- **Domain**: `crates.io/bake-rs`
- **Name**: `bake`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/bake-rs/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/bake-rs
```

## Programs

This package provides the following executable programs:

- `bake`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.2.0`

</details>

**Latest Version**: `1.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/bake-rs@1.2.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.bake

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/bake-rs/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
