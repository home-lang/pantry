# Hidden Bar

> A utility to hide menu bar items on macOS.

## Package Information

- **Domain**: `hiddenbar.app`
- **Name**: `Hidden Bar`
- **Homepage**: <https://github.com/dwarvesf/hidden>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/hiddenbar.app/package.yml)

## Installation

```bash
# Install with pantry
pantry install hiddenbar.app
```

## Programs

This package provides the following executable programs:

- `hiddenbar`

## Aliases

This package can also be accessed using these aliases:

- `hiddenbar`
- `hidden-bar`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `1.10`
- `1.9`
- `1.8`
- `1.7`
- `1.6`
- `1.5`
- `1.4`
- `1.3`
- `1.2`
- `1.1`
- `1.0`

</details>

**Latest Version**: `1.10`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +hiddenbar.app@1.10 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.hiddenbar

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/hiddenbar.app/package.yml)
- [Homepage](https://github.com/dwarvesf/hidden)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
