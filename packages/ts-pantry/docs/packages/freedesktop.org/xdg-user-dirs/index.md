# xdg-user-dirs

> Package from pantry: freedesktop.org/xdg-user-dirs

## Package Information

- **Domain**: `freedesktop.org/xdg-user-dirs`
- **Name**: `xdg-user-dirs`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/xdg-user-dirs/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install freedesktop.org/xdg-user-dirs
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Dependencies

This package depends on:

- `gnu.org/gettext^0.21`
- `gnu.org/libiconv^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry['xdg-user-dirs']

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/xdg-user-dirs/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
