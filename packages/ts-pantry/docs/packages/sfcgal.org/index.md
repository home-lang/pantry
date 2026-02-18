# sfcgal-config

> C++ wrapper library around CGAL

## Package Information

- **Domain**: `sfcgal.org`
- **Name**: `sfcgal-config`
- **Homepage**: <https://sfcgal.gitlab.io/SFCGAL/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sfcgal.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sfcgal.org
```

## Programs

This package provides the following executable programs:

- `sfcgal-config`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `2.2.0`
- `2.1.0`
- `2.0.0`
- `1.5.2`, `1.5.1`, `1.5.0`
- `1.4.1`

</details>

**Latest Version**: `2.2.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sfcgal.org@2.2.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `boost.org`
- `cgal.org`
- `gnu.org/gmp`
- `gnu.org/mpfr`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['sfcgal-config']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sfcgal.org/package.yml)
- [Homepage](https://sfcgal.gitlab.io/SFCGAL/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
