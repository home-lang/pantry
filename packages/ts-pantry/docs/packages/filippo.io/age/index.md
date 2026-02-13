# age

> A simple, modern and secure encryption tool (and Go library) with small explicit keys, no config options, and UNIX-style composability.

## Package Information

- **Domain**: `filippo.io/age`
- **Name**: `age`
- **Homepage**: https://age-encryption.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/filippo.io/age/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install filippo.io/age
```

## Programs

This package provides the following executable programs:

- `age`
- `age-keygen`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `1.3.1`, `1.3.0`, `1.2.1`, `1.2.0`, `1.1.1`

</details>

**Latest Version**: `1.3.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +filippo.io/age@1.3.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.age

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/filippo.io/age/package.yml)
- [Homepage](https://age-encryption.org)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
