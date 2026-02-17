# patchelf

> A small utility to modify the dynamic linker and RPATH of ELF executables

## Package Information

- **Domain**: `nixos.org/patchelf`
- **Name**: `patchelf`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/nixos.org/patchelf/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install nixos.org/patchelf
```

## Programs

This package provides the following executable programs:

- `patchelf`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `0.18.0`
- `0.17.2`, `0.17.0`
- `0.15.5`, `0.15.4`, `0.15.3`, `0.15.2`, `0.15.1`, `0.15.0`

</details>

**Latest Version**: `0.18.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +nixos.org/patchelf@0.18.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.patchelf

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/nixos.org/patchelf/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
