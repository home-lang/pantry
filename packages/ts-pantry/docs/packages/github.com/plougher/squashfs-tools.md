# SquashFS-Tools

> tools to create and extract Squashfs filesystems

## Package Information

- **Domain**: `github.com/plougher/squashfs-tools`
- **Name**: `SquashFS-Tools`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/plougher/squashfs-tools/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/plougher/squashfs-tools
```

## Programs

This package provides the following executable programs:

- `mksquashfs`
- `unsquashfs`
- `sqfscat`
- `sqfstar`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `4.7.4`, `4.7.3`, `4.7.2`, `4.7.1`, `4.7.0`
- `4.6.1`

</details>

**Latest Version**: `4.7.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/plougher/squashfs-tools@4.7.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `lz4.org@1`
- `oberhumer.com/lzo@2`
- `tukaani.org/xz@5`
- `facebook.com/zstd@1`
- `zlib.net@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['SquashFS-Tools']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/plougher/squashfs-tools/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
