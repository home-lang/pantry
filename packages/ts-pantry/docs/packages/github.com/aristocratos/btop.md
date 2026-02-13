# btop

> Resource monitor. C++ version and continuation of bashtop and bpytop

## Package Information

- **Domain**: `github.com/aristocratos/btop`
- **Name**: `btop`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/aristocratos/btop/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/aristocratos/btop
```

## Programs

This package provides the following executable programs:

- `btop`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `1.4.6`, `1.4.5`, `1.4.4`, `1.4.3`, `1.4.2`
- `1.4.1`, `1.4.0`, `1.3.2`, `1.3.1`, `1.3.0`

</details>

**Latest Version**: `1.4.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/aristocratos/btop@1.4.6 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:gnu.org/gcc/libstdcxx@14`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.btop

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/aristocratos/btop/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
