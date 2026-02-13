# tinygo

> Go compiler for small places. Microcontrollers, WebAssembly (WASM/WASI), and command-line tools. Based on LLVM.

## Package Information

- **Domain**: `tinygo.org`
- **Name**: `tinygo`
- **Homepage**: https://tinygo.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/tinygo.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install tinygo.org
```

## Programs

This package provides the following executable programs:

- `tinygo`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `0.40.1`, `0.40.0`, `0.39.0`, `0.38.0`, `0.37.0`
- `0.36.0`, `0.35.0`, `0.34.0`, `0.33.0`, `0.32.0`
- `0.31.2`

</details>

**Latest Version**: `0.40.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +tinygo.org@0.40.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `go.dev`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tinygo

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/tinygo.org/package.yml)
- [Homepage](https://tinygo.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
