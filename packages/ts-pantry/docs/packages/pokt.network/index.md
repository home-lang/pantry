# pocket

> Official implementation of the Pocket Network Protocol

## Package Information

- **Domain**: `pokt.network`
- **Name**: `pocket`
- **Homepage**: <http://www.pokt.network>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pokt.network/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pokt.network
```

## Programs

This package provides the following executable programs:

- `pocket`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `0.12.0`, `0.11.3`, `0.11.2`, `0.11.1`, `0.10.4`
- `0.10.3`, `0.10.0`, `0.9.2`

</details>

**Latest Version**: `0.12.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pokt.network@0.12.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pocket

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pokt.network/package.yml)
- [Homepage](http://www.pokt.network)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
