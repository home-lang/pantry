# cfssl

> CFSSL: Cloudflare's PKI and TLS toolkit

## Package Information

- **Domain**: `cfssl.org`
- **Name**: `cfssl`
- **Homepage**: <https://cfssl.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/cfssl.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install cfssl.org
```

## Programs

This package provides the following executable programs:

- `cfssl`
- `cfssl-bundle`
- `cfssl-certinfo`
- `cfssl-newkey`
- `cfssl-scan`
- `cfssljson`
- `mkbundle`
- `multirootca`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.6.5`

</details>

**Latest Version**: `1.6.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +cfssl.org@1.6.5 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cfssl

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/cfssl.org/package.yml)
- [Homepage](https://cfssl.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
