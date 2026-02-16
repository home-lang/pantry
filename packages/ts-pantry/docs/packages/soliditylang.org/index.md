# soliditylang

> Solidity, the Smart Contract Programming Language

## Package Information

- **Domain**: `soliditylang.org`
- **Name**: `soliditylang`
- **Homepage**: https://soliditylang.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/soliditylang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install soliditylang.org
```

## Programs

This package provides the following executable programs:

- `solc`
- `yul-phaser`

## Available Versions

<details>
<summary>Show all 17 versions</summary>

- `0.8.33`, `0.8.32`, `0.8.31`, `0.8.30`, `0.8.29`
- `0.8.28`, `0.8.27`, `0.8.26`, `0.8.25`, `0.8.24`
- `0.8.23`, `0.8.22`, `0.8.21`, `0.8.20`, `0.8.19`
- `0.8.18`, `0.8.17`

</details>

**Latest Version**: `0.8.33`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +soliditylang.org@0.8.33 -- $SHELL -i
```

## Dependencies

This package depends on:

- `boost.org~1.84`
- `linux:gnu.org/gcc/libstdcxx@14`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.soliditylang

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/soliditylang.org/package.yml)
- [Homepage](https://soliditylang.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
