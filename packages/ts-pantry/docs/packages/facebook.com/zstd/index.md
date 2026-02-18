# zstd

> Zstandard - Fast real-time compression algorithm

## Package Information

- **Domain**: `facebook.com/zstd`
- **Name**: `zstd`
- **Homepage**: <https://facebook.github.io/zstd/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/facebook.com/zstd/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install facebook.com/zstd
```

## Programs

This package provides the following executable programs:

- `pzstd`
- `unzstd`
- `zstd`
- `zstdcat`
- `zstdgrep`
- `zstdless`
- `zstdmt`

## Available Versions

<details>
<summary>Show all 5 versions</summary>

- `1.5.7`, `1.5.6`, `1.5.5`, `1.5.4`, `1.5.2`

</details>

**Latest Version**: `1.5.7`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +facebook.com/zstd@1.5.7 -- $SHELL -i
```

## Dependencies

This package depends on:

- `lz4.org^1`
- `tukaani.org/xz^5`
- `zlib.net^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.zstd

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/facebook.com/zstd/package.yml)
- [Homepage](https://facebook.github.io/zstd/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
