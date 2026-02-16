# vala

> Compiler for the GObject type system

## Package Information

- **Domain**: `gnome.org/vala`
- **Name**: `vala`
- **Homepage**: <https://wiki.gnome.org/Projects/Vala>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/vala/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnome.org/vala
```

## Programs

This package provides the following executable programs:

- `vala`
- `valac`
- `valadoc`
- `vala-gen-introspect`
- `vapigen`

## Available Versions

<details>
<summary>Show all 6 versions</summary>

- `0.56.18`, `0.56.17`, `0.56.16`, `0.56.15`, `0.56.14`
- `0.56.13`

</details>

**Latest Version**: `0.56.18`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +gnome.org/vala@0.56.18 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnome.org/glib`
- `graphviz.org`
- `freedesktop.org/pkg-config`
- `gnu.org/gettext`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.vala

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/vala/package.yml)
- [Homepage](https://wiki.gnome.org/Projects/Vala)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
