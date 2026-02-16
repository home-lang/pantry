# cython

> Compiler for writing C extensions for the Python language

## Package Information

- **Domain**: `cython.org`
- **Name**: `cython`
- **Homepage**: https://cython.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/cython.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install cython.org
```

## Programs

This package provides the following executable programs:

- `cython`

## Available Versions

<details>
<summary>Show all 31 versions</summary>

- `3.2.4`, `3.2.3`, `3.2.2`, `3.2.1`, `3.2.0`
- `3.1.8`, `3.1.7`, `3.1.6`, `3.1.5`, `3.1.4`
- `3.1.3`, `3.1.2`, `3.1.1`, `3.1.0`, `3.0.12`
- `3.0.11`, `3.0.10`, `3.0.9`, `3.0.8`, `3.0.7`
- `3.0.6`, `3.0.5`, `3.0.4`, `3.0.3`, `3.0.2`
- `3.0.1`, `3.0.0`, `0.29.37.1`, `0.29.37`, `0.29.36`
- `0.29.35`

</details>

**Latest Version**: `3.2.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +cython.org@3.2.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org<3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cython

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/cython.org/package.yml)
- [Homepage](https://cython.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
