# pwgen

> Password generator

## Package Information

- **Domain**: `pwgen.sourceforge.io`
- **Name**: `pwgen`
- **Homepage**: <https://pwgen.sourceforge.net/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pwgen.sourceforge.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pwgen.sourceforge.io
```

## Programs

This package provides the following executable programs:

- `pwgen`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.8.0`

</details>

**Latest Version**: `2.8.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pwgen.sourceforge.io@2.8.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pwgen

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pwgen.sourceforge.io/package.yml)
- [Homepage](https://pwgen.sourceforge.net/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
