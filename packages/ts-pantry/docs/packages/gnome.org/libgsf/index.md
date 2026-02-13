# gsf

> I/O abstraction library for dealing with structured file formats

## Package Information

- **Domain**: `gnome.org/libgsf`
- **Name**: `gsf`
- **Homepage**: https://gitlab.gnome.org/GNOME/libgsf
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/libgsf/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnome.org/libgsf
```

## Programs

This package provides the following executable programs:

- `gsf`
- `gsf-office-thumbnailer`
- `gsf-vba-dump`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `1.14.55`, `1.14.54`, `1.14.53`, `1.14.52`, `1.14.51`
- `1.14.50`

</details>

**Latest Version**: `1.14.55`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnome.org/libgsf@1.14.55 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/glib`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.gsf

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/libgsf/package.yml)
- [Homepage](https://gitlab.gnome.org/GNOME/libgsf)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
