# exa

> A modern replacement for ‘ls’.

## Package Information

- **Domain**: `crates.io/exa`
- **Name**: `exa`
- **Homepage**: https://the.exa.website/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/exa/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/exa
```

## Programs

This package provides the following executable programs:

- `exa`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.10.1`

</details>

**Latest Version**: `0.10.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/exa@0.10.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `darwin:zlib.net^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.exa

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/exa/package.yml)
- [Homepage](https://the.exa.website/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
