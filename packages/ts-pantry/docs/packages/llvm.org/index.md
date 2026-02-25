# llvm

> The LLVM Project is a collection of modular and reusable compiler and toolchain technologies.

## Package Information

- **Domain**: `llvm.org`
- **Name**: `llvm`
- **Homepage**: <http://llvm.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/llvm.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install llvm.org
```

## Programs

This package provides the following executable programs:

- `lld`
- `clang`
- `clang++`
- `cc`
- `c++`
- `cpp`
- `nm`
- `objcopy`
- `ranlib`
- `readelf`
- `strings`
- `strip`
- `llvm-profdata`
- `llvm-cov`

## Available Versions

<details>
<summary>Show all 54 versions</summary>

- `22.1.0`
- `21.1.8`, `21.1.7`, `21.1.6`, `21.1.5`, `21.1.4`, `21.1.3`, `21.1.2`, `21.1.1`, `21.1.0`
- `20.1.8`, `20.1.7`, `20.1.6`, `20.1.5`, `20.1.4`, `20.1.3`, `20.1.2`, `20.1.1`, `20.1.0`
- `19.1.7`, `19.1.6`, `19.1.4`, `19.1.3`, `19.1.2`, `19.1.1`, `19.1.0`
- `18.1.8`, `18.1.7`, `18.1.6`, `18.1.5`, `18.1.4`, `18.1.3`, `18.1.2`, `18.1.1`, `18.1.0`
- `17.0.6`, `17.0.5`, `17.0.4`, `17.0.3`, `17.0.2`, `17.0.1`, `17.0.0`
- `16.0.6`, `16.0.5`, `16.0.4`, `16.0.3`, `16.0.2`, `16.0.1`
- `15.0.7`, `15.0.6`
- `14.0.6`, `14.0.3`
- `13.0.1`
- `12.0.1`

</details>

**Latest Version**: `22.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +llvm.org@22.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net@1`
- `facebook.com/zstd`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.llvm

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/llvm.org/package.yml)
- [Homepage](http://llvm.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
