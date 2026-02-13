# girara

> User interface library

## Package Information

- **Domain**: `pwmt.org/girara`
- **Name**: `girara`
- **Homepage**: https://pwmt.org/projects/girara
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pwmt.org/girara/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pwmt.org/girara
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `0.4.5`, `0.4.4`

</details>

**Latest Version**: `0.4.5`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pwmt.org/girara@0.4.5 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gtk.org/gtk3@3`
- `gnome.org/glib^2.72`
- `gnome.org/json-glib^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.girara

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pwmt.org/girara/package.yml)
- [Homepage](https://pwmt.org/projects/girara)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
