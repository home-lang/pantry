# cffi

> A Foreign Function Interface package for calling C libraries from Python.

## Package Information

- **Domain**: `github.com/python-cffi/cffi`
- **Name**: `cffi`
- **Homepage**: <https://cffi.readthedocs.io/en/latest/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/python-cffi/cffi/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/python-cffi/cffi
```

## Programs

This package provides the following executable programs:

No programs specified.

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `2.0.0`
- `1.17.1`, `1.17.0`
- `1.16.0`

</details>

**Latest Version**: `2.0.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/python-cffi/cffi@2.0.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3.11`
- `github.com/eliben/pycparser^2.21`
- `sourceware.org/libffi^3.4`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cffi

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/python-cffi/cffi/package.yml)
- [Homepage](https://cffi.readthedocs.io/en/latest/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
