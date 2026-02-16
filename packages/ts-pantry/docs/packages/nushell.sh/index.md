# nu

> Modern shell for the GitHub era

## Package Information

- **Domain**: `nushell.sh`
- **Name**: `nu`
- **Homepage**: https://www.nushell.sh
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/nushell.sh/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install nushell.sh
```

## Programs

This package provides the following executable programs:

- `nu`

## Available Versions

<details>
<summary>Show all 55 versions</summary>

- `0.110.0`, `0.109.1`, `0.109.0`, `0.108.0`, `0.107.0`
- `0.106.1`, `0.106.0`, `0.105.1`, `0.105.0`, `0.104.1`
- `0.104.0`, `0.103.0`, `0.102.0`, `0.101.0`, `0.100.0`
- `0.99.1`, `0.99.0`, `0.98.0`, `0.97.1`, `0.97.0`
- `0.96.1`, `0.96.0`, `0.95.0`, `0.94.2`, `0.94.1`
- `0.94.0`, `0.93.0`, `0.92.2`, `0.92.1`, `0.92.0`
- `0.91.0`, `0.90.1`, `0.90.0`, `0.89.0`, `0.88.1`
- `0.88.0`, `0.87.1`, `0.87.0`, `0.86.0`, `0.85.0`
- `0.84.0`, `0.83.1`, `0.83.0`, `0.82.0`, `0.81.0`
- `0.80.0`, `0.79.0`, `0.78.0`, `0.77.1`, `0.77.0`
- `0.76.0`, `0.75.0`, `0.74.0`, `0.73.0`, `0.72.1`

</details>

**Latest Version**: `0.110.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +nushell.sh@0.110.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.nu

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/nushell.sh/package.yml)
- [Homepage](https://www.nushell.sh)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
