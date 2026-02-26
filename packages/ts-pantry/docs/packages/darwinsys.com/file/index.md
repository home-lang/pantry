# file

> Read-only mirror of file CVS repository, updated every half hour. NOTE: do not make pull requests here, nor comment any commits, submit them usual way to bug tracker or to the mailing list. Maintainer(s) are not tracking this git mirror.

## Package Information

- **Domain**: `darwinsys.com/file`
- **Name**: `file`
- **Homepage**: <https://darwinsys.com/file/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/darwinsys.com/file/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install darwinsys.com/file
```

## Programs

This package provides the following executable programs:

- `file`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `5.47.0`
- `5.46.0`
- `5.45.0`
- `5.43.0`

</details>

**Latest Version**: `5.47.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +darwinsys.com/file@5.47.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1 #FIXME this is actually an optional dep`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.file

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/darwinsys.com/file/package.yml)
- [Homepage](https://darwinsys.com/file/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
