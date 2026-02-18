# fnm

> 🚀 Fast and simple Node.js version manager, built in Rust

## Package Information

- **Domain**: `crates.io/fnm`
- **Name**: `fnm`
- **Homepage**: <https://fnm.vercel.app>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/fnm/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/fnm
```

## Programs

This package provides the following executable programs:

- `fnm`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `1.38.1`, `1.38.0`
- `1.37.2`, `1.37.1`, `1.37.0`
- `1.36.0`
- `1.35.1`, `1.35.0`

</details>

**Latest Version**: `1.38.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/fnm@1.38.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `darwin:zlib.net^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.fnm

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/fnm/package.yml)
- [Homepage](https://fnm.vercel.app)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
