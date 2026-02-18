# git-lfs

> Git extension for versioning large files

## Package Information

- **Domain**: `git-lfs.com`
- **Name**: `git-lfs`
- **Homepage**: <https://git-lfs.github.com/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/git-lfs.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install git-lfs.com
```

## Programs

This package provides the following executable programs:

- `git-lfs`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `3.7.1`, `3.7.0`
- `3.6.1`, `3.6.0`
- `3.5.1`
- `3.4.1`, `3.4.0`
- `3.3.0`

</details>

**Latest Version**: `3.7.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +git-lfs.com@3.7.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `git-scm.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['git-lfs']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/git-lfs.com/package.yml)
- [Homepage](https://git-lfs.github.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
