# setuptools

> Official project repository for the Setuptools build system

## Package Information

- **Domain**: `pypa.io/setuptools`
- **Name**: `setuptools`
- **Homepage**: https://pypi.org/project/setuptools/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pypa.io/setuptools/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pypa.io/setuptools
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 66 versions</summary>

- `80.10.1`, `80.9.0`, `80.8.0`, `80.7.1`, `80.7.0`
- `80.6.0`, `80.4.0`, `80.3.1`, `80.3.0`, `80.2.0`
- `80.1.0`, `80.0.1`, `80.0.0`, `79.0.1`, `79.0.0`
- `78.1.1`, `78.1.0`, `78.0.2`, `78.0.1`, `77.0.3`
- `77.0.1`, `76.1.0`, `76.0.0`, `75.9.1`, `75.9.0`
- `75.8.2`, `75.8.1`, `75.8.0`, `75.7.0`, `75.6.0`
- `75.5.0`, `75.4.0`, `75.3.3`, `75.3.1`, `75.3.0`
- `75.2.0`, `75.1.0`, `75.0.0`, `74.1.3`, `74.1.2`
- `74.1.1`, `74.1.0`, `74.0.0`, `73.0.0`, `72.2.0`
- `72.1.0`, `72.0.0`, `71.1.0`, `71.0.4`, `71.0.3`
- `71.0.2`, `71.0.1`, `71.0.0`, `70.3.0`, `70.2.0`
- `70.1.1`, `70.1.0`, `70.0.0`, `69.5.1`, `69.4.2`
- `69.4.1`, `69.4.0`, `69.3.1`, `69.3.0`, `69.2.0`
- `69.1.1`

</details>

**Latest Version**: `80.10.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pypa.io/setuptools@80.10.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.setuptools

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pypa.io/setuptools/package.yml)
- [Homepage](https://pypi.org/project/setuptools/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
