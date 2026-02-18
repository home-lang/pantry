# libuv

> Cross-platform asynchronous I/O

## Package Information

- **Domain**: `libuv.org`
- **Name**: `libuv`
- **Homepage**: <https://libuv.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libuv.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libuv.org
```

## Programs

This package provides the following executable programs:

No programs specified.

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `1.52.0`
- `1.51.0`
- `1.50.0`
- `1.49.2`, `1.49.1`, `1.49.0`
- `1.48.0`
- `1.47.0`
- `1.46.0`
- `1.45.0`
- `1.44.2`

</details>

**Latest Version**: `1.52.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libuv.org@1.52.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libuv

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libuv.org/package.yml)
- [Homepage](https://libuv.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
