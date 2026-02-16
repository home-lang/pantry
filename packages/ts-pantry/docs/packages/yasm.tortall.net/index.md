# yasm

> Yasm Assembler mainline development tree

## Package Information

- **Domain**: `yasm.tortall.net`
- **Name**: `yasm`
- **Homepage**: <https://yasm.tortall.net/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/yasm.tortall.net/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install yasm.tortall.net
```

## Programs

This package provides the following executable programs:

- `yasm`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.3.0`

</details>

**Latest Version**: `1.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +yasm.tortall.net@1.3.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.yasm

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/yasm.tortall.net/package.yml)
- [Homepage](https://yasm.tortall.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
