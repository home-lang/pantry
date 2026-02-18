# dxc

> This repo hosts the source for the DirectX Shader Compiler which is based on LLVM/Clang.

## Package Information

- **Domain**: `microsoft.com/dxc`
- **Name**: `dxc`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/microsoft.com/dxc/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install microsoft.com/dxc
```

## Programs

This package provides the following executable programs:

- `dxc`
- `dxv`
- `dxa`
- `dxr`
- `dxl`

## Available Versions

<details>
<summary>Show all 9 versions</summary>

- `1.8.2505.1`, `1.8.2505`, `1.8.2502`, `1.8.2407`, `1.8.2405`, `1.8.2403.2`, `1.8.2403.1`, `1.8.2403`
- `1.7.2308`

</details>

**Latest Version**: `1.8.2505.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +microsoft.com/dxc@1.8.2505.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.dxc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/microsoft.com/dxc/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
