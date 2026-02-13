# libass

> libass is a portable subtitle renderer for the ASS/SSA (Advanced Substation Alpha/Substation Alpha) subtitle format.

## Package Information

- **Domain**: `github.com/libass/libass`
- **Name**: `libass`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libass/libass/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/libass/libass
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `0.17.4`, `0.17.3`, `0.17.2`, `0.17.1`

</details>

**Latest Version**: `0.17.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/libass/libass@0.17.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `freetype.org@2`
- `gnu.org/fribidi@1`
- `harfbuzz.org`
- `github.com/adah1972/libunibreak`
- `linux:freedesktop.org/fontconfig@2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libass

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libass/libass/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
