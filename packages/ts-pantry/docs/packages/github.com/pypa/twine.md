# twine

> Utilities for interacting with PyPI

## Package Information

- **Domain**: `github.com/pypa/twine`
- **Name**: `twine`
- **Homepage**: <https://twine.readthedocs.io/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/pypa/twine/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/pypa/twine
```

## Programs

This package provides the following executable programs:

- `twine`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `6.2.0`
- `6.1.0`
- `6.0.1`, `6.0.0`
- `5.1.1`, `5.1.0`
- `5.0.0`
- `4.0.2`

</details>

**Latest Version**: `6.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/pypa/twine@6.2.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3.7<3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.twine

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/pypa/twine/package.yml)
- [Homepage](https://twine.readthedocs.io/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
