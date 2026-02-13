# git-cliff

> A highly customizable Changelog Generator that follows Conventional Commit specifications ⛰️

## Package Information

- **Domain**: `git-cliff.org`
- **Name**: `git-cliff`
- **Homepage**: https://git-cliff.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/git-cliff.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install git-cliff.org
```

## Programs

This package provides the following executable programs:

- `git-cliff`

## Available Versions

<details>
<summary>Show all 27 versions</summary>

- `2.12.0`, `2.11.0`, `2.10.1`, `2.10.0`, `2.9.1`
- `2.9.0`, `2.8.0`, `2.7.0`, `2.6.1`, `2.6.0`
- `2.5.0`, `2.4.0`, `2.3.0`, `2.2.2`, `2.2.1`
- `2.2.0`, `2.1.2`, `2.1.1`, `2.0.4`, `2.0.3`
- `2.0.2`, `2.0.1`, `2.0.0`, `1.4.0`, `1.3.1`
- `1.3.0`, `1.2.0`

</details>

**Latest Version**: `2.12.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +git-cliff.org@2.12.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libgit2.org~1.7 # links to libgit2.so.1.7`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['git-cliff']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/git-cliff.org/package.yml)
- [Homepage](https://git-cliff.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
