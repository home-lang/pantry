# libsecret

> Package from pantry: gnome.org/libsecret

## Package Information

- **Domain**: `gnome.org/libsecret`
- **Name**: `libsecret`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/libsecret/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install gnome.org/libsecret
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `gnome.org/glib`
- `gnupg.org/libgcrypt`
- `gnupg.org/libgpg-error`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libsecret

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/libsecret/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
