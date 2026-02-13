# v

> Simple, fast, safe, compiled language for developing maintainable software. Compiles itself in <1s with zero library dependencies. Supports automatic C => V translation. https://vlang.io

## Package Information

- **Domain**: `vlang.io`
- **Name**: `v`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/vlang.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install vlang.io
```

## Programs

This package provides the following executable programs:

- `v`

## Available Versions

<details>
<summary>Show all 17 versions</summary>

- `0.5.0`, `0.4.12`, `0.4.11`, `0.4.10`, `0.4.9`
- `0.4.8`, `0.4.7`, `0.4.6`, `0.4.5`, `0.4.4`
- `0.4.3`, `0.4.2`, `0.4.1`, `0.4.0`, `0.3.5`
- `0.3.4`, `0.3.3`

</details>

**Latest Version**: `0.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +vlang.io@0.5.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.v

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/vlang.io/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
