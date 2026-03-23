# VLC

> A free and open-source cross-platform multimedia player.

## Package Information

- **Domain**: `vlc.app`
- **Name**: `VLC`
- **Homepage**: <https://videolan.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/vlc.app/package.yml)

## Installation

```bash
# Install with pantry
pantry install vlc.app
```

## Programs

This package provides the following executable programs:

- `vlc`

## Aliases

This package can also be accessed using these aliases:

- `vlc`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `3.0.21`, `3.0.20`, `3.0.18`

</details>

**Latest Version**: `3.0.21`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +vlc.app@3.0.21 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.vlc

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/vlc.app/package.yml)
- [Homepage](https://videolan.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
