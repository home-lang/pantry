# distlib

> A low-level library which implements some Python packaging standards (PEPs) and which could be used by third-party packaging tools to achieve interoperability.

## Package Information

- **Domain**: `pypa.io/distlib`
- **Name**: `distlib`
- **Homepage**: http://distlib.readthedocs.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pypa.io/distlib/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pypa.io/distlib
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.3.6`

</details>

**Latest Version**: `0.3.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pypa.io/distlib@0.3.6 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3.11`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.distlib

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pypa.io/distlib/package.yml)
- [Homepage](http://distlib.readthedocs.io/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
