# scons

> Substitute for classic 'make' tool with autoconf/automake functionality

## Package Information

- **Domain**: `scons.org`
- **Name**: `scons`
- **Homepage**: <https://www.scons.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/scons.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install scons.org
```

## Programs

This package provides the following executable programs:

- `scons`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `4.10.1`, `4.10.0`
- `4.9.1`, `4.9.0`
- `4.8.1`, `4.8.0`
- `4.7.0`
- `4.6.0`
- `4.5.2`

</details>

**Latest Version**: `4.10.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +scons.org@4.10.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.11`
- `linux:gnu.org/gcc>=10`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.scons

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/scons.org/package.yml)
- [Homepage](https://www.scons.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
