# attr

> Manipulate filesystem extended attributes

## Package Information

- **Domain**: `savannah.nongnu.org/attr`
- **Name**: `attr`
- **Homepage**: <https://savannah.nongnu.org/projects/attr>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/savannah.nongnu.org/attr/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install savannah.nongnu.org/attr
```

## Programs

This package provides the following executable programs:

- `attr`
- `getfattr`
- `setfattr`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2.5.2`, `2.5.1`

</details>

**Latest Version**: `2.5.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +savannah.nongnu.org/attr@2.5.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.attr

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/savannah.nongnu.org/attr/package.yml)
- [Homepage](https://savannah.nongnu.org/projects/attr)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
