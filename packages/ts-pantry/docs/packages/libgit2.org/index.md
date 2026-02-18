# git2

> A cross-platform, linkable library implementation of Git that you can use in your application.

## Package Information

- **Domain**: `libgit2.org`
- **Name**: `git2`
- **Homepage**: https://libgit2.github.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libgit2.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libgit2.org
```

## Programs

This package provides the following executable programs:

- `git2`

## Available Versions

<details>
<summary>Show all 14 versions</summary>

- `1.9.2`, `1.9.1`, `1.9.0`
- `1.8.5`, `1.8.4`, `1.8.3`, `1.8.2`, `1.8.1`, `1.8.0`
- `1.7.2`, `1.7.1`, `1.7.0`
- `1.6.5`, `1.6.4`

</details>

**Latest Version**: `1.9.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libgit2.org@1.9.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libssh2.org^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.git2

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libgit2.org/package.yml)
- [Homepage](https://libgit2.github.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
