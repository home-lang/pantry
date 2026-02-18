# changie

> Automated changelog tool for preparing releases with lots of customization options

## Package Information

- **Domain**: `changie.dev`
- **Name**: `changie`
- **Homepage**: <https://changie.dev/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/changie.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install changie.dev
```

## Programs

This package provides the following executable programs:

- `changie`

## Available Versions

<details>
<summary>Show all 11 versions</summary>

- `1.24.0`
- `1.23.0`
- `1.22.1`, `1.22.0`
- `1.21.1`, `1.21.0`
- `1.20.1`, `1.20.0`
- `1.19.1`, `1.19.0`
- `1.18.0`

</details>

**Latest Version**: `1.24.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +changie.dev@1.24.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.changie

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/changie.dev/package.yml)
- [Homepage](https://changie.dev/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
