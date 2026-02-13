# cbindgen

> A project for generating C bindings from Rust code

## Package Information

- **Domain**: `mozilla.org/cbindgen`
- **Name**: `cbindgen`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mozilla.org/cbindgen/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mozilla.org/cbindgen
```

## Programs

This package provides the following executable programs:

- `cbindgen`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `0.29.0`, `0.28.0`, `0.27.0`, `0.26.0`

</details>

**Latest Version**: `0.29.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mozilla.org/cbindgen@0.29.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:llvm.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cbindgen

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mozilla.org/cbindgen/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
