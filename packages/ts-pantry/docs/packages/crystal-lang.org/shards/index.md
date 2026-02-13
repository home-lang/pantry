# shards

> Fast and statically typed, compiled language with Ruby-like syntax

## Package Information

- **Domain**: `crystal-lang.org/shards`
- **Name**: `shards`
- **Homepage**: https://crystal-lang.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crystal-lang.org/shards/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crystal-lang.org/shards
```

## Programs

This package provides the following executable programs:

- `shards`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `0.20.0`, `0.19.1`, `0.19.0`, `0.18.0`, `0.17.4`
- `0.17.3`

</details>

**Latest Version**: `0.20.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crystal-lang.org/shards@0.20.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `hboehm.info/gc^8`
- `pyyaml.org/libyaml^0`
- `crystal-lang.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.shards

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crystal-lang.org/shards/package.yml)
- [Homepage](https://crystal-lang.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
