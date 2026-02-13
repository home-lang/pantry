# openbao

> OpenBao exists to provide a software solution to manage, store, and distribute sensitive data including secrets, certificates, and keys.

## Package Information

- **Domain**: `openbao.org/openbao`
- **Name**: `openbao`
- **Homepage**: https://openbao.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openbao.org/openbao/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openbao.org/openbao
```

## Programs

This package provides the following executable programs:

- `bao`
- `bao-setup`

## Available Versions

<details>
<summary>Show all 15 versions</summary>

- `2.4.4`, `2.4.3`, `2.4.1`, `2.4.0`, `2.3.2`
- `2.3.1`, `2.2.2`, `2.2.1`, `2.2.0`, `2.1.1`
- `2.1.0`, `2.0.3`, `2.0.2`, `2.0.1`, `2.0.0`

</details>

**Latest Version**: `2.4.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +openbao.org/openbao@2.4.4 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.openbao

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openbao.org/openbao/package.yml)
- [Homepage](https://openbao.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
