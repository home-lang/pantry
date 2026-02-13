# pyqt-bundle

> The PyQt build system

## Package Information

- **Domain**: `riverbankcomputing.com/pyqt-builder`
- **Name**: `pyqt-bundle`
- **Homepage**: https://pyqt-builder.readthedocs.io/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/riverbankcomputing.com/pyqt-builder/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install riverbankcomputing.com/pyqt-builder
```

## Programs

This package provides the following executable programs:

- `pyqt-bundle`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.15.4`, `1.15.3`, `1.15.2`

</details>

**Latest Version**: `1.15.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +riverbankcomputing.com/pyqt-builder@1.15.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.11`
- `riverbankcomputing.com/sip`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['pyqt-bundle']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/riverbankcomputing.com/pyqt-builder/package.yml)
- [Homepage](https://pyqt-builder.readthedocs.io/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
