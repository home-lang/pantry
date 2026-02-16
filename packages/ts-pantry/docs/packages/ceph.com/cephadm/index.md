# cephadm

> Ceph is a distributed object, block, and file storage platform

## Package Information

- **Domain**: `ceph.com/cephadm`
- **Name**: `cephadm`
- **Homepage**: https://ceph.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ceph.com/cephadm/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ceph.com/cephadm
```

## Programs

This package provides the following executable programs:

- `cephadm`

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `20.3.0`, `20.2.0`, `20.1.1`, `20.1.0`, `20.0.0`
- `19.3.0`, `19.2.3`, `19.2.2`, `19.2.1`, `18.2.8`
- `18.2.7`, `18.2.6`, `18.2.5`

</details>

**Latest Version**: `20.3.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ceph.com/cephadm@20.3.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `python.org^3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cephadm

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ceph.com/cephadm/package.yml)
- [Homepage](https://ceph.io)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
