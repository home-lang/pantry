# nasm.us

> A cross-platform x86 assembler with an Intel-like syntax

## Package Information

- **Domain**: `nasm.us`
- **Name**: `nasm.us`
- **Homepage**: https://www.nasm.us/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/nasm.us/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install nasm.us
```

## Programs

This package provides the following executable programs:

- `nasm`
- `ndisasm`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `3.1.0`, `3.0.0`, `2.16.3`, `2.16.2`, `2.15.5`

</details>

**Latest Version**: `3.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +nasm.us@3.1.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['nasm.us']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/nasm.us/package.yml)
- [Homepage](https://www.nasm.us/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
