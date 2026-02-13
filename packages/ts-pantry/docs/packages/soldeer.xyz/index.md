# soldeer

> Solidity Package Manager written in rust and integrated into Foundry (forge soldeer ...)

## Package Information

- **Domain**: `soldeer.xyz`
- **Name**: `soldeer`
- **Homepage**: https://soldeer.xyz
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/soldeer.xyz/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install soldeer.xyz
```

## Programs

This package provides the following executable programs:

- `soldeer`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `0.10.0`, `0.9.0`, `0.8.0`, `0.7.1`, `0.7.0`
- `0.6.1`, `0.6.0`, `0.5.4`, `0.5.3`, `0.5.2`

</details>

**Latest Version**: `0.10.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +soldeer.xyz@0.10.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.soldeer

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/soldeer.xyz/package.yml)
- [Homepage](https://soldeer.xyz)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
