# stow

> Organize software neatly under a single directory tree (e.g. /usr/local)

## Package Information

- **Domain**: `gnu.org/stow`
- **Name**: `stow`
- **Homepage**: https://www.gnu.org/software/stow/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/stow/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnu.org/stow
```

## Programs

This package provides the following executable programs:

- `stow`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `2.4.1`, `2.4.0`
- `2.3.1`

</details>

**Latest Version**: `2.4.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnu.org/stow@2.4.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `perl.org^5.6.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.stow

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/stow/package.yml)
- [Homepage](https://www.gnu.org/software/stow/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
