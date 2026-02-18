# mun

> Source code for the Mun language and runtime.

## Package Information

- **Domain**: `mun-lang.org`
- **Name**: `mun`
- **Homepage**: <https://mun-lang.org>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/mun-lang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install mun-lang.org
```

## Programs

This package provides the following executable programs:

- `mun`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.5.0`

</details>

**Latest Version**: `0.5.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +mun-lang.org@0.5.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `invisible-island.net/ncurses@6`
- `sourceware.org/libffi@3`
- `gnome.org/libxml2@2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.mun

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/mun-lang.org/package.yml)
- [Homepage](https://mun-lang.org)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
