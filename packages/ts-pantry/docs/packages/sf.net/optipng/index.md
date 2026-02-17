# optipng

> PNG file optimizer

## Package Information

- **Domain**: `sf.net/optipng`
- **Name**: `optipng`
- **Homepage**: https://optipng.sourceforge.net/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sf.net/optipng/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sf.net/optipng
```

## Programs

This package provides the following executable programs:

- `optipng`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `7.9.1`
- `0.7.8`, `0.7.7`

</details>

**Latest Version**: `7.9.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sf.net/optipng@7.9.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libpng.org^1`
- `zlib.net^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.optipng

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sf.net/optipng/package.yml)
- [Homepage](https://optipng.sourceforge.net/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
