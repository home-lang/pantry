# rage

> A simple, secure and modern file encryption tool (and Rust library) with small explicit keys, no config options, and UNIX-style composability.

## Package Information

- **Domain**: `crates.io/rage`
- **Name**: `rage`
- **Homepage**: <https://str4d.xyz/rage>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/rage/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/rage
```

## Programs

This package provides the following executable programs:

- `rage`
- `rage-keygen`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `0.11.1`, `0.11.0`, `0.10.1`, `0.10.0`, `0.9.3`
- `0.9.2`

</details>

**Latest Version**: `0.11.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/rage@0.11.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rage

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/rage/package.yml)
- [Homepage](https://str4d.xyz/rage)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
