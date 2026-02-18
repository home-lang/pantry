# g-ir

> Generate introspection data for GObject libraries

## Package Information

- **Domain**: `gnome.org/gobject-introspection`
- **Name**: `g-ir`
- **Homepage**: <https://gi.readthedocs.io/en/latest/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/gobject-introspection/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnome.org/gobject-introspection
```

## Programs

This package provides the following executable programs:

- `g-ir-annotation-tool`
- `g-ir-compiler`
- `g-ir-generate`
- `g-ir-inspect`
- `g-ir-scanner`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `1.86.0`
- `1.84.0`
- `1.83.4`, `1.83.2`
- `1.82.0`
- `1.72.0`

</details>

**Latest Version**: `1.86.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnome.org/gobject-introspection@1.86.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/glib@2`
- `sourceware.org/libffi@3`
- `gnu.org/bison^3 #NOTE macOS provides v2`
- `python.org>=3<3.12`
- `github.com/westes/flex@2`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['g-ir']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/gobject-introspection/package.yml)
- [Homepage](https://gi.readthedocs.io/en/latest/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
