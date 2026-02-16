# nettle

> A mirror of the nettle repository

## Package Information

- **Domain**: `gnu.org/nettle`
- **Name**: `nettle`
- **Homepage**: <https://www.lysator.liu.se/~nisse/nettle/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/nettle/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/nettle
```

## Programs

This package provides the following executable programs:

- `nettle-hash`
- `nettle-lfib-stream`
- `nettle-pbkdf2`
- `pkcs1-conv`
- `sexp-conv`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `4.0.0`, `3.10.2`, `3.10.1`, `3.10.0`, `3.9.1`
- `3.9.0`, `3.8.1`

</details>

**Latest Version**: `4.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/nettle@4.0.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.nettle

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/nettle/package.yml)
- [Homepage](https://www.lysator.liu.se/~nisse/nettle/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
