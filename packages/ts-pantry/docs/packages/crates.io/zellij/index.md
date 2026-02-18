# zellij

> Pluggable terminal workspace, with terminal multiplexer as the base feature

## Package Information

- **Domain**: `crates.io/zellij`
- **Name**: `zellij`
- **Homepage**: <https://zellij.dev>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/zellij/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/zellij
```

## Programs

This package provides the following executable programs:

- `zellij`

## Available Versions

<details>
<summary>Show all 20 versions</summary>

- `0.43.1`, `0.43.0`
- `0.42.2`, `0.42.1`, `0.42.0`
- `0.41.2`, `0.41.1`, `0.41.0`
- `0.40.1`, `0.40.0`
- `0.39.2`, `0.39.1`, `0.39.0`
- `0.38.2`, `0.38.1`, `0.38.0`
- `0.37.2`, `0.37.1`, `0.37.0`
- `0.36.0`

</details>

**Latest Version**: `0.43.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/zellij@0.43.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1`
- `curl.se@8`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.zellij

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/zellij/package.yml)
- [Homepage](https://zellij.dev)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
