# cgal

> The public CGAL repository, see the README below

## Package Information

- **Domain**: `cgal.org`
- **Name**: `cgal`
- **Homepage**: <https://github.com/CGAL/cgal#readme>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/cgal.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install cgal.org
```

## Programs

This package provides the following executable programs:

- `cgal_create_CMakeLists`
- `cgal_create_cmake_script`
- `cgal_make_macosx_app`

## Available Versions

<details>
<summary>Show all 8 versions</summary>

- `6.1.0`, `6.0.3`, `6.0.2`, `6.0.1`, `6.0.0`
- `5.6.2`, `5.6.1`, `5.6.0`

</details>

**Latest Version**: `6.1.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +cgal.org@6.1.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `boost.org`
- `eigen.tuxfamily.org`
- `gnu.org/gmp`
- `gnu.org/mpfr`
- `openssl.org`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cgal

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/cgal.org/package.yml)
- [Homepage](https://github.com/CGAL/cgal#readme)
- [Back to Package Catalog](../../package-catalog.md)

---

_This documentation was auto-generated from package data._
