# qhull

> Qhull development for www.qhull.org -- Qhull 2020.2 (8.1-alpha1) at <https://github.com/qhull/qhull/wiki>

## Package Information

- **Domain**: `qhull.org`
- **Name**: `qhull`
- **Homepage**: <http://www.qhull.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/qhull.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install qhull.org
```

## Programs

This package provides the following executable programs:

- `qconvex`
- `qdelaunay`
- `qhalf`
- `qhull`
- `qvoronoi`
- `rbox`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `8.0.2`

</details>

**Latest Version**: `8.0.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +qhull.org@8.0.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.qhull

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/qhull.org/package.yml)
- [Homepage](http://www.qhull.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
