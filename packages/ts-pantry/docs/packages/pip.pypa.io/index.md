# pip

> The Python package installer

## Package Information

- **Domain**: `pip.pypa.io`
- **Name**: `pip`
- **Homepage**: <https://pip.pypa.io/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pip.pypa.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pip.pypa.io
```

## Programs

This package provides the following executable programs:

- `pip`
- `pip3.8`
- `pip3.9`
- `pip3.10`
- `pip3.11`

## Available Versions

<details>
<summary>Show all 31 versions</summary>

- `26.0.1`, `26.0.0`
- `25.3.0`
- `25.2.0`
- `25.1.1`, `25.1.0`
- `25.0.1`, `25.0.0`
- `24.3.1`, `24.3.0`
- `24.2.0`
- `24.1.2`, `24.1.1`, `24.1.0`
- `24.0.0`
- `23.3.2`, `23.3.1`, `23.3.0`
- `23.2.1`, `23.2.0`
- `23.1.2`, `23.1.1`, `23.1.0`
- `23.0.1`, `23.0.0`
- `22.3.1`, `22.3.0`
- `21.3.1`
- `20.3.4`
- `19.3.1`
- `18.1.0`

</details>

**Latest Version**: `26.0.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pip.pypa.io@26.0.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pip

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pip.pypa.io/package.yml)
- [Homepage](https://pip.pypa.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
