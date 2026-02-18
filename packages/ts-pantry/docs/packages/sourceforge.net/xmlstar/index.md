# XMLStarlet

> XML command-line utilities

## Package Information

- **Domain**: `sourceforge.net/xmlstar`
- **Name**: `XMLStarlet`
- **Homepage**: <https://xmlstar.sourceforge.net/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/sourceforge.net/xmlstar/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install sourceforge.net/xmlstar
```

## Programs

This package provides the following executable programs:

- `xml`
- `xmlstarlet`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `1.6.1`

</details>

**Latest Version**: `1.6.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +sourceforge.net/xmlstar@1.6.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/libxslt^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.XMLStarlet

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/sourceforge.net/xmlstar/package.yml)
- [Homepage](https://xmlstar.sourceforge.net/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
