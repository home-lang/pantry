# git-trim

> Automatically trims your branches whose tracking remote refs are merged or stray

## Package Information

- **Domain**: `crates.io/git-trim`
- **Name**: `git-trim`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-trim/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/git-trim
```

## Programs

This package provides the following executable programs:

- `git-trim`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.4.3`

</details>

**Latest Version**: `0.4.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/git-trim@0.4.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`
- `zlib.net^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['git-trim']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-trim/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
