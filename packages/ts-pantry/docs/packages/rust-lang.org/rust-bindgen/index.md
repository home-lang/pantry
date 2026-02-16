# bindgen

> Automatically generates Rust FFI bindings to C (and some C++) libraries.

## Package Information

- **Domain**: `rust-lang.org/rust-bindgen`
- **Name**: `bindgen`
- **Homepage**: <https://rust-lang.github.io/rust-bindgen/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rust-lang.org/rust-bindgen/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rust-lang.org/rust-bindgen
```

## Programs

This package provides the following executable programs:

- `bindgen`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `0.72.1`, `0.72.0`, `0.71.1`, `0.71.0`, `0.70.1`

</details>

**Latest Version**: `0.72.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rust-lang.org/rust-bindgen@0.72.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:llvm.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.bindgen

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rust-lang.org/rust-bindgen/package.yml)
- [Homepage](https://rust-lang.github.io/rust-bindgen/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
