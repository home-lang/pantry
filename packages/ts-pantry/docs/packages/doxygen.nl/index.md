# doxygen

> Generate documentation for several programming languages

## Package Information

- **Domain**: `doxygen.nl`
- **Name**: `doxygen`
- **Homepage**: https://www.doxygen.nl/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/doxygen.nl/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install doxygen.nl
```

## Programs

This package provides the following executable programs:

- `doxygen`

## Available Versions

<details>
<summary>Show all 13 versions</summary>

- `1.16.1`, `1.16.0`, `1.15.0`, `1.14.0`, `1.13.2`
- `1.13.1`, `1.13.0`, `1.12.0`, `1.11.0`, `1.10.0`
- `1.9.8`, `1.9.7`, `1.9.6`

</details>

**Latest Version**: `1.16.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +doxygen.nl@1.16.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.doxygen

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/doxygen.nl/package.yml)
- [Homepage](https://www.doxygen.nl/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
