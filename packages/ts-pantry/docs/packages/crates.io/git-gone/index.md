# git-gone

> Cleanup stale Git branches of pull requests

## Package Information

- **Domain**: `crates.io/git-gone`
- **Name**: `git-gone`
- **Homepage**: <https://crates.io/crates/git-gone>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-gone/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/git-gone
```

## Programs

This package provides the following executable programs:

- `git-gone`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `1.2.5`, `1.2.4`, `1.2.2`, `1.2.0`, `1.1.1`
- `1.1.0`, `1.0.0`

</details>

**Latest Version**: `1.2.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/git-gone@1.2.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libgit2.org~1.7 # links to libgit2.so.1.7`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['git-gone']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-gone/package.yml)
- [Homepage](https://crates.io/crates/git-gone)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
