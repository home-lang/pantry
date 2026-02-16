# xauth

> X.Org Applications: xauth

## Package Information

- **Domain**: `x.org/xauth`
- **Name**: `xauth`
- **Homepage**: https://www.x.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xauth/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install x.org/xauth
```

## Programs

This package provides the following executable programs:

- `xauth`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.1.5`, `1.1.4`, `1.1.3`, `1.1.2`

</details>

**Latest Version**: `1.1.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +x.org/xauth@1.1.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `x.org/x11`
- `x.org/exts`
- `x.org/xau`
- `x.org/xmu`
- `linux:x.org/xcb`
- `linux:x.org/xdmcp`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.xauth

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/x.org/xauth/package.yml)
- [Homepage](https://www.x.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
