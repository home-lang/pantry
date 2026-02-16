# zig

> General-purpose programming language and toolchain for maintaining robust, optimal, and reusable software.

## Package Information

- **Domain**: `ziglang.org`
- **Name**: `zig`
- **Homepage**: https://ziglang.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/ziglang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install ziglang.org
```

## Programs

This package provides the following executable programs:

- `zig`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `0.15.2`, `0.15.1`, `0.15.0`, `0.14.1`, `0.14.0`
- `0.13.0`, `0.12.1`, `0.12.0`, `0.11.0`, `0.10.1`

</details>

**Latest Version**: `0.15.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +ziglang.org@0.15.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.zig

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/ziglang.org/package.yml)
- [Homepage](https://ziglang.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
