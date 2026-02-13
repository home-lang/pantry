# jumppad

> Modern cloud native development environments

## Package Information

- **Domain**: `jumppad.dev`
- **Name**: `jumppad`
- **Homepage**: https://jumppad.dev
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/jumppad.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install jumppad.dev
```

## Programs

This package provides the following executable programs:

- `jumppad`

## Available Versions

<details>
<summary>Show all 27 versions</summary>

- `0.24.0`, `0.23.3`, `0.23.2`, `0.23.1`, `0.23.0`
- `0.22.0`, `0.21.0`, `0.20.1`, `0.20.0`, `0.19.0`
- `0.18.1`, `0.18.0`, `0.17.1`, `0.17.0`, `0.16.1`
- `0.16.0`, `0.15.0`, `0.14.0`, `0.13.3`, `0.13.2`
- `0.13.1`, `0.13.0`, `0.12.1`, `0.12.0`, `0.11.2`
- `0.11.1`, `0.11.0`

</details>

**Latest Version**: `0.24.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +jumppad.dev@0.24.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.jumppad

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/jumppad.dev/package.yml)
- [Homepage](https://jumppad.dev)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
