# git-absorb

> git commit --fixup, but automatic

## Package Information

- **Domain**: `crates.io/git-absorb`
- **Name**: `git-absorb`
- **Homepage**: https://crates.io/crates/git-absorb
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-absorb/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/git-absorb
```

## Programs

This package provides the following executable programs:

- `git-absorb`

## Available Versions

<details>
<summary>Show all 10 versions</summary>

- `0.9.0`, `0.8.0`, `0.7.0`, `0.6.17`, `0.6.16`
- `0.6.15`, `0.6.13`, `0.6.12`, `0.6.11`, `0.6.10`

</details>

**Latest Version**: `0.9.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/git-absorb@0.9.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libgit2.org~1.7 # links to libgit2.so.1.7`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['git-absorb']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-absorb/package.yml)
- [Homepage](https://crates.io/crates/git-absorb)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
