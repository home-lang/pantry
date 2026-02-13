# e2fsprogs

> Utilities for the ext2, ext3, and ext4 file systems

## Package Information

- **Domain**: `sourceforge.net/e2fsprogs`
- **Name**: `e2fsprogs`
- **Homepage**: https://e2fsprogs.sourceforge.net/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sourceforge.net/e2fsprogs/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sourceforge.net/e2fsprogs
```

## Programs

This package provides the following executable programs:

- `chattr`
- `compile_et`
- `lsattr`
- `mk_cmds`
- `uuidgen`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.47.3`, `1.47.2`, `1.47.1`, `1.47.0`

</details>

**Latest Version**: `1.47.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sourceforge.net/e2fsprogs@1.47.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `darwin:gnu.org/gettext^0.22`
- `linux:github.com/util-linux/util-linux^2.39`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.e2fsprogs

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sourceforge.net/e2fsprogs/package.yml)
- [Homepage](https://e2fsprogs.sourceforge.net/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
