# onefetch

> Command-line Git information tool

## Package Information

- **Domain**: `onefetch.dev`
- **Name**: `onefetch`
- **Homepage**: https://onefetch.dev/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/onefetch.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install onefetch.dev
```

## Programs

This package provides the following executable programs:

- `onefetch`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `2.26.1`, `2.26.0`, `2.25.0`, `2.24.0`, `2.23.1`
- `2.23.0`, `2.22.0`, `2.21.0`, `2.20.0`, `2.19.0`
- `2.18.1`

</details>

**Latest Version**: `2.26.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +onefetch.dev@2.26.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libgit2.org~1.7 # links to libgit2.so.1.7`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.onefetch

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/onefetch.dev/package.yml)
- [Homepage](https://onefetch.dev/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
