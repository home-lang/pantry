# Spotify

> A digital music streaming service.

## Package Information

- **Domain**: `spotify.com`
- **Name**: `Spotify`
- **Homepage**: <https://spotify.com>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/spotify.com/package.yml)

## Installation

```bash
# Install with pantry
pantry install spotify.com
```

## Programs

This package provides the following executable programs:

- `spotify`

## Aliases

This package can also be accessed using these aliases:

- `spotify`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.2.52`, `1.2.51`, `1.2.50`

</details>

**Latest Version**: `1.2.52`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +spotify.com@1.2.52 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.spotify

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/spotify.com/package.yml)
- [Homepage](https://spotify.com)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
