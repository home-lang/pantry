# get-blessed

> Terminal tool to get you the best crates for your rust projects, curated by blessed.rs

## Package Information

- **Domain**: `crates.io/get-blessed`
- **Name**: `get-blessed`
- **Homepage**: https://crates.io/crates/get-blessed
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/get-blessed/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/get-blessed
```

## Programs

This package provides the following executable programs:

- `get-blessed`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.2.1`, `0.2.0`
- `0.1.3`

</details>

**Latest Version**: `0.2.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/get-blessed@0.2.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:openssl.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['get-blessed']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/get-blessed/package.yml)
- [Homepage](https://crates.io/crates/get-blessed)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
