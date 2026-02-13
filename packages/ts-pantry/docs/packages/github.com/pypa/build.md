# pyproject-build

> A simple, correct Python build frontend

## Package Information

- **Domain**: `github.com/pypa/build`
- **Name**: `pyproject-build`
- **Homepage**: https://build.pypa.io
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/pypa/build/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/pypa/build
```

## Programs

This package provides the following executable programs:

- `pyproject-build`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `1.4.0`, `1.3.0`, `1.2.2`, `1.2.1`, `1.2.0`
- `1.1.1`, `1.1.0`, `1.0.3`, `1.0.1`, `1.0.0`
- `0.10.0`

</details>

**Latest Version**: `1.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/pypa/build@1.4.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['pyproject-build']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/pypa/build/package.yml)
- [Homepage](https://build.pypa.io)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
