# rust

> Empowering everyone to build reliable and efficient software.

## Package Information

- **Domain**: `rust-lang.org`
- **Name**: `rust`
- **Homepage**: https://www.rust-lang.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rust-lang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rust-lang.org
```

## Programs

This package provides the following executable programs:

- `cargo-clippy`
- `cargo-fmt`
- `clippy-driver`
- `rust-analyzer`
- `rust-gdb`
- `rust-gdbgui`
- `rust-lldb`
- `rustc`
- `rustdoc`
- `rustfmt`

## Available Versions

<details>
<summary>Show all 41 versions</summary>

- `1.93.0`, `1.92.0`, `1.91.1`, `1.91.0`, `1.90.0`
- `1.89.0`, `1.88.0`, `1.87.0`, `1.86.0`, `1.85.1`
- `1.85.0`, `1.84.1`, `1.84.0`, `1.83.0`, `1.82.0`
- `1.81.0`, `1.80.1`, `1.80.0`, `1.79.0`, `1.78.0`
- `1.77.2`, `1.77.1`, `1.77.0`, `1.76.0`, `1.75.0`
- `1.74.1`, `1.74.0`, `1.73.0`, `1.72.1`, `1.72.0`
- `1.71.1`, `1.71.0`, `1.70.0`, `1.69.0`, `1.68.2`
- `1.68.1`, `1.68.0`, `1.67.1`, `1.67.0`, `1.65.0`
- `1.64.0`

</details>

**Latest Version**: `1.93.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rust-lang.org@1.93.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rust

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rust-lang.org/package.yml)
- [Homepage](https://www.rust-lang.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
