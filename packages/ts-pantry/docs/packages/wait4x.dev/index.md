# wait4x

> Wait4X allows you to wait for a port or a service to enter the requested state.

## Package Information

- **Domain**: `wait4x.dev`
- **Name**: `wait4x`
- **Homepage**: https://wait4x.dev
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/wait4x.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install wait4x.dev
```

## Programs

This package provides the following executable programs:

- `wait4x`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `3.6.0`
- `3.5.1`, `3.5.0`
- `3.4.0`
- `3.3.1`, `3.3.0`
- `3.2.0`
- `3.1.0`
- `3.0.0`
- `2.14.3`, `2.14.2`

</details>

**Latest Version**: `3.6.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +wait4x.dev@3.6.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.wait4x

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/wait4x.dev/package.yml)
- [Homepage](https://wait4x.dev)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
