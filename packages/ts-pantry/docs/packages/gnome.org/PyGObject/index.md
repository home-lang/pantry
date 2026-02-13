# PyGObject

> Package from pantry: gnome.org/PyGObject

## Package Information

- **Domain**: `gnome.org/PyGObject`
- **Name**: `PyGObject`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/PyGObject/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnome.org/PyGObject
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `gnome.org/gobject-introspection`
- `cairographics.org/pycairo`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.PyGObject

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/PyGObject/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
