# git-branchless

> High-velocity, monorepo-scale workflow for Git

## Package Information

- **Domain**: `crates.io/git-branchless`
- **Name**: `git-branchless`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-branchless/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/git-branchless
```

## Programs

This package provides the following executable programs:

- `git-branchless`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `0.10.0`
- `0.9.0`
- `0.8.0`
- `0.7.1`

</details>

**Latest Version**: `0.10.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/git-branchless@0.10.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libgit2.org@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['git-branchless']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-branchless/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
