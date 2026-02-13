# spirv

> API and commands for processing SPIR-V modules

## Package Information

- **Domain**: `khronos.org/SPIRV-Tools`
- **Name**: `spirv`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/khronos.org/SPIRV-Tools/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install khronos.org/SPIRV-Tools
```

## Programs

This package provides the following executable programs:

- `spirv-as`
- `spirv-cfg`
- `spirv-dis`
- `spirv-lesspipe.sh`
- `spirv-link`
- `spirv-lint`
- `spirv-objdump`
- `spirv-opt`
- `spirv-reduce`
- `spirv-val`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `2025.5.0`, `2025.4.0`, `2025.1.0`, `2024.3.0`, `2024.2.0`
- `2024.1.0`

</details>

**Latest Version**: `2025.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +khronos.org/SPIRV-Tools@2025.5.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.spirv

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/khronos.org/SPIRV-Tools/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
