# invoke

> Pythonic task management & command execution.

## Package Information

- **Domain**: `pyinvoke.org`
- **Name**: `invoke`
- **Homepage**: https://www.pyinvoke.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pyinvoke.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pyinvoke.org
```

## Programs

This package provides the following executable programs:

- `invoke`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `2.2.1`, `2.2.0`, `2.1.4`

</details>

**Latest Version**: `2.2.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pyinvoke.org@2.2.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.invoke

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pyinvoke.org/package.yml)
- [Homepage](https://www.pyinvoke.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
