# libbsd

> BSD compatibility library (mirror)

## Package Information

- **Domain**: `freedesktop.org/libbsd`
- **Name**: `libbsd`
- **Homepage**: <https://libbsd.freedesktop.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/libbsd/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install freedesktop.org/libbsd
```

## Programs

This package provides the following executable programs:

No programs specified.

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.11.7`

</details>

**Latest Version**: `0.11.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +freedesktop.org/libbsd@0.11.7 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libbsd

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/libbsd/package.yml)
- [Homepage](https://libbsd.freedesktop.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
