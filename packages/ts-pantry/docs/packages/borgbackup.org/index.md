# borg

> Deduplicating archiver with compression and authenticated encryption.

## Package Information

- **Domain**: `borgbackup.org`
- **Name**: `borg`
- **Homepage**: <https://www.borgbackup.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/borgbackup.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install borgbackup.org
```

## Programs

This package provides the following executable programs:

- `borg`
- `borgfs`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `1.4.3`, `1.4.2`, `1.4.1`, `1.2.9`

</details>

**Latest Version**: `1.4.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +borgbackup.org@1.4.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `pkgx.sh>=1`
- `github.com/Cyan4973/xxHash^0.8`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.borg

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/borgbackup.org/package.yml)
- [Homepage](https://www.borgbackup.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
