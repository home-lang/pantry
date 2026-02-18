# bat

> Clone of cat(1) with syntax highlighting and Git integration

## Package Information

- **Domain**: `crates.io/bat`
- **Name**: `bat`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/bat/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/bat
```

## Programs

This package provides the following executable programs:

- `bat`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `0.26.1`, `0.26.0`
- `0.25.0`
- `0.24.0`
- `0.23.0`
- `0.22.1`

</details>

**Latest Version**: `0.26.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/bat@0.26.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1`
- `libgit2.org~1.7 # links to libgit2.so.1.7`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.bat

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/bat/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
