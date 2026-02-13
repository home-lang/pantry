# xplr

> A hackable, minimal, fast TUI file explorer

## Package Information

- **Domain**: `xplr.dev`
- **Name**: `xplr`
- **Homepage**: https://xplr.dev
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/xplr.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install xplr.dev
```

## Programs

This package provides the following executable programs:

- `xplr`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `1.1.0`, `1.0.1`, `1.0.0`, `0.21.10`, `0.21.9`
- `0.21.8`

</details>

**Latest Version**: `1.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +xplr.dev@1.1.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.xplr

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/xplr.dev/package.yml)
- [Homepage](https://xplr.dev)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
