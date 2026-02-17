# python-click

> Python composable command line interface toolkit

## Package Information

- **Domain**: `palletsprojects.com/click`
- **Name**: `python-click`
- **Homepage**: https://click.palletsprojects.com
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/palletsprojects.com/click/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install palletsprojects.com/click
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `8.3.1`, `8.3.0`
- `8.2.2`, `8.2.1`, `8.2.0`
- `8.1.8`, `8.1.7`

</details>

**Latest Version**: `8.3.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +palletsprojects.com/click@8.3.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3.11`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['python-click']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/palletsprojects.com/click/package.yml)
- [Homepage](https://click.palletsprojects.com)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
