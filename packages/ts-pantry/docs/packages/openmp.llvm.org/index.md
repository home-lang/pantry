# libomp

> The LLVM Project is a collection of modular and reusable compiler and toolchain technologies.

## Package Information

- **Domain**: `openmp.llvm.org`
- **Name**: `libomp`
- **Homepage**: <http://llvm.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openmp.llvm.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openmp.llvm.org
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 43 versions</summary>

- `21.1.8`, `21.1.7`, `21.1.6`, `21.1.5`, `21.1.4`, `21.1.3`, `21.1.2`, `21.1.1`, `21.1.0`
- `20.1.8`, `20.1.7`, `20.1.6`, `20.1.5`, `20.1.4`, `20.1.3`, `20.1.2`, `20.1.1`, `20.1.0`
- `19.1.7`, `19.1.6`, `19.1.5`, `19.1.4`, `19.1.3`, `19.1.2`, `19.1.1`, `19.1.0`
- `18.1.8`, `18.1.7`, `18.1.6`, `18.1.5`, `18.1.4`, `18.1.3`, `18.1.2`, `18.1.1`, `18.1.0`
- `17.0.6`, `17.0.5`, `17.0.4`, `17.0.3`, `17.0.2`, `17.0.1`, `17.0.0`
- `16.0.6`

</details>

**Latest Version**: `21.1.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +openmp.llvm.org@21.1.8 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libomp

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openmp.llvm.org/package.yml)
- [Homepage](http://llvm.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
