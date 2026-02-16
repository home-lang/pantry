# idn2

> International domain name library (IDNA2008, Punycode and TR46)

## Package Information

- **Domain**: `gnu.org/libidn2`
- **Name**: `idn2`
- **Homepage**: https://www.gnu.org/software/libidn/#libidn2
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/libidn2/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/libidn2
```

## Programs

This package provides the following executable programs:

- `idn2`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `2.3.8`, `2.3.7`, `2.3.6`, `2.3.5`, `2.3.4`

</details>

**Latest Version**: `2.3.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/libidn2@2.3.8 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/gettext`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.idn2

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/libidn2/package.yml)
- [Homepage](https://www.gnu.org/software/libidn/#libidn2)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
