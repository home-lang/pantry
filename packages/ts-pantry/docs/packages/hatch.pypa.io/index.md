# hatch

> Modern, extensible Python project management

## Package Information

- **Domain**: `hatch.pypa.io`
- **Name**: `hatch`
- **Homepage**: https://hatch.pypa.io/latest/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/hatch.pypa.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install hatch.pypa.io
```

## Programs

This package provides the following executable programs:

- `hatch`

## Available Versions

<details>
<summary>Show all 25 versions</summary>

- `1.16.3`, `1.16.2`, `1.16.1`, `1.16.0`, `1.15.1`
- `1.15.0`, `1.14.2`, `1.14.1`, `1.14.0`, `1.13.0`
- `1.12.0`, `1.11.1`, `1.11.0`, `1.10.0`, `1.9.7`
- `1.9.6`, `1.9.5`, `1.9.4`, `1.9.3`, `1.9.2`
- `1.9.1`, `1.9.0`, `1.8.1`, `1.8.0`, `1.7.0`

</details>

**Latest Version**: `1.16.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +hatch.pypa.io@1.16.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org>=3<3.12`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.hatch

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/hatch.pypa.io/package.yml)
- [Homepage](https://hatch.pypa.io/latest/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
