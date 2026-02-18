# gts.sourceforge

> GNU triangulated surface library

## Package Information

- **Domain**: `gts.sourceforge.net`
- **Name**: `gts.sourceforge`
- **Homepage**: <https://gts.sourceforge.net/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gts.sourceforge.net/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gts.sourceforge.net
```

## Programs

This package provides the following executable programs:

- `delaunay`
- `gts2dxf`
- `gts2oogl`
- `gts2stl`
- `gtscheck`
- `gtscompare`
- `gtstemplate`
- `stl2gts`
- `transform`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `0.7.6`

</details>

**Latest Version**: `0.7.6`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gts.sourceforge.net@0.7.6 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/glib>=2.4.0`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['gts.sourceforge']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gts.sourceforge.net/package.yml)
- [Homepage](https://gts.sourceforge.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
