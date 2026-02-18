# silicon

> Create beautiful image of your source code.

## Package Information

- **Domain**: `crates.io/silicon`
- **Name**: `silicon`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/silicon/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crates.io/silicon
```

## Programs

This package provides the following executable programs:

- `silicon`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `0.5.3`, `0.5.2`, `0.5.1`

</details>

**Latest Version**: `0.5.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crates.io/silicon@0.5.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `harfbuzz.org^5`
- `linux:freedesktop.org/fontconfig`
- `linux:freetype.org`
- `linux:x.org/xcb`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.silicon

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/silicon/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

> Auto-generated from package data.
