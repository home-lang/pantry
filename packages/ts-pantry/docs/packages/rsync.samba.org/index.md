# rsync

> An open source utility that provides fast incremental file transfer. It also has useful features for backup and restore operations among many other use cases.

## Package Information

- **Domain**: `rsync.samba.org`
- **Name**: `rsync`
- **Homepage**: https://rsync.samba.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/rsync.samba.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install rsync.samba.org
```

## Programs

This package provides the following executable programs:

- `rsync`
- `rsync-ssl`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `3.4.1`, `3.4.0`, `3.3.0`, `3.2.7`

</details>

**Latest Version**: `3.4.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +rsync.samba.org@3.4.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1`
- `facebook.com/zstd^1`
- `lz4.org^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.rsync

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/rsync.samba.org/package.yml)
- [Homepage](https://rsync.samba.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
