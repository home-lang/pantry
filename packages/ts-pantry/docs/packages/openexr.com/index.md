# exr

> The OpenEXR project provides the specification and reference implementation of the EXR file format, the professional-grade image storage format of the motion picture industry.

## Package Information

- **Domain**: `openexr.com`
- **Name**: `exr`
- **Homepage**: <https://www.openexr.com/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/openexr.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install openexr.com
```

## Programs

This package provides the following executable programs:

- `exr2aces`
- `exrenvmap`
- `exrheader`
- `exrmakepreview`
- `exrmaketiled`
- `exrmultipart`
- `exrmultiview`
- `exrstdattr`

## Available Versions

<details>
<summary>Show all 28 versions</summary>

- `3.4.4`, `3.4.3`, `3.4.2`, `3.4.1`, `3.4.0`
- `3.3.6`, `3.3.5`, `3.3.4`, `3.3.3`, `3.3.2`
- `3.3.1`, `3.3.0`, `3.2.126`, `3.2.5`, `3.2.4`
- `3.2.3`, `3.2.2`, `3.2.1`, `3.2.0`, `3.1.13`
- `3.1.12`, `3.1.11`, `3.1.10`, `3.1.9`, `3.1.8`
- `3.1.7`, `3.1.6`, `2.5.10`

</details>

**Latest Version**: `3.4.4`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +openexr.com@3.4.4 -- $SHELL -i
```

## Dependencies

This package depends on:

- `zlib.net^1`
- `openexr.com/imath`
- `linux:gnu.org/gcc/libstdcxx^14 # needed since 3.4.0`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.exr

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/openexr.com/package.yml)
- [Homepage](https://www.openexr.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
