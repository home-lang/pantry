# f2py

> The fundamental package for scientific computing with Python.

## Package Information

- **Domain**: `numpy.org`
- **Name**: `f2py`
- **Homepage**: https://www.numpy.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/numpy.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install numpy.org
```

## Programs

This package provides the following executable programs:

- `f2py`

## Available Versions

<details>
<summary>Show all 25 versions</summary>

- `2.4.1`, `2.4.0`, `2.3.5`, `2.3.4`, `2.3.3`
- `2.3.2`, `2.3.1`, `2.3.0`, `2.2.6`, `2.2.5`
- `2.2.4`, `2.2.3`, `2.2.2`, `2.2.1`, `2.2.0`
- `2.1.3`, `2.1.2`, `2.1.1`, `2.1.0`, `2.0.2`
- `2.0.1`, `2.0.0`, `1.26.4`, `1.26.3`, `1.26.2`

</details>

**Latest Version**: `2.4.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +numpy.org@2.4.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openblas.net^0.3`
- `python.org^3.11`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.f2py

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/numpy.org/package.yml)
- [Homepage](https://www.numpy.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
