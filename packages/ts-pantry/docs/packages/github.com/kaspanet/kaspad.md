# kaspad

> Kaspad was the reference full node Kaspa implementation written in Go (golang), now rewritten in Rust: <https://github.com/kaspanet/rusty-kaspa>

## Package Information

- **Domain**: `github.com/kaspanet/kaspad`
- **Name**: `kaspad`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kaspanet/kaspad/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/kaspanet/kaspad
```

## Programs

This package provides the following executable programs:

- `genkeypair`
- `kaspactl`
- `kaspad`
- `kaspaminer`
- `kaspawallet`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `0.12.22`, `0.12.21`, `0.12.20`, `0.12.19`, `0.12.18`, `0.12.17`, `0.12.15`, `0.12.14`

</details>

**Latest Version**: `0.12.22`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/kaspanet/kaspad@0.12.22 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.kaspad

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kaspanet/kaspad/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
