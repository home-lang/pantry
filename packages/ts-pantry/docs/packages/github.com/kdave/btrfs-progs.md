# btrfs-progs

> Userspace utilities to manage btrfs filesystems

## Package Information

- **Domain**: `github.com/kdave/btrfs-progs`
- **Name**: `btrfs-progs`
- **Homepage**: <https://btrfs.readthedocs.io/en/latest/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kdave/btrfs-progs/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/kdave/btrfs-progs
```

## Programs

This package provides the following executable programs:

- `btrfs`
- `btrfsck`
- `btrfs-convert`
- `btrfs-find-root`
- `btrfs-image`
- `btrfs-map-logical`
- `btrfs-select-super`
- `btrfstune`
- `fsck.btrfs`
- `mkfs.btrfs`

## Available Versions

<details>
<summary>Show all 18 versions</summary>

- `6.19.0`
- `6.17.1`, `6.17.0`
- `6.16.1`, `6.16.0`
- `6.15.0`
- `6.14.0`
- `6.13.0`
- `6.12.0`
- `6.11.0`
- `6.10.1`, `6.10.0`
- `6.9.2`, `6.9.1`, `6.9.0`
- `6.8.1`, `6.8.0`
- `6.7.1`

</details>

**Latest Version**: `6.19.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/kdave/btrfs-progs@6.19.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `python.org~3.14`
- `sourceforge.net/e2fsprogs^1.47`
- `oberhumer.com/lzo^2.10`
- `systemd.io^255 # for libudev`
- `github.com/util-linux/util-linux^2.39`
- `zlib.net^1.3`
- `facebook.com/zstd^1.5`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['btrfs-progs']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kdave/btrfs-progs/package.yml)
- [Homepage](https://btrfs.readthedocs.io/en/latest/)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
