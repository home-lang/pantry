# rustup

> The Rust toolchain installer

## Package Information

- **Domain**: `rust-lang.org/rustup`
- **Name**: `rustup`
- **Homepage**: https://rust-lang.github.io/rustup/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rust-lang.org/rustup/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rust-lang.org/rustup
```

## Programs

This package provides the following executable programs:

- `rustup`
- `rustup-init`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `1.28.2`, `1.28.1`, `1.28.0`, `1.27.1`, `1.27.0`

</details>

**Latest Version**: `1.28.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rust-lang.org/rustup@1.28.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:curl.se`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rustup

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rust-lang.org/rustup/package.yml)
- [Homepage](https://rust-lang.github.io/rustup/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
