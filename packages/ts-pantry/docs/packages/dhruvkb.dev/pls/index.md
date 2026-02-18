# pls

> pls is a prettier and powerful ls(1) for the pros.

## Package Information

- **Domain**: `dhruvkb.dev/pls`
- **Name**: `pls`
- **Homepage**: <https://pls.cli.rs/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/dhruvkb.dev/pls/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install dhruvkb.dev/pls
```

## Programs

This package provides the following executable programs:

- `pls`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2023.12.22`

</details>

**Latest Version**: `2023.12.22`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +dhruvkb.dev/pls@2023.12.22 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libgit2.org~1.7 # links to libgit2.so.1.7`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pls

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/dhruvkb.dev/pls/package.yml)
- [Homepage](https://pls.cli.rs/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
