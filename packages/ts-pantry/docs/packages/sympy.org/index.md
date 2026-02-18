# sympy

> A computer algebra system written in pure Python

## Package Information

- **Domain**: `sympy.org`
- **Name**: `sympy`
- **Homepage**: https://sympy.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sympy.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sympy.org
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `1.14.0`
- `1.13.3`, `1.13.2`, `1.13.1`, `1.13.0`
- `1.12.1`, `1.12.0`

</details>

**Latest Version**: `1.14.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sympy.org@1.14.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3.11`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.sympy

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sympy.org/package.yml)
- [Homepage](https://sympy.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
