# delta

> A syntax-highlighting pager for git, diff, grep, and blame output

## Package Information

- **Domain**: `crates.io/git-delta`
- **Name**: `delta`
- **Homepage**: https://dandavison.github.io/delta/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-delta/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/git-delta
```

## Programs

This package provides the following executable programs:

- `delta`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `0.18.2`, `0.18.1`, `0.18.0`
- `0.17.0`
- `0.16.5`, `0.16.4`, `0.16.3`, `0.16.2`, `0.16.1`, `0.16.0`
- `0.15.1`

</details>

**Latest Version**: `0.18.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/git-delta@0.18.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libgit2.org~1.7 # links to libgit2.so.1.7`
- `darwin:zlib.net^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.delta

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-delta/package.yml)
- [Homepage](https://dandavison.github.io/delta/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
