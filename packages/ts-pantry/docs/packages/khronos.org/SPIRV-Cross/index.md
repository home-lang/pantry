# spirv-cross

> SPIRV-Cross is a practical tool and library for performing reflection on SPIR-V and disassembling SPIR-V back to high level languages.

## Package Information

- **Domain**: `khronos.org/SPIRV-Cross`
- **Name**: `spirv-cross`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/khronos.org/SPIRV-Cross/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install khronos.org/SPIRV-Cross
```

## Programs

This package provides the following executable programs:

- `spirv-cross`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2021.1.15`

</details>

**Latest Version**: `2021.1.15`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +khronos.org/SPIRV-Cross@2021.1.15 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['spirv-cross']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/khronos.org/SPIRV-Cross/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
